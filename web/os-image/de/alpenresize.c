/*
 * alpenresize — the host→guest resize bridge.
 *
 * The host browser sends `@@resize W H\n` on the second UART (ttyS1); this
 * daemon reads it, validates, writes "W H\n" to /run/alpenglowed/resize and
 * SIGWINCHes the compositor (its pid is in /run/alpenglowed/pid). The
 * compositor's main loop then does the SETCRTC dance at the new size.
 *
 * Bad sizes are ignored so a garbled line can't blank the screen. If ttyS1
 * is absent or the compositor isn't up yet, this just keeps trying — it is
 * crash-safe by construction.
 *
 * i686, static, no toolkit.
 */
#include <fcntl.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <termios.h>
#include <unistd.h>
#include "kms.h"

static int valid(int w, int h) {
  return w >= 1024 && w <= 1920 && (w % 8) == 0 && h >= 700 && h <= 1200;
}

int main(void) {
  int fd = open("/dev/ttyS1", O_RDONLY);
  if (fd < 0) return 1;
  struct termios t;
  tcgetattr(fd, &t);
  cfmakeraw(&t);
  cfsetspeed(&t, B115200);
  tcsetattr(fd, TCSANOW, &t);

  Kms kms;
  if (kms_open(&kms) < 0) return 1;

  char line[128];
  int llen = 0;
  for (;;) {
    char c;
    ssize_t n = read(fd, &c, 1);
    if (n <= 0) { usleep(20000); continue; }
    if (c == '\n') {
      line[llen] = 0;
      int w = 0, h = 0;
      if (sscanf(line, "@@resize %d %d", &w, &h) == 2 && valid(w, h)) {
        kms_modeset(&kms, w, h);
        FILE *rf = fopen("/run/alpenglowed/resize", "w");
        if (rf) { fprintf(rf, "%d %d\n", w, h); fclose(rf); }
        FILE *pf = fopen("/run/alpenglowed/pid", "r");
        if (pf) {
          int pid = 0;
          if (fscanf(pf, "%d", &pid) == 1 && pid > 1) kill(pid, SIGWINCH);
          fclose(pf);
        }
      }
      llen = 0;
      continue;
    }
    if (llen < (int)sizeof line - 1) line[llen++] = c;
  }
}
