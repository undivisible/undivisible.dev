/*
 * alpenmachine — uptime, load and memory, read from the real /proc.
 *
 * A separate process reading a separate kernel interface, which is the
 * whole point: nothing here is the desktop's business.
 */
#include <stdio.h>
#include <string.h>
#include <time.h>

#include "awidget.h"

int main(void) {
  AwClient c;
  if (aw_open(&c, "machine", 250, 92, -28, 26, 0) < 0) return 1;

  time_t last = 0;
  for (;;) {
    AwMsg in;
    if (aw_poll(&c, &in, 200) < 0) return 0;
    time_t now = time(0);
    if (now == last) continue;
    last = now;

    double up = 0, load = 0;
    long mt = 0, ma = 0;
    FILE *f = fopen("/proc/uptime", "r");
    if (f) { if (fscanf(f, "%lf", &up) != 1) up = 0; fclose(f); }
    f = fopen("/proc/meminfo", "r");
    if (f) {
      char k[64];
      long v;
      while (fscanf(f, "%63s %ld kB\n", k, &v) == 2) {
        if (!strcmp(k, "MemTotal:")) mt = v;
        if (!strcmp(k, "MemAvailable:")) ma = v;
      }
      fclose(f);
    }
    f = fopen("/proc/loadavg", "r");
    if (f) { if (fscanf(f, "%lf", &load) != 1) load = 0; fclose(f); }

    aw_frame(&c.buf, "machine");
    char buf[96];
    snprintf(buf, sizeof buf, "up %3ds   load %.2f", (int)up, load);
    aw_text(&c.buf, 12, 26, buf, 0xd8dbe2, 1);
    snprintf(buf, sizeof buf, "mem %ld/%ldM", (mt - ma) / 1024, mt / 1024);
    aw_text(&c.buf, 12, 44, buf, 0xd8dbe2, 1);
    aw_text(&c.buf, 12, 62, "linux 7.1.3 i686 real", 0x8890a0, 1);
    aw_commit(&c);
  }
}
