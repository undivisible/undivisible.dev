/*
 * kms.h — a minimal KMS client for runtime modeset.
 *
 * The compositor renders through /dev/fb0 (bochs-drm's fbdev framebuffer,
 * which is the GEM object in VRAM that the CRTC scans out). To resize the
 * screen at runtime, it opens /dev/dri/card0, becomes DRM master, finds the
 * CRTC + connector, and calls SETCRTC with a new mode but the SAME fb_id
 * (the fb0 framebuffer). The CRTC reprograms the Bochs VGA dispi registers,
 * changing the visible resolution, while the fb0 mmap stays valid — the
 * compositor keeps writing to it, and the CRTC keeps scanning it out.
 *
 * The fb0 framebuffer must be large enough for the new mode (boot at the max
 * resolution so the GEM object covers any resize target). SETCRTC reads
 * mode.hdisplay × mode.vdisplay pixels per row from the framebuffer using
 * the framebuffer's pitch, so a 1280-wide display from a 1920-wide
 * framebuffer works: the CRTC reads 1280 pixels, skips the rest, advances.
 *
 * No dumb buffers: bochs-drm's dumb_create allocates from system RAM (shmem),
 * not VRAM, so a dumb buffer's mmap is invisible to the VGA scanout. The fb0
 * GEM object IS in VRAM — that's why we render through it.
 */
#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <string.h>
#include <sys/ioctl.h>
#include <unistd.h>

typedef uint32_t __u32;
typedef uint16_t __u16;
typedef uint8_t __u8;
typedef uint64_t __u64;

#define DRM_DISPLAY_MODE_LEN 32

/* DRM UAPI structs (verified on the 32-bit guest: modeinfo=68, card_res=64,
   crtc=104, get_encoder=20, get_connector=80). Zig's musl sysroot has no
   drm.h, so they are defined here from the kernel's uapi/drm/drm_mode.h. */
struct drm_mode_modeinfo {
  __u32 clock;
  __u16 hdisplay, hsync_start, hsync_end, htotal, hskew;
  __u16 vdisplay, vsync_start, vsync_end, vtotal, vscan;
  __u32 vrefresh;
  __u32 flags;
  __u8 name[DRM_DISPLAY_MODE_LEN];
  __u32 type;
};

struct drm_mode_card_res {
  __u64 fb_id_ptr;
  __u64 crtc_id_ptr;
  __u64 connector_id_ptr;
  __u64 encoder_id_ptr;
  __u32 count_fbs;
  __u32 count_crtcs;
  __u32 count_connectors;
  __u32 count_encoders;
  __u32 min_width, max_width;
  __u32 min_height, max_height;
};

struct drm_mode_crtc {
  __u64 set_connectors_ptr;
  __u32 count_connectors;
  __u32 crtc_id;
  __u32 fb_id;
  __u32 x, y;
  __u32 gamma_size;
  __u32 mode_valid;
  struct drm_mode_modeinfo mode;
};

struct drm_mode_get_encoder {
  __u32 encoder_id;
  __u32 encoder_type;
  __u32 crtc_id;
  __u32 possible_crtcs;
  __u32 possible_clones;
};

struct drm_mode_get_connector {
  __u64 encoders_ptr;
  __u64 modes_ptr;
  __u64 props_ptr;
  __u64 prop_values_ptr;
  __u32 count_modes;
  __u32 count_props;
  __u32 count_encoders;
  __u32 encoder_id;
  __u32 connector_id;
  __u32 connector_type;
  __u32 connector_type_id;
  __u32 connection;
  __u32 mm_width, mm_height;
  __u32 subpixel;
  __u32 pad;
};

#define DRM_IOCTL_SET_MASTER _IO('d', 0x1e)
#define DRM_IOCTL_MODE_GETRESOURCES _IOWR('d', 0xa0, struct drm_mode_card_res)
#define DRM_IOCTL_MODE_GETCRTC _IOWR('d', 0xa1, struct drm_mode_crtc)
#define DRM_IOCTL_MODE_SETCRTC _IOWR('d', 0xa2, struct drm_mode_crtc)
#define DRM_IOCTL_MODE_GETENCODER _IOWR('d', 0xa6, struct drm_mode_get_encoder)
#define DRM_IOCTL_MODE_GETCONNECTOR _IOWR('d', 0xa7, struct drm_mode_get_connector)

#define DRM_MODE_CONNECTOR_CONNECTED 1

#define DRM_MODE_FLAG_PHSYNC (1 << 0)
#define DRM_MODE_FLAG_PVSYNC (1 << 2)
#define DRM_MODE_TYPE_DRIVER 64

typedef struct {
  int fd;
  __u32 crtc_id, connector_id;
  __u32 fb_id; /* the fb0 framebuffer's KMS id, from GETCRTC */
} Kms;

static void kms_make_mode(struct drm_mode_modeinfo *m, int w, int h) {
  memset(m, 0, sizeof *m);
  m->clock = 60000;
  m->hdisplay = w; m->hsync_start = w + 24; m->hsync_end = w + 28;
  m->htotal = w + 32;
  m->vdisplay = h; m->vsync_start = h + 1; m->vsync_end = h + 4;
  m->vtotal = h + 8;
  m->flags = DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC;
  m->type = DRM_MODE_TYPE_DRIVER;
  snprintf((char *)m->name, sizeof m->name, "%dx%d", w, h);
}

/* Open card0, become master, find the connected connector + CRTC, and
   read the current fb_id (the fb0 framebuffer the kernel set up at boot). */
static int kms_open(Kms *k) {
  memset(k, 0, sizeof *k);
  k->fd = open("/dev/dri/card0", O_RDWR);
  if (k->fd < 0) return -1;
  ioctl(k->fd, DRM_IOCTL_SET_MASTER);

  __u32 fb_ids[16], crtc_ids[16], conns[16], enc_ids[16];
  struct drm_mode_card_res res;
  memset(&res, 0, sizeof res);
  res.fb_id_ptr = (uintptr_t)fb_ids;
  res.crtc_id_ptr = (uintptr_t)crtc_ids;
  res.connector_id_ptr = (uintptr_t)conns;
  res.encoder_id_ptr = (uintptr_t)enc_ids;
  res.count_fbs = 16; res.count_crtcs = 16;
  res.count_connectors = 16; res.count_encoders = 16;
  if (ioctl(k->fd, DRM_IOCTL_MODE_GETRESOURCES, &res) < 0) {
    close(k->fd); k->fd = -1; return -1;
  }
  __u32 ncrtc = res.count_crtcs;

  for (__u32 i = 0; i < res.count_connectors; i++) {
    struct drm_mode_get_connector c;
    memset(&c, 0, sizeof c);
    c.connector_id = conns[i];
    if (ioctl(k->fd, DRM_IOCTL_MODE_GETCONNECTOR, &c) < 0) continue;
    if (c.connection != DRM_MODE_CONNECTOR_CONNECTED) continue;
    if (c.encoder_id == 0) continue;
    struct drm_mode_get_encoder enc;
    memset(&enc, 0, sizeof enc);
    enc.encoder_id = c.encoder_id;
    if (ioctl(k->fd, DRM_IOCTL_MODE_GETENCODER, &enc) < 0) continue;
    k->connector_id = conns[i];
    if (enc.crtc_id != 0) { k->crtc_id = enc.crtc_id; break; }
    if (ncrtc > 0) { k->crtc_id = crtc_ids[0]; break; }
  }
  if (k->connector_id == 0 || k->crtc_id == 0) {
    close(k->fd); k->fd = -1; return -1;
  }

  /* Read the current CRTC to get the fb_id (the fb0 framebuffer). */
  struct drm_mode_crtc crtc;
  memset(&crtc, 0, sizeof crtc);
  crtc.crtc_id = k->crtc_id;
  if (ioctl(k->fd, DRM_IOCTL_MODE_GETCRTC, &crtc) < 0) {
    close(k->fd); k->fd = -1; return -1;
  }
  k->fb_id = crtc.fb_id;
  if (k->fb_id == 0) {
    close(k->fd); k->fd = -1; return -1;
  }
  return 0;
}

/* SETCRTC to a new mode, keeping the same fb_id. The fb0 mmap is still
   valid — the CRTC reads from it at the new resolution using the fb's
   pitch. Returns 0 on success. */
static int kms_modeset(Kms *k, int w, int h) {
  struct drm_mode_crtc crtc;
  memset(&crtc, 0, sizeof crtc);
  crtc.crtc_id = k->crtc_id;
  crtc.fb_id = k->fb_id;
  crtc.x = 0; crtc.y = 0;
  crtc.set_connectors_ptr = (uintptr_t)&k->connector_id;
  crtc.count_connectors = 1;
  crtc.mode_valid = 1;
  kms_make_mode(&crtc.mode, w, h);
  return ioctl(k->fd, DRM_IOCTL_MODE_SETCRTC, &crtc);
}

static void kms_close(Kms *k) {
  if (k->fd >= 0) { close(k->fd); k->fd = -1; }
}
