/*
 * alpenname — the name card, with the tagline that rotates and the
 * wikipedia-style hover cards from the almanac.
 *
 * The surface is tall and mostly transparent: the name card sits at the
 * bottom, and when you hover a proper noun in the tagline — "terry davis",
 * or the rotating suffix — a card floats above it with the same note the
 * live site shows. Content is baked from lab-facts into hovers.txt.
 */
#include <stdio.h>
#include <string.h>
#include <time.h>

#include "awidget.h"

#define SW 520
#define SH 320
#define CARD_Y (SH - 100) /* the name card lives in the bottom 100px */

static char tags[24][64];
static int ntag = 0;

/* baked hover notes: word \t title \t body */
static char hword[40][32], htitle[40][64], hbody[40][512];
static int nhover = 0;

static void load_hovers(void) {
  FILE *f = fopen("/usr/share/alpenglowed/content/hovers.txt", "r");
  if (!f) return;
  char line[700];
  while (nhover < 40 && fgets(line, sizeof line, f)) {
    line[strcspn(line, "\n")] = 0;
    char *t1 = strchr(line, '\t');
    if (!t1) continue;
    *t1 = 0;
    char *t2 = strchr(t1 + 1, '\t');
    if (!t2) continue;
    *t2 = 0;
    snprintf(hword[nhover], 32, "%s", line);
    snprintf(htitle[nhover], 64, "%s", t1 + 1);
    snprintf(hbody[nhover], 512, "%s", t2 + 1);
    nhover++;
  }
  fclose(f);
}

static const char *hbody_of(const char *word, const char **title) {
  for (int i = 0; i < nhover; i++)
    if (!strcmp(hword[i], word)) {
      *title = htitle[i];
      return hbody[i];
    }
  return 0;
}

/* Draw the name card in the bottom region. */
static void draw_name(AwClient *c, const char *suffix) {
  AwBuf card = {c->buf.px + CARD_Y * SW, SW, 100};
  aw_frame(&card, 0);
  aw_text_lg(&card, 14, 10, "max carter", 0xffffff);
  char tag[128];
  snprintf(tag, sizeof tag, "the ghost of terry davis, but %s", suffix);
  aw_text(&card, 14, 50, tag, 0xaeb6c6, 1);
  aw_text(&card, 14, 70, "founding engineer at based hardware - omi", 0x8890a0, 1);
}

/* Draw the floating hover card above the name, word-wrapped. */
static void draw_hovercard(AwClient *c, const char *title, const char *body) {
  int cw = 480, pad = 14, cols = (cw - 2 * pad) / 8;
  /* wrap first to know the height */
  char lines[16][80];
  int nl = 0, col = 0;
  lines[0][0] = 0;
  const char *p = body;
  char wordbuf[80];
  while (*p && nl < 15) {
    int wl = 0;
    while (*p == ' ') p++;
    while (p[wl] && p[wl] != ' ' && wl < 78) wl++;
    memcpy(wordbuf, p, wl);
    wordbuf[wl] = 0;
    p += wl;
    if (!wl) continue;
    if (col && col + 1 + wl > cols) {
      nl++;
      lines[nl][0] = 0;
      col = 0;
    }
    if (col) {
      strcat(lines[nl], " ");
      col++;
    }
    strcat(lines[nl], wordbuf);
    col += wl;
  }
  nl++;
  int ch = 44 + nl * 18;
  int cy = CARD_Y - ch - 10;
  if (cy < 0) cy = 0;

  AwBuf b = c->buf;
  aw_blend(&b, 4, cy + 6, cw, ch, 0x000000, 90);
  aw_blend(&b, 0, cy, cw, ch, 0x10131c, 235);
  aw_fill(&b, 0, cy, cw, 1, 0x2a3040);
  aw_fill(&b, 0, cy + ch - 1, cw, 1, 0x1a1e2a);
  aw_fill(&b, 0, cy, 1, ch, 0x1f2432);
  aw_fill(&b, cw - 1, cy, 1, ch, 0x1f2432);
  aw_text_lg(&b, 12, cy + 8, title, 0xffffff);
  for (int i = 0; i < nl; i++)
    aw_text(&b, 14, cy + 44 + i * 18, lines[i], 0xc4cad6, 1);
}

int main(void) {
  AwClient c;
  if (aw_open(&c, "max carter", SW, SH, 28, -30, 0) < 0) return 1;

  FILE *tf = fopen("/usr/share/alpenglowed/content/taglines.txt", "r");
  if (tf) {
    while (ntag < 24 && fgets(tags[ntag], 64, tf)) {
      tags[ntag][strcspn(tags[ntag], "\n")] = 0;
      if (tags[ntag][0]) ntag++;
    }
    fclose(tf);
  }
  load_hovers();

  int idx = 0;
  const char *suffix = ntag ? tags[0] : "asian";
  char hovering[32] = "";

  aw_clear(&c.buf);
  draw_name(&c, suffix);
  aw_commit(&c);

  time_t last = time(0);
  for (;;) {
    AwMsg in;
    int r = aw_poll(&c, &in, 500);
    if (r < 0) return 0;

    if (r > 0 && in.type == AW_INPUT && in.a == AW_IN_MOTION) {
      const char *want = "";
      if (in.b >= 0) {
        int lx = in.b, ly = in.c;
        // the tagline line, in surface coords
        int ty = CARD_Y + 50;
        if (ly >= ty && ly < ty + 16) {
          int col = (lx - 14) / 8;
          // "the ghost of " = 13 ; "terry davis" = 11 ; ", but " = 6
          if (col >= 13 && col < 24) want = "terry";
          else if (col >= 30 && col < 30 + (int)strlen(suffix)) want = suffix;
        }
      }
      if (strcmp(want, hovering)) {
        snprintf(hovering, sizeof hovering, "%s", want);
        aw_clear(&c.buf);
        draw_name(&c, suffix);
        if (*hovering) {
          const char *title = 0;
          const char *body = hbody_of(hovering, &title);
          if (body) draw_hovercard(&c, title, body);
        }
        aw_commit(&c);
      }
      continue;
    }

    time_t now = time(0);
    if (now - last < 6) continue;
    last = now;
    idx = (idx + 1) % (ntag ? ntag : 1);
    suffix = ntag ? tags[idx] : "asian";
    // don't yank a card out from under the cursor mid-read
    if (!*hovering) {
      aw_clear(&c.buf);
      draw_name(&c, suffix);
      aw_commit(&c);
    }
  }
}
