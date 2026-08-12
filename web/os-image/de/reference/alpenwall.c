/*
 * alpensky — the wallpaper, as its own program.
 *
 * The sky is computed from the machine's own RTC: gradient stops by the
 * hour in Hong Kong, the sun or the moon riding the hour across it, stars
 * after dark. It asks the compositor for a background surface, which is
 * full screen, sits under everything, and never takes a click.
 *
 * It redraws once a minute. The compositor keeps its own copy of this as
 * a fallback for the seconds before this process is up.
 */
#include <stdlib.h>
#include <time.h>

#include "awidget.h"

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

static void paint(AwBuf *b) {
  unsigned int top, bot;
  int hour = hk_hour();
  int W = b->w, H = b->h;
  sky_stops(hour, &top, &bot);
  for (int y = 0; y < H; y++) {
    unsigned int c = aw_mix(top, bot, y * 255 / H);
    for (int x = 0; x < W; x++)
      b->px[y * W + x] = ((x ^ y) & 3) == 0 ? aw_mix(c, bot, 8) : c;
  }

  int day = hour >= 6 && hour < 19;
  int t = ((hour + 24 - 6) % 24) * 60 + hk_min();
  int sx = 60 + (long)(W - 120) * (day ? t : t - 780) / 780;
  int sy = H / 5 + (abs(sx - W / 2) * abs(sx - W / 2)) / (W * 2);
  unsigned int sun = day ? 0xfff2cc : 0xc9cfdd;
  for (int j = -14; j <= 14; j++)
    for (int i = -14; i <= 14; i++) {
      if (i * i + j * j > 14 * 14) continue;
      int x = sx + i, y = sy + j;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      b->px[y * W + x] =
          i * i + j * j > 12 * 12 ? aw_mix(sun, b->px[y * W + x], 128) : sun;
    }

  if (!day)
    for (int k = 0; k < 90; k++) {
      int x = (k * 977 + 131) % W, y = ((k * 613 + 47) % (H * 2 / 3));
      b->px[y * W + x] = k % 3 ? 0x556077 : 0x8a94aa;
    }
}

int main(void) {
  AwClient c;
  if (aw_open_bg(&c, "sky") < 0) return 1;
  paint(&c.buf);
  aw_commit(&c);

  time_t last = time(0);
  for (;;) {
    AwMsg in;
    if (aw_poll(&c, &in, 1000) < 0) return 0;
    time_t now = time(0);
    if (now - last < 60) continue;
    last = now;
    paint(&c.buf);
    aw_commit(&c);
  }
}
