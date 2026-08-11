/*
 * alpenglowed, framebuffer edition.
 *
 * The desktop as one program on /dev/fb0: the sky wallpaper computed from
 * the machine's own clock, rainmeter-style widgets (clock, system, name,
 * launcher) you can click and drag with the PS/2 mouse, and content panels
 * rendered from the files baked into the image. Keyboard drives the
 * launcher; `sh` exits with code 42 so init hands you the real console.
 *
 * i686, static. No toolkit, no dependencies — mmap the framebuffer, read
 * /dev/input/mice, draw glyphs from the kernel's own 8x16 font.
 */
#include <fcntl.h>
#include <linux/fb.h>
#include <poll.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/mman.h>
#include <termios.h>
#include <time.h>
#include <unistd.h>

#include "font8x16.h"

#define MAXW 1280
#define MAXH 800

static int fbfd = -1, mousefd = -1;
static unsigned int *fb, *bb; /* mapped fb, back buffer */
static int W, H, stride;      /* stride in pixels */
static struct termios saved_tio;

/* clip rect for damage-limited drawing */
static int cx0, cy0, cx1, cy1;
static void clip_all(void) { cx0 = 0; cy0 = 0; cx1 = W; cy1 = H; }
static void clip_set(int x, int y, int w, int h) {
  cx0 = x < 0 ? 0 : x; cy0 = y < 0 ? 0 : y;
  cx1 = x + w > W ? W : x + w; cy1 = y + h > H ? H : y + h;
}

static unsigned int mix(unsigned int a, unsigned int b, int t /*0..255*/) {
  unsigned int ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  unsigned int br = (b >> 16) & 255, bg = (b >> 8) & 255, bbl = b & 255;
  return (((ar + ((int)(br - ar) * t >> 8)) & 255) << 16) |
         (((ag + ((int)(bg - ag) * t >> 8)) & 255) << 8) |
         ((ab + ((int)(bbl - ab) * t >> 8)) & 255);
}

static void px(int x, int y, unsigned int c) {
  if (x >= cx0 && x < cx1 && y >= cy0 && y < cy1) bb[y * W + x] = c;
}
static void fill(int x, int y, int w, int h, unsigned int c) {
  int x0 = x < cx0 ? cx0 : x, y0 = y < cy0 ? cy0 : y;
  int x1 = x + w > cx1 ? cx1 : x + w, y1 = y + h > cy1 ? cy1 : y + h;
  for (int j = y0; j < y1; j++)
    for (int i = x0; i < x1; i++) bb[j * W + i] = c;
}
static void blend(int x, int y, int w, int h, unsigned int c, int a) {
  int x0 = x < cx0 ? cx0 : x, y0 = y < cy0 ? cy0 : y;
  int x1 = x + w > cx1 ? cx1 : x + w, y1 = y + h > cy1 ? cy1 : y + h;
  for (int j = y0; j < y1; j++)
    for (int i = x0; i < x1; i++) bb[j * W + i] = mix(bb[j * W + i], c, a);
}
static void ch8(int x, int y, unsigned char ch, unsigned int c, int scale) {
  const unsigned char *g = &font8x16[ch * 16];
  for (int r = 0; r < 16; r++)
    for (int b = 0; b < 8; b++)
      if (g[r] & (0x80 >> b)) {
        if (scale == 1) px(x + b, y + r, c);
        else fill(x + b * scale, y + r * scale, scale, scale, c);
      }
}
static int text(int x, int y, const char *s, unsigned int c, int scale) {
  int ox = x;
  for (; *s; s++) { ch8(x, y, (unsigned char)*s, c, scale); x += 8 * scale; }
  return x - ox;
}

/* ── the wallpaper: the sky, from the machine's clock ── */
static int hk_hour(void) { return (int)((time(0) / 3600 + 8) % 24); }
static int hk_min(void) { return (int)((time(0) / 60) % 60); }

static void sky_stops(int hour, unsigned int *top, unsigned int *bot,
                      unsigned int *acc) {
  if (hour >= 5 && hour < 8)  { *top = 0x2a1e33; *bot = 0xc96f4a; *acc = 0xf0b27a; }
  else if (hour < 12)         { *top = 0x1d3a5f; *bot = 0x7fb2d9; *acc = 0xffffff; }
  else if (hour < 15)         { *top = 0x2456a0; *bot = 0x9fc7e8; *acc = 0xffffff; }
  else if (hour < 18)         { *top = 0x27436e; *bot = 0xd99a5b; *acc = 0xf5d9a8; }
  else if (hour < 20)         { *top = 0x1d1230; *bot = 0xc4586e; *acc = 0xe8a8b8; }
  else                        { *top = 0x05060e; *bot = 0x141b2e; *acc = 0x8a9ab8; }
}

static void wallpaper(void) {
  unsigned int top, bot, acc;
  int hour = hk_hour();
  sky_stops(hour, &top, &bot, &acc);
  for (int y = cy0; y < cy1; y++) {
    unsigned int c = mix(top, bot, y * 255 / H);
    /* ordered dither so the gradient doesn't band on 8-bit ramps */
    for (int x = cx0; x < cx1; x++)
      bb[y * W + x] = ((x ^ y) & 3) == 0 ? mix(c, bot, 8) : c;
  }
  /* the sun (or the moon), riding the hour across the sky */
  int day = hour >= 6 && hour < 19;
  int t = ((hour + 24 - 6) % 24) * 60 + hk_min();       /* minutes since 06:00 */
  int sx = 60 + (long)(W - 120) * (day ? t : t - 780) / 780;
  int sy = H / 4 + (H / 6) - (H / 6) * ((sx - W / 2) * (sx - W / 2)) / ((W / 2) * (W / 2)) / 1;
  sy = H / 5 + (abs(sx - W / 2) * abs(sx - W / 2)) / (W * 2);
  unsigned int sun = day ? 0xfff2cc : 0xc9cfdd;
  for (int j = -14; j <= 14; j++)
    for (int i = -14; i <= 14; i++)
      if (i * i + j * j <= 14 * 14)
        px(sx + i, sy + j, i * i + j * j > 12 * 12 ? mix(sun, bb[(sy+j)*W + (sx+i>=W?W-1:(sx+i<0?0:sx+i))], 128) : sun);
  if (!day)  /* stars, deterministic */
    for (int k = 0; k < 90; k++) {
      int x = (k * 977 + 131) % W, y = ((k * 613 + 47) % (H * 2 / 3));
      px(x, y, k % 3 ? 0x556077 : 0x8a94aa);
    }
  (void)acc;
}

/* ── widgets ── */
typedef struct { int x, y, w, h; } Rect;
enum { W_CLOCK, W_SYS, W_NAME, W_LAUNCH, NWIDGET };
static Rect wid[NWIDGET];
static int panel_open = 0;         /* 0 none, else app index+1 */
static Rect panel = {0, 0, 0, 0};
static int scroll_row = 0;
static char query[64];
static int qlen = 0, sel = 0;
static int temple_mode = 0;

#define NAPP 9
static const char *app_names[NAPP] = {"about", "works",  "route", "before17",
                                      "activity", "sites", "docs",  "fetch", "sh"};
static const char *app_desc[NAPP] = {
    "who this machine belongs to",   "headline projects + the index",
    "airports, this year, at 17",    "the dial, in plain text",
    "github, baked into the image",  "the software; click to open a tab",
    "alpenglow's own documentation", "fastfetch, the real one",
    "the real console (exit returns)"};

static char content[NAPP > 6 ? 32768 : 0];
static char lines[400][200];
static unsigned int line_color[400];
static int nlines = 0;

/* sites rows for click handling */
static char site_urls[24][160];
static int site_rows[24], nsites = 0;

static void load_text(const char *path) {
  nlines = 0; nsites = 0;
  FILE *f = fopen(path, "r");
  if (!f) { snprintf(lines[0], 200, "missing: %s", path); line_color[0] = 0xff8888; nlines = 1; return; }
  char raw[512];
  while (fgets(raw, sizeof raw, f) && nlines < 400) {
    unsigned int color = temple_mode ? 0xffff55 : 0xd8dbe2;
    char *o = lines[nlines]; int ol = 0;
    for (char *p = raw; *p && ol < 198; p++) {
      if (*p == 27) { /* ANSI: read to letter, map the few we bake */
        char *q = p + 1;
        if (*q == '[') {
          q++; char code[16]; int cl = 0;
          while (*q && !((*q >= 'a' && *q <= 'z') || (*q >= 'A' && *q <= 'Z'))) { if (cl < 15) code[cl++] = *q; q++; }
          code[cl] = 0;
          if (*q == 'm') {
            if (!strcmp(code, "90")) color = 0x8890a0;
            else if (!strcmp(code, "96")) color = 0x7ec8e8;
            else if (!strcmp(code, "91")) color = 0xff8888;
            else if (!strcmp(code, "1;37")) color = 0xffffff;
            else color = temple_mode ? 0xffff55 : 0xd8dbe2;
          }
          p = q;
        } else if (*q == ']') { while (*q && *q != 7) q++; p = q; }
        continue;
      }
      if (*p == '\n' || *p == '\r') break;
      o[ol++] = *p;
    }
    o[ol] = 0;
    line_color[nlines] = color;
    /* remember sites rows: " NN) ... https://... " */
    char *paren = strstr(o, ") ");
    char *url = strstr(o, "https://");
    if (paren && url && nsites < 24) {
      int len = 0; while (url[len] && url[len] != ' ' && len < 158) len++;
      memcpy(site_urls[nsites], url, len); site_urls[nsites][len] = 0;
      site_rows[nsites] = nlines; nsites++;
    }
    nlines++;
  }
  fclose(f);
}

static void load_cmd(const char *cmd) {
  nlines = 0; nsites = 0;
  FILE *f = popen(cmd, "r");
  if (!f) return;
  char raw[512];
  while (fgets(raw, sizeof raw, f) && nlines < 400) {
    int ol = 0; char *o = lines[nlines];
    for (char *p = raw; *p && ol < 198; p++) {
      if (*p == 27) { while (*p && *p != 'm' && *p != 7) p++; continue; }
      if (*p == '\n' || *p == '\r') break;
      o[ol++] = *p;
    }
    o[ol] = 0; line_color[nlines] = 0xd8dbe2; nlines++;
  }
  pclose(f);
}

static char taglines[24][64];
static int ntag = 0, tag_i = 0;

static void widget_frame(Rect r, const char *title) {
  unsigned int surf = temple_mode ? 0x000080 : 0x10131c;
  blend(r.x + 4, r.y + 6, r.w, r.h, 0x000000, 90); /* shadow */
  blend(r.x, r.y, r.w, r.h, surf, 215);
  fill(r.x, r.y, r.w, 1, temple_mode ? 0x55ffff : 0x2a3040);
  fill(r.x, r.y + r.h - 1, r.w, 1, 0x1a1e2a);
  fill(r.x, r.y, 1, r.h, 0x1f2432);
  fill(r.x + r.w - 1, r.y, 1, r.h, 0x1f2432);
  if (title) text(r.x + 10, r.y + 6, title, temple_mode ? 0x55ffff : 0x707a90, 1);
}

static void draw_clock(void) {
  Rect r = wid[W_CLOCK];
  widget_frame(r, "hong kong");
  time_t t = time(0) + 8 * 3600;
  struct tm g; gmtime_r(&t, &g);
  char buf[32];
  snprintf(buf, sizeof buf, "%02d:%02d:%02d", g.tm_hour, g.tm_min, g.tm_sec);
  text(r.x + 12, r.y + 26, buf, 0xffffff, 2);
  static const char *dows[] = {"sun","mon","tue","wed","thu","fri","sat"};
  static const char *mons[] = {"jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"};
  snprintf(buf, sizeof buf, "%s %02d %s  gmt+8", dows[g.tm_wday], g.tm_mday, mons[g.tm_mon]);
  text(r.x + 12, r.y + 62, buf, 0x8890a0, 1);
}

static void draw_sys(void) {
  Rect r = wid[W_SYS];
  widget_frame(r, "machine");
  char buf[96];
  FILE *f = fopen("/proc/uptime", "r");
  double up = 0; if (f) { if (fscanf(f, "%lf", &up) != 1) up = 0; fclose(f); }
  long mt = 0, ma = 0;
  f = fopen("/proc/meminfo", "r");
  if (f) { char k[64]; long v;
    while (fscanf(f, "%63s %ld kB\n", k, &v) == 2) {
      if (!strcmp(k, "MemTotal:")) mt = v;
      if (!strcmp(k, "MemAvailable:")) ma = v; }
    fclose(f); }
  double load = 0; f = fopen("/proc/loadavg", "r");
  if (f) { if (fscanf(f, "%lf", &load) != 1) load = 0; fclose(f); }
  snprintf(buf, sizeof buf, "up %3ds   load %.2f", (int)up, load);
  text(r.x + 12, r.y + 26, buf, 0xd8dbe2, 1);
  snprintf(buf, sizeof buf, "mem %ld/%ldM", (mt - ma) / 1024, mt / 1024);
  text(r.x + 12, r.y + 44, buf, 0xd8dbe2, 1);
  text(r.x + 12, r.y + 62, "linux 7.1.3 i686 real", 0x8890a0, 1);
}

static void draw_name(void) {
  Rect r = wid[W_NAME];
  widget_frame(r, 0);
  text(r.x + 14, r.y + 12, "max carter", 0xffffff, 2);
  char tag[96];
  snprintf(tag, sizeof tag, "the ghost of terry davis, but %s",
           ntag ? taglines[tag_i % ntag] : "asian");
  text(r.x + 14, r.y + 50, tag, 0xaeb6c6, 1);
  text(r.x + 14, r.y + 70, "founding engineer at based hardware - omi", 0x8890a0, 1);
}

static int launch_matches[NAPP], nmatch = 0;
static void refilter(void) {
  nmatch = 0;
  for (int i = 0; i < NAPP; i++)
    if (!qlen || strstr(app_names[i], query)) launch_matches[nmatch++] = i;
  if (sel >= nmatch) sel = nmatch ? nmatch - 1 : 0;
}

static void draw_launcher(void) {
  Rect r = wid[W_LAUNCH];
  widget_frame(r, 0);
  text(r.x + 12, r.y + 10, ">", temple_mode ? 0x55ffff : 0x7ec8e8, 2);
  text(r.x + 34, r.y + 10, qlen ? query : "type to launch",
       qlen ? 0xffffff : 0x596074, 2);
  if (((int)(time(0) & 1))) fill(r.x + 36 + (qlen ? qlen * 16 : 0), r.y + 10, 2, 26, 0xffffff);
  for (int m = 0; m < nmatch; m++) {
    int i = launch_matches[m];
    int ry = r.y + 46 + m * 24;
    if (m == sel) blend(r.x + 6, ry - 3, r.w - 12, 22, 0xffffff, 26);
    text(r.x + 16, ry, app_names[i], m == sel ? 0xffffff : 0xc4cad6, 1);
    text(r.x + 140, ry, app_desc[i], 0x767e92, 1);
  }
}

static void draw_panel(void) {
  if (!panel_open) return;
  widget_frame(panel, app_names[panel_open - 1]);
  /* close button */
  text(panel.x + panel.w - 22, panel.y + 6, "x", 0x9aa2b2, 1);
  int rows = (panel.h - 40) / 18;
  for (int i = 0; i < rows; i++) {
    int li = scroll_row + i;
    if (li >= nlines) break;
    text(panel.x + 16, panel.y + 28 + i * 18, lines[li], line_color[li], 1);
  }
  if (nlines > rows) {
    char pos[24]; snprintf(pos, sizeof pos, "%d/%d  arrows scroll", scroll_row + 1, nlines);
    text(panel.x + panel.w - 200, panel.y + panel.h - 20, pos, 0x596074, 1);
  }
}

/* mouse cursor */
static int mx, my, mbtn;
static void draw_cursor(void) {
  static const char *arrow[] = {
    "X...........", "XX..........", "X.X.........", "X..X........",
    "X...X.......", "X....X......", "X.....X.....", "X......X....",
    "X.......X...", "X........X..", "X.....XXXXX.", "X..X..X.....",
    "X.X..X.X....", "XX...X.X....", "X.....X..X..", "......X..X..",
    ".......XX...", "............"};
  for (int r = 0; r < 18; r++)
    for (int c = 0; c < 12; c++)
      if (arrow[r][c] == 'X') {
        px(mx + c, my + r, 0xffffff);
        px(mx + c + 1, my + r + 1, 0x000000);
      }
}

static void composite(int x, int y, int w, int h) {
  clip_set(x, y, w, h);
  wallpaper();
  draw_clock(); draw_sys(); draw_name(); draw_launcher(); draw_panel();
  draw_cursor();
  /* flush the damaged strip */
  int x0 = x < 0 ? 0 : x, y0 = y < 0 ? 0 : y;
  int x1 = x + w > W ? W : x + w, y1 = y + h > H ? H : y + h;
  for (int j = y0; j < y1; j++)
    memcpy(fb + j * stride + x0, bb + j * W + x0, (size_t)(x1 - x0) * 4);
  clip_all();
}
static void composite_all(void) { composite(0, 0, W, H); }

static void open_app(int i);

static void run_selected(void) { if (nmatch) open_app(launch_matches[sel]); }

static void open_app(int i) {
  const char *name = app_names[i];
  if (!strcmp(name, "sh")) { exit(42); }
  panel = (Rect){W / 2 - 400, 110, 800, 540};
  scroll_row = 0;
  if (!strcmp(name, "fetch")) load_cmd("fastfetch 2>/dev/null");
  else if (!strcmp(name, "docs")) load_text("/readme.md");
  else {
    char path[128];
    snprintf(path, sizeof path, "/usr/share/alpenglowed/content/%s.txt", name);
    load_text(path);
  }
  panel_open = i + 1;
  qlen = 0; query[0] = 0; refilter();
  composite_all();
}

static void restore_tty(void) {
  tcsetattr(0, TCSANOW, &saved_tio);
  printf("\033[?25h");
}

int main(void) {
  fbfd = open("/dev/fb0", O_RDWR);
  if (fbfd < 0) return 1;
  struct fb_var_screeninfo vi;
  struct fb_fix_screeninfo fi;
  ioctl(fbfd, FBIOGET_VSCREENINFO, &vi);
  ioctl(fbfd, FBIOGET_FSCREENINFO, &fi);
  if (vi.bits_per_pixel != 32) return 1;
  W = vi.xres; H = vi.yres; stride = fi.line_length / 4;
  if (W > MAXW || H > MAXH) return 1;
  fb = mmap(0, (size_t)fi.line_length * H, PROT_READ | PROT_WRITE, MAP_SHARED, fbfd, 0);
  if (fb == MAP_FAILED) return 1;
  bb = malloc((size_t)W * H * 4);
  if (!bb) return 1;

  /* raw keyboard on the console; hide the fbcon cursor */
  tcgetattr(0, &saved_tio);
  atexit(restore_tty);
  struct termios tio = saved_tio;
  tio.c_lflag &= ~(ICANON | ECHO);
  tio.c_cc[VMIN] = 0; tio.c_cc[VTIME] = 0;
  tcsetattr(0, TCSANOW, &tio);
  printf("\033[?25l"); fflush(stdout);

  mousefd = open("/dev/input/mice", O_RDONLY | O_NONBLOCK);
  mx = W / 2; my = H / 2;

  /* taglines baked next to the content */
  FILE *tf = fopen("/usr/share/alpenglowed/content/taglines.txt", "r");
  if (tf) { while (ntag < 24 && fgets(taglines[ntag], 64, tf)) {
      taglines[ntag][strcspn(taglines[ntag], "\n")] = 0;
      if (taglines[ntag][0]) ntag++; }
    fclose(tf); }

  /* layout */
  wid[W_CLOCK] = (Rect){28, 26, 250, 92};
  wid[W_SYS] = (Rect){W - 28 - 250, 26, 250, 92};
  wid[W_NAME] = (Rect){28, H - 130, 420, 100};
  wid[W_LAUNCH] = (Rect){W / 2 - 270, 150, 540, 46 + NAPP * 24 + 8};
  refilter();
  clip_all();
  composite_all();

  struct pollfd fds[2] = {{0, POLLIN, 0}, {mousefd, POLLIN, 0}};
  int dragging = -1, drag_dx = 0, drag_dy = 0;
  time_t last_tick = 0;

  for (;;) {
    poll(fds, mousefd >= 0 ? 2 : 1, 250);

    /* keyboard */
    unsigned char k;
    while (read(0, &k, 1) == 1) {
      if (k == 27) { /* esc or arrow */
        unsigned char k2 = 0, k3 = 0;
        if (read(0, &k2, 1) == 1 && k2 == '[' && read(0, &k3, 1) == 1) {
          if (panel_open) {
            if (k3 == 'A' && scroll_row > 0) scroll_row--;
            if (k3 == 'B' && scroll_row < nlines - 1) scroll_row++;
            if (k3 == '5') { scroll_row -= 20; if (scroll_row < 0) scroll_row = 0; read(0, &k3, 1); }
            if (k3 == '6') { scroll_row += 20; if (scroll_row > nlines - 1) scroll_row = nlines - 1; read(0, &k3, 1); }
            composite(panel.x, panel.y, panel.w, panel.h);
          } else {
            if (k3 == 'A' && sel > 0) sel--;
            if (k3 == 'B' && sel < nmatch - 1) sel++;
            composite(wid[W_LAUNCH].x, wid[W_LAUNCH].y, wid[W_LAUNCH].w, wid[W_LAUNCH].h);
          }
        } else { /* bare esc */
          if (panel_open) { panel_open = 0; composite_all(); }
          else if (qlen) { qlen = 0; query[0] = 0; refilter(); composite(wid[W_LAUNCH].x, wid[W_LAUNCH].y, wid[W_LAUNCH].w, wid[W_LAUNCH].h); }
        }
      } else if (k == '\r' || k == '\n') {
        if (panel_open) { panel_open = 0; composite_all(); }
        else run_selected();
      } else if (k == 127 || k == 8) {
        if (qlen) { query[--qlen] = 0; refilter(); composite(wid[W_LAUNCH].x, wid[W_LAUNCH].y, wid[W_LAUNCH].w, wid[W_LAUNCH].h); }
      } else if (k >= 32 && k < 127 && qlen < 60 && !panel_open) {
        query[qlen++] = (char)k; query[qlen] = 0; sel = 0; refilter();
        composite(wid[W_LAUNCH].x, wid[W_LAUNCH].y, wid[W_LAUNCH].w, wid[W_LAUNCH].h);
      }
    }

    /* mouse */
    if (mousefd >= 0) {
      unsigned char pkt[3];
      int moved = 0, oldx = mx, oldy = my;
      while (read(mousefd, pkt, 3) == 3) {
        int dx = pkt[1] - ((pkt[0] & 0x10) ? 256 : 0);
        int dy = pkt[2] - ((pkt[0] & 0x20) ? 256 : 0);
        mx += dx; my -= dy;
        if (mx < 0) mx = 0; if (mx > W - 2) mx = W - 2;
        if (my < 0) my = 0; if (my > H - 2) my = H - 2;
        moved = 1;
        int btn = pkt[0] & 1;
        if (btn && !mbtn) { /* press */
          if (panel_open) {
            if (mx > panel.x + panel.w - 30 && mx < panel.x + panel.w &&
                my > panel.y && my < panel.y + 24) { panel_open = 0; composite_all(); }
            else if (nsites) { /* click a site row */
              int row = (my - panel.y - 28) / 18 + scroll_row;
              for (int s = 0; s < nsites; s++)
                if (site_rows[s] == row) {
                  FILE *ser = fopen("/dev/ttyS0", "w");
                  if (ser) { fprintf(ser, "@@open %s\n", site_urls[s]); fclose(ser); }
                }
            }
          } else {
            /* launcher rows */
            Rect lr = wid[W_LAUNCH];
            if (mx > lr.x && mx < lr.x + lr.w && my > lr.y + 43 && my < lr.y + 43 + nmatch * 24) {
              sel = (my - lr.y - 43) / 24; run_selected();
            } else {
              /* drag a widget by its body */
              for (int w0 = 0; w0 < NWIDGET; w0++)
                if (mx > wid[w0].x && mx < wid[w0].x + wid[w0].w &&
                    my > wid[w0].y && my < wid[w0].y + wid[w0].h) {
                  dragging = w0; drag_dx = mx - wid[w0].x; drag_dy = my - wid[w0].y;
                }
            }
          }
        }
        if (!btn) dragging = -1;
        mbtn = btn;
      }
      if (moved) {
        if (dragging >= 0) {
          Rect old = wid[dragging];
          wid[dragging].x = mx - drag_dx; wid[dragging].y = my - drag_dy;
          if (wid[dragging].x < 0) wid[dragging].x = 0;
          if (wid[dragging].y < 0) wid[dragging].y = 0;
          if (wid[dragging].x + wid[dragging].w > W) wid[dragging].x = W - wid[dragging].w;
          if (wid[dragging].y + wid[dragging].h > H) wid[dragging].y = H - wid[dragging].h;
          int ux = old.x < wid[dragging].x ? old.x : wid[dragging].x;
          int uy = old.y < wid[dragging].y ? old.y : wid[dragging].y;
          int ux1 = (old.x + old.w > wid[dragging].x + wid[dragging].w ? old.x + old.w : wid[dragging].x + wid[dragging].w);
          int uy1 = (old.y + old.h > wid[dragging].y + wid[dragging].h ? old.y + old.h : wid[dragging].y + wid[dragging].h);
          composite(ux - 6, uy - 6, ux1 - ux + 18, uy1 - uy + 20);
        } else {
          int ux = (oldx < mx ? oldx : mx) - 2, uy = (oldy < my ? oldy : my) - 2;
          int uw = (oldx > mx ? oldx : mx) - ux + 16, uh = (oldy > my ? oldy : my) - uy + 22;
          composite(ux, uy, uw, uh);
        }
      }
    }

    /* per-second widgets */
    time_t now = time(0);
    if (now != last_tick) {
      last_tick = now;
      if (now % 6 == 0) tag_i++;
      composite(wid[W_CLOCK].x, wid[W_CLOCK].y, wid[W_CLOCK].w, wid[W_CLOCK].h);
      composite(wid[W_SYS].x, wid[W_SYS].y, wid[W_SYS].w, wid[W_SYS].h);
      if (now % 6 == 0)
        composite(wid[W_NAME].x, wid[W_NAME].y, wid[W_NAME].w, wid[W_NAME].h);
      composite(wid[W_LAUNCH].x, wid[W_LAUNCH].y, wid[W_LAUNCH].w, 44); /* caret */
      /* the sky itself drifts once a minute */
      if (now % 60 == 0) composite_all();
    }
  }
}
