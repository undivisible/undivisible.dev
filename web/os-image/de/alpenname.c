/*
 * alpenname — the name card, with the tagline that rotates.
 *
 * Taglines are baked next to the content; this reads them itself.
 */
#include <stdio.h>
#include <string.h>
#include <time.h>

#include "awidget.h"

int main(void) {
  AwClient c;
  if (aw_open(&c, "max carter", 420, 100, 28, -30, 0) < 0) return 1;

  static char tags[24][64];
  int ntag = 0;
  FILE *tf = fopen("/usr/share/alpenglowed/content/taglines.txt", "r");
  if (tf) {
    while (ntag < 24 && fgets(tags[ntag], 64, tf)) {
      tags[ntag][strcspn(tags[ntag], "\n")] = 0;
      if (tags[ntag][0]) ntag++;
    }
    fclose(tf);
  }

  int i = 0;
  time_t last = 0;
  for (;;) {
    AwMsg in;
    if (aw_poll(&c, &in, 500) < 0) return 0;
    time_t now = time(0);
    if (now - last < 6) continue;
    last = now;

    aw_frame(&c.buf, 0);
    aw_text(&c.buf, 14, 12, "max carter", 0xffffff, 2);
    char tag[128];
    snprintf(tag, sizeof tag, "the ghost of terry davis, but %s",
             ntag ? tags[i++ % ntag] : "asian");
    aw_text(&c.buf, 14, 50, tag, 0xaeb6c6, 1);
    aw_text(&c.buf, 14, 70, "founding engineer at based hardware - omi",
            0x8890a0, 1);
    aw_commit(&c);
  }
}
