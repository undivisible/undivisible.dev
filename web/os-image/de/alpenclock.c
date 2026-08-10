/*
 * alpenclock — the clock, as its own program.
 *
 * Hong Kong time off the machine's RTC. It owns 250x92 pixels and knows
 * nothing about the desktop it sits on.
 */
#include <time.h>

#include "awidget.h"

int main(void) {
  AwClient c;
  if (aw_open(&c, "hong kong", 250, 92, 28, 26, 0) < 0) return 1;

  static const char *dows[] = {"sun", "mon", "tue", "wed", "thu", "fri", "sat"};
  static const char *mons[] = {"jan", "feb", "mar", "apr", "may", "jun",
                               "jul", "aug", "sep", "oct", "nov", "dec"};
  time_t last = 0;
  for (;;) {
    AwMsg in;
    if (aw_poll(&c, &in, 200) < 0) return 0;
    time_t now = time(0);
    if (now == last) continue;
    last = now;

    time_t t = now + 8 * 3600;
    struct tm g;
    gmtime_r(&t, &g);
    aw_frame(&c.buf, "hong kong");
    char buf[64];
    snprintf(buf, sizeof buf, "%02d:%02d:%02d", g.tm_hour, g.tm_min, g.tm_sec);
    aw_text(&c.buf, 12, 26, buf, 0xffffff, 2);
    snprintf(buf, sizeof buf, "%s %02d %s  gmt+8", dows[g.tm_wday], g.tm_mday,
             mons[g.tm_mon]);
    aw_text(&c.buf, 12, 62, buf, 0x8890a0, 1);
    aw_commit(&c);
  }
}
