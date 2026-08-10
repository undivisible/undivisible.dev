/*
 * alpenglowd — the compositor and the bar.
 *
 * This is alpenglowed as tschk wrote it, shrunk to a framebuffer: there is
 * no wallpaper full of icons and no taskbar, only a bar that does
 * everything. Type to fuzzy-match a program on PATH or one of the built-in
 * apps; `> cmd` runs a shell command; Enter launches.
 *
 * It owns exactly three things: /dev/fb0, the PS/2 mouse, and the console
 * keyboard. Everything else on the screen — the clock, the machine monitor,
 * the name card, every app panel — is a separate process holding a surface
 * it drew itself. See wire.h.
 *
 * i686, static, no toolkit. `sh` exits 42 so init hands over the console.
 */
#include <dirent.h>
#include <errno.h>
#include <fcntl.h>
#include <linux/fb.h>
#include <poll.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/mman.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/un.h>
#include <sys/wait.h>
#include <termios.h>
#include <time.h>
#include <unistd.h>

#include "draw.h"
#include "wire.h"

#define MAXW 1280
#define MAXH 800
#define MAXSURF 24
#define MAXAPP 512

static int fbfd = -1, mousefd = -1, lfd = -1;
static unsigned int *fb;
static AwBuf back;
static int W, H, stride;
static struct termios saved_tio;

typedef struct {
  int fd;
  int id;
  int x, y, w, h;
  int alpha;
  unsigned int *px;
  char title[80];
  int alive;
  int bg;
} Surface;

static Surface surf[MAXSURF];
static int nsurf = 0, next_id = 1, focus = -1;

/* ── the wallpaper: the sky, from the machine's own clock ── */
static int hk_hour(void) { return (int)((time(0) / 3600 + 8) % 24); }
static int hk_min(void) { return (int)((time(0) / 60) % 60); }

static void sky_stops(int hour, unsigned int *top, unsigned int *bot) {
  if (hour >= 5 && hour < 8)  { *top = 0x2a1e33; *bot = 0xc96f4a; }
  else if (hour < 12)         { *top = 0x1d3a5f; *bot = 0x7fb2d9; }
  else if (hour < 15)         { *top = 0x2456a0; *bot = 0x9fc7e8; }
  else if (hour < 18)         { *top = 0x27436e; *bot = 0xd99a5b; }
  else if (hour < 20)         { *top = 0x1d1230; *bot = 0xc4586e; }
  else                        { *top = 0x05060e; *bot = 0x141b2e; }
}

static int dx0, dy0, dx1, dy1;

static void wallpaper(void) {
  unsigned int top, bot;
  int hour = hk_hour();
  sky_stops(hour, &top, &bot);
  for (int y = dy0; y < dy1; y++) {
    unsigned int c = aw_mix(top, bot, y * 255 / H);
    for (int x = dx0; x < dx1; x++)
      back.px[y * W + x] = ((x ^ y) & 3) == 0 ? aw_mix(c, bot, 8) : c;
  }
  int day = hour >= 6 && hour < 19;
  int t = ((hour + 24 - 6) % 24) * 60 + hk_min();
  int sx = 60 + (long)(W - 120) * (day ? t : t - 780) / 780;
  int sy = H / 5 + (abs(sx - W / 2) * abs(sx - W / 2)) / (W * 2);
  unsigned int sun = day ? 0xfff2cc : 0xc9cfdd;
  for (int j = -14; j <= 14; j++)
    for (int i = -14; i <= 14; i++) {
      int px_ = sx + i, py = sy + j;
      if (i * i + j * j > 14 * 14) continue;
      if (px_ < dx0 || px_ >= dx1 || py < dy0 || py >= dy1) continue;
      back.px[py * W + px_] =
          i * i + j * j > 12 * 12 ? aw_mix(sun, back.px[py * W + px_], 128) : sun;
    }
  if (!day)
    for (int k = 0; k < 90; k++) {
      int x = (k * 977 + 131) % W, y = ((k * 613 + 47) % (H * 2 / 3));
      if (x < dx0 || x >= dx1 || y < dy0 || y >= dy1) continue;
      back.px[y * W + x] = k % 3 ? 0x556077 : 0x8a94aa;
    }
}

/* ── the bar ── */
static char query[80];
static int qlen = 0, sel = 0;
static int bar_x, bar_y, bar_w;

typedef struct {
  char name[64];
  char desc[64];
  int builtin;
} App;

static App apps[MAXAPP];
static int napp = 0;

static const char *builtin_desc(const char *n) {
  if (!strcmp(n, "about")) return "who this machine belongs to";
  if (!strcmp(n, "works")) return "headline projects + the index";
  if (!strcmp(n, "route")) return "airports, this year, at 17";
  if (!strcmp(n, "before17")) return "the dial, in plain text";
  if (!strcmp(n, "activity")) return "github, baked into the image";
  if (!strcmp(n, "sites")) return "the software; click to open a tab";
  if (!strcmp(n, "docs")) return "alpenglow's own documentation";
  if (!strcmp(n, "fetch")) return "fastfetch, the real one";
  if (!strcmp(n, "sh")) return "the real console (exit returns)";
  return "";
}

static void add_app(const char *name, const char *desc, int builtin) {
  if (napp >= MAXAPP) return;
  for (int i = 0; i < napp; i++)
    if (!strcmp(apps[i].name, name)) return;
  snprintf(apps[napp].name, sizeof apps[napp].name, "%s", name);
  snprintf(apps[napp].desc, sizeof apps[napp].desc, "%s", desc);
  apps[napp].builtin = builtin;
  napp++;
}

static void scan_apps(void) {
  static const char *names[] = {"about", "works", "route", "before17",
                                "activity", "sites", "docs", "fetch", "sh"};
  for (unsigned i = 0; i < sizeof names / sizeof *names; i++)
    add_app(names[i], builtin_desc(names[i]), 1);

  static const char *dirs[] = {"/bin", "/usr/bin", "/usr/local/bin"};
  for (unsigned d = 0; d < sizeof dirs / sizeof *dirs; d++) {
    DIR *dp = opendir(dirs[d]);
    if (!dp) continue;
    struct dirent *e;
    while ((e = readdir(dp))) {
      if (e->d_name[0] == '.') continue;
      char path[288];
      snprintf(path, sizeof path, "%s/%s", dirs[d], e->d_name);
      if (access(path, X_OK) != 0) continue;
      add_app(e->d_name, dirs[d], 0);
    }
    closedir(dp);
  }
}

static int matches[MAXAPP], nmatch = 0;

/* Subsequence match, the way every launcher worth using does it. */
static int fuzzy(const char *hay, const char *needle) {
  if (!*needle) return 1;
  const char *n = needle;
  for (const char *h = hay; *h; h++)
    if (*h == *n && !*++n) return 1;
  return 0;
}

/* Rank exact over prefix over subsequence, builtins ahead of PATH, so
   typing `vro` doesn't put `pivot_root` above it. */
static int rank(const App *a) {
  if (!qlen) return a->builtin ? 0 : 4;
  if (!strcmp(a->name, query)) return 0;
  if (!strncmp(a->name, query, (size_t)qlen)) return a->builtin ? 1 : 2;
  if (fuzzy(a->name, query)) return a->builtin ? 3 : 5;
  return -1;
}

static void refilter(void) {
  nmatch = 0;
  for (int tier = 0; tier <= 5 && nmatch < 9; tier++)
    for (int i = 0; i < napp && nmatch < 9; i++)
      if (rank(&apps[i]) == tier) matches[nmatch++] = i;
  if (sel >= nmatch) sel = nmatch ? nmatch - 1 : 0;
}

static int bar_h(void) { return 46 + (nmatch ? nmatch * 24 + 8 : 0); }

static void draw_bar(void) {
  int h = bar_h();
  aw_blend(&back, bar_x + 4, bar_y + 6, bar_w, h, 0x000000, 90);
  aw_blend(&back, bar_x, bar_y, bar_w, h, 0x10131c, 215);
  aw_fill(&back, bar_x, bar_y, bar_w, 1, 0x2a3040);
  aw_fill(&back, bar_x, bar_y + h - 1, bar_w, 1, 0x1a1e2a);
  aw_fill(&back, bar_x, bar_y, 1, h, 0x1f2432);
  aw_fill(&back, bar_x + bar_w - 1, bar_y, 1, h, 0x1f2432);

  aw_text(&back, bar_x + 12, bar_y + 10, ">", 0x7ec8e8, 2);
  /* Long queries drop to one-up so a pasted command still fits the bar. */
  int room = bar_w - 46;
  int scale = qlen * 16 > room ? 1 : 2;
  int shown = room / (8 * scale);
  const char *q = query;
  if (qlen > shown) q = query + (qlen - shown);
  aw_text(&back, bar_x + 34, bar_y + (scale == 2 ? 10 : 18),
          qlen ? q : "type to launch", qlen ? 0xffffff : 0x596074, scale);
  if ((int)(time(0) & 1)) {
    int used = (qlen > shown ? shown : qlen) * 8 * scale;
    aw_fill(&back, bar_x + 36 + used, bar_y + 10, 2, 26, 0xffffff);
  }

  for (int m = 0; m < nmatch; m++) {
    App *a = &apps[matches[m]];
    int ry = bar_y + 46 + m * 24;
    if (m == sel) aw_blend(&back, bar_x + 6, ry - 3, bar_w - 12, 22, 0xffffff, 26);
    aw_text(&back, bar_x + 16, ry, a->name, m == sel ? 0xffffff : 0xc4cad6, 1);
    aw_text(&back, bar_x + 180, ry, a->desc, 0x767e92, 1);
  }
}

/* ── cursor ── */
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
        if (mx + c >= dx0 && mx + c < dx1 && my + r >= dy0 && my + r < dy1)
          back.px[(my + r) * W + mx + c] = 0xffffff;
        if (mx + c + 1 >= dx0 && mx + c + 1 < dx1 && my + r + 1 >= dy0 &&
            my + r + 1 < dy1)
          back.px[(my + r + 1) * W + mx + c + 1] = 0x000000;
      }
}

static void blit_surface(Surface *s) {
  int x0 = s->x < dx0 ? dx0 : s->x, y0 = s->y < dy0 ? dy0 : s->y;
  int x1 = s->x + s->w > dx1 ? dx1 : s->x + s->w;
  int y1 = s->y + s->h > dy1 ? dy1 : s->y + s->h;
  for (int j = y0; j < y1; j++)
    for (int i = x0; i < x1; i++) {
      unsigned int c = s->px[(j - s->y) * s->w + (i - s->x)];
      back.px[j * W + i] = s->alpha >= 255
                               ? c
                               : aw_mix(back.px[j * W + i], c, s->alpha);
    }
}

static void composite(int x, int y, int w, int h) {
  dx0 = x < 0 ? 0 : x;
  dy0 = y < 0 ? 0 : y;
  dx1 = x + w > W ? W : x + w;
  dy1 = y + h > H ? H : y + h;
  if (dx0 >= dx1 || dy0 >= dy1) return;
  /* The sky is a client too. Only draw it here if that client isn't up —
     during boot, or if it died. */
  int have_bg = 0;
  for (int i = 0; i < nsurf; i++)
    if (surf[i].alive && surf[i].px && surf[i].bg) have_bg = 1;
  if (!have_bg) wallpaper();
  for (int i = 0; i < nsurf; i++)
    if (surf[i].alive && surf[i].px && surf[i].bg) blit_surface(&surf[i]);
  for (int i = 0; i < nsurf; i++)
    if (surf[i].alive && surf[i].px && !surf[i].bg) blit_surface(&surf[i]);
  draw_bar();
  draw_cursor();
  for (int j = dy0; j < dy1; j++)
    memcpy(fb + j * stride + dx0, back.px + j * W + dx0,
           (size_t)(dx1 - dx0) * 4);
  dx0 = 0; dy0 = 0; dx1 = W; dy1 = H;
}

static void composite_all(void) { composite(0, 0, W, H); }

static void damage_surface(Surface *s) {
  composite(s->x - 6, s->y - 6, s->w + 18, s->h + 20);
}

/* ── clients ── */
static void drop_surface(int i) {
  if (surf[i].px) munmap(surf[i].px, (size_t)surf[i].w * surf[i].h * 4);
  char path[128];
  snprintf(path, sizeof path, "%s/s%d", AW_DIR, surf[i].id);
  unlink(path);
  close(surf[i].fd);
  Surface gone = surf[i];
  for (int j = i; j < nsurf - 1; j++) surf[j] = surf[j + 1];
  nsurf--;
  if (focus == gone.id) focus = -1;
  composite(gone.x - 6, gone.y - 6, gone.w + 18, gone.h + 20);
}

static int send_msg(int fd, const AwMsg *m) {
  return write(fd, m, sizeof *m) == (long)sizeof *m ? 0 : -1;
}

static void handle_hello(Surface *s, const AwMsg *m) {
  int w = m->a, h = m->b;
  if (m->type == AW_HELLO_BG) { w = W; h = H; }
  if (w < 8 || h < 8 || w > MAXW || h > MAXH) { s->alive = 0; return; }
  char path[128];
  snprintf(path, sizeof path, "%s/s%d", AW_DIR, s->id);
  int f = open(path, O_RDWR | O_CREAT | O_TRUNC, 0600);
  if (f < 0) { s->alive = 0; return; }
  if (ftruncate(f, (long)w * h * 4) < 0) { close(f); s->alive = 0; return; }
  void *px = mmap(0, (size_t)w * h * 4, PROT_READ | PROT_WRITE, MAP_SHARED, f, 0);
  close(f);
  if (px == MAP_FAILED) { s->alive = 0; return; }
  s->px = (unsigned int *)px;
  s->w = w;
  s->h = h;
  s->bg = m->type == AW_HELLO_BG;
  if (s->bg) {
    s->x = 0;
    s->y = 0;
  } else {
    s->x = m->c == AW_CENTER ? (W - w) / 2 : (m->c < 0 ? W + m->c - w : m->c);
    s->y = m->d == AW_CENTER ? (H - h) / 2 : (m->d < 0 ? H + m->d - h : m->d);
  }
  s->alpha = s->bg ? 255 : 215;
  snprintf(s->title, sizeof s->title, "%s", m->s);

  AwMsg r;
  memset(&r, 0, sizeof r);
  r.type = AW_SURFACE;
  r.a = w;
  r.b = h;
  r.c = s->id;
  snprintf(r.s, sizeof r.s, "%s", path);
  if (send_msg(s->fd, &r) < 0) s->alive = 0;
}

static void spawn(const char *prog, const char *arg) {
  pid_t p = fork();
  if (p != 0) return;
  setsid();
  int devnull = open("/dev/null", O_RDWR);
  if (devnull >= 0) { dup2(devnull, 0); dup2(devnull, 1); dup2(devnull, 2); }
  if (arg) execl(prog, prog, arg, (char *)0);
  else execl(prog, prog, (char *)0);
  _exit(127);
}

/* A console program can't share the screen with a compositor that owns the
   framebuffer, so it takes the whole tty: exit 43 and init runs it, then
   starts us again. Same trade the `sh` app has always made. */
static void hand_over(const char *cmd) {
  char path[128];
  snprintf(path, sizeof path, "%s/exec", AW_DIR);
  FILE *f = fopen(path, "w");
  if (!f) return;
  fprintf(f, "%s\n", cmd);
  fclose(f);
  exit(43);
}

static void launch(int app_index) {
  App *a = &apps[app_index];
  if (!strcmp(a->name, "sh")) exit(42);
  if (a->builtin) spawn("/usr/bin/alpenpanel", a->name);
  else {
    char path[288];
    snprintf(path, sizeof path, "%s/%s", a->desc, a->name);
    hand_over(path);
  }
  qlen = 0;
  query[0] = 0;
  sel = 0;
  refilter();
  composite_all();
}

static void restore_tty(void) {
  tcsetattr(0, TCSANOW, &saved_tio);
  printf("\033[?25h");
}

static void reap(int sig) {
  (void)sig;
  while (waitpid(-1, 0, WNOHANG) > 0) {}
}

int main(void) {
  fbfd = open("/dev/fb0", O_RDWR);
  if (fbfd < 0) return 1;
  struct fb_var_screeninfo vi;
  struct fb_fix_screeninfo fi;
  ioctl(fbfd, FBIOGET_VSCREENINFO, &vi);
  ioctl(fbfd, FBIOGET_FSCREENINFO, &fi);
  if (vi.bits_per_pixel != 32) return 1;
  W = vi.xres;
  H = vi.yres;
  stride = fi.line_length / 4;
  if (W > MAXW || H > MAXH) return 1;
  fb = mmap(0, (size_t)fi.line_length * H, PROT_READ | PROT_WRITE, MAP_SHARED,
            fbfd, 0);
  if (fb == MAP_FAILED) return 1;
  back.px = malloc((size_t)W * H * 4);
  back.w = W;
  back.h = H;
  if (!back.px) return 1;

  signal(SIGCHLD, reap);
  signal(SIGPIPE, SIG_IGN);

  mkdir(AW_DIR, 0755);
  unlink(AW_SOCK);
  lfd = socket(AF_UNIX, SOCK_STREAM, 0);
  struct sockaddr_un addr;
  memset(&addr, 0, sizeof addr);
  addr.sun_family = AF_UNIX;
  snprintf(addr.sun_path, sizeof addr.sun_path, "%s", AW_SOCK);
  if (bind(lfd, (struct sockaddr *)&addr, sizeof addr) < 0) return 1;
  listen(lfd, 8);

  tcgetattr(0, &saved_tio);
  atexit(restore_tty);
  struct termios tio = saved_tio;
  tio.c_lflag &= ~(ICANON | ECHO);
  tio.c_cc[VMIN] = 0;
  tio.c_cc[VTIME] = 0;
  tcsetattr(0, TCSANOW, &tio);
  printf("\033[?25l");
  fflush(stdout);

  mousefd = open("/dev/input/mice", O_RDONLY | O_NONBLOCK);
  mx = W / 2;
  my = H / 2;

  scan_apps();
  refilter();
  bar_w = 540;
  bar_x = W / 2 - bar_w / 2;
  bar_y = 150;
  composite_all();

  /* The widgets are not part of this program; they are its clients. */
  spawn("/usr/bin/alpenwall", 0);
  spawn("/usr/bin/alpenclock", 0);
  spawn("/usr/bin/alpenmachine", 0);
  spawn("/usr/bin/alpenname", 0);

  int dragging = -1, drag_dx = 0, drag_dy = 0;
  time_t last_tick = 0;

  for (;;) {
    struct pollfd fds[3 + MAXSURF];
    int nfds = 0;
    fds[nfds].fd = 0; fds[nfds].events = POLLIN; fds[nfds++].revents = 0;
    fds[nfds].fd = lfd; fds[nfds].events = POLLIN; fds[nfds++].revents = 0;
    int mouse_slot = -1;
    if (mousefd >= 0) {
      mouse_slot = nfds;
      fds[nfds].fd = mousefd; fds[nfds].events = POLLIN; fds[nfds++].revents = 0;
    }
    int first_surf = nfds;
    for (int i = 0; i < nsurf; i++) {
      fds[nfds].fd = surf[i].fd;
      fds[nfds].events = POLLIN;
      fds[nfds++].revents = 0;
    }
    poll(fds, nfds, 250);

    if (fds[1].revents & POLLIN) {
      int cfd = accept(lfd, 0, 0);
      if (cfd >= 0) {
        if (nsurf >= MAXSURF) close(cfd);
        else {
          memset(&surf[nsurf], 0, sizeof surf[nsurf]);
          surf[nsurf].fd = cfd;
          surf[nsurf].id = next_id++;
          surf[nsurf].alive = 1;
          nsurf++;
        }
      }
    }

    for (int i = nsurf - 1; i >= 0; i--) {
      int slot = first_surf + i;
      if (slot >= nfds || !(fds[slot].revents & POLLIN)) continue;
      AwMsg m;
      long n = read(surf[i].fd, &m, sizeof m);
      if (n != (long)sizeof m) { drop_surface(i); continue; }
      if (m.type == AW_HELLO || m.type == AW_HELLO_BG) {
        handle_hello(&surf[i], &m);
        if (!surf[i].alive) { drop_surface(i); continue; }
        damage_surface(&surf[i]);
      } else if (m.type == AW_COMMIT) {
        damage_surface(&surf[i]);
      } else if (m.type == AW_MOVE) {
        Surface old = surf[i];
        surf[i].x = m.a;
        surf[i].y = m.b;
        composite(old.x - 6, old.y - 6, old.w + 18, old.h + 20);
        damage_surface(&surf[i]);
      } else if (m.type == AW_CLOSE) {
        drop_surface(i);
      }
    }

    unsigned char k;
    while (read(0, &k, 1) == 1) {
      if (focus >= 0) {
        int fi2 = -1;
        for (int i = 0; i < nsurf; i++) if (surf[i].id == focus) fi2 = i;
        if (fi2 < 0) focus = -1;
        else if (k == 27) {
          unsigned char k2 = 0, k3 = 0;
          if (read(0, &k2, 1) == 1 && k2 == '[' && read(0, &k3, 1) == 1) {
            AwMsg e;
            memset(&e, 0, sizeof e);
            e.type = AW_INPUT;
            e.a = AW_IN_KEY;
            e.d = 0x100 + k3;
            send_msg(surf[fi2].fd, &e);
          } else {
            focus = -1;
          }
          continue;
        } else {
          AwMsg e;
          memset(&e, 0, sizeof e);
          e.type = AW_INPUT;
          e.a = AW_IN_KEY;
          e.d = k;
          send_msg(surf[fi2].fd, &e);
          continue;
        }
      }
      if (k == 27) {
        unsigned char k2 = 0, k3 = 0;
        if (read(0, &k2, 1) == 1 && k2 == '[' && read(0, &k3, 1) == 1) {
          if (k3 == 'A' && sel > 0) sel--;
          if (k3 == 'B' && sel < nmatch - 1) sel++;
          composite(bar_x, bar_y, bar_w, bar_h() + 8);
        } else if (qlen) {
          qlen = 0;
          query[0] = 0;
          refilter();
          composite_all();
        }
      } else if (k == '\r' || k == '\n') {
        if (qlen > 1 && query[0] == '>') hand_over(query + 1);
        else if (nmatch) launch(matches[sel]);
      } else if (k == 127 || k == 8) {
        if (qlen) {
          query[--qlen] = 0;
          refilter();
          composite_all();
        }
      } else if (k >= 32 && k < 127 && qlen < 70) {
        query[qlen++] = (char)k;
        query[qlen] = 0;
        sel = 0;
        refilter();
        composite_all();
      }
    }

    if (mouse_slot >= 0) {
      unsigned char pkt[3];
      int moved = 0, oldx = mx, oldy = my;
      while (read(mousefd, pkt, 3) == 3) {
        int ddx = pkt[1] - ((pkt[0] & 0x10) ? 256 : 0);
        int ddy = pkt[2] - ((pkt[0] & 0x20) ? 256 : 0);
        mx += ddx;
        my -= ddy;
        if (mx < 0) mx = 0;
        if (mx > W - 2) mx = W - 2;
        if (my < 0) my = 0;
        if (my > H - 2) my = H - 2;
        moved = 1;
        int btn = pkt[0] & 1;
        if (btn && !mbtn) {
          int bh = bar_h();
          if (mx >= bar_x && mx < bar_x + bar_w && my >= bar_y &&
              my < bar_y + bh) {
            focus = -1;
            if (my > bar_y + 43 && nmatch) {
              int row = (my - bar_y - 43) / 24;
              if (row >= 0 && row < nmatch) { sel = row; launch(matches[sel]); }
            }
          } else {
            int hit = -1;
            for (int i = nsurf - 1; i >= 0; i--)
              if (surf[i].alive && surf[i].px && !surf[i].bg && mx >= surf[i].x &&
                  mx < surf[i].x + surf[i].w && my >= surf[i].y &&
                  my < surf[i].y + surf[i].h) { hit = i; break; }
            if (hit < 0) {
              focus = -1;
            } else {
              focus = surf[hit].id;
              if (hit != nsurf - 1) {
                Surface top = surf[hit];
                for (int j = hit; j < nsurf - 1; j++) surf[j] = surf[j + 1];
                surf[nsurf - 1] = top;
                hit = nsurf - 1;
              }
              /* The top strip is the handle; the rest belongs to the app. */
              if (my < surf[hit].y + 20) {
                dragging = hit;
                drag_dx = mx - surf[hit].x;
                drag_dy = my - surf[hit].y;
              } else {
                AwMsg e;
                memset(&e, 0, sizeof e);
                e.type = AW_INPUT;
                e.a = AW_IN_PRESS;
                e.b = mx - surf[hit].x;
                e.c = my - surf[hit].y;
                send_msg(surf[hit].fd, &e);
              }
              damage_surface(&surf[hit]);
            }
          }
        }
        if (!btn && mbtn && dragging < 0 && focus >= 0) {
          for (int i = 0; i < nsurf; i++)
            if (surf[i].id == focus) {
              AwMsg e;
              memset(&e, 0, sizeof e);
              e.type = AW_INPUT;
              e.a = AW_IN_RELEASE;
              e.b = mx - surf[i].x;
              e.c = my - surf[i].y;
              send_msg(surf[i].fd, &e);
            }
        }
        if (!btn) dragging = -1;
        mbtn = btn;
      }
      if (moved) {
        if (dragging >= 0) {
          Surface old = surf[dragging];
          surf[dragging].x = mx - drag_dx;
          surf[dragging].y = my - drag_dy;
          if (surf[dragging].x < 0) surf[dragging].x = 0;
          if (surf[dragging].y < 0) surf[dragging].y = 0;
          if (surf[dragging].x + surf[dragging].w > W)
            surf[dragging].x = W - surf[dragging].w;
          if (surf[dragging].y + surf[dragging].h > H)
            surf[dragging].y = H - surf[dragging].h;
          int ux = old.x < surf[dragging].x ? old.x : surf[dragging].x;
          int uy = old.y < surf[dragging].y ? old.y : surf[dragging].y;
          int ux1 = old.x + old.w > surf[dragging].x + surf[dragging].w
                        ? old.x + old.w
                        : surf[dragging].x + surf[dragging].w;
          int uy1 = old.y + old.h > surf[dragging].y + surf[dragging].h
                        ? old.y + old.h
                        : surf[dragging].y + surf[dragging].h;
          composite(ux - 6, uy - 6, ux1 - ux + 18, uy1 - uy + 20);
        } else {
          int ux = (oldx < mx ? oldx : mx) - 2, uy = (oldy < my ? oldy : my) - 2;
          int uw = (oldx > mx ? oldx : mx) - ux + 16;
          int uh = (oldy > my ? oldy : my) - uy + 22;
          composite(ux, uy, uw, uh);
        }
      }
    }

    time_t now = time(0);
    if (now != last_tick) {
      last_tick = now;
      composite(bar_x, bar_y, bar_w, 44);
      if (now % 60 == 0) composite_all();
    }
  }
}
