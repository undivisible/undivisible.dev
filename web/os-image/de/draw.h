/*
 * Pixels, shared by the compositor and every widget.
 *
 * Nothing here knows about the framebuffer — it draws into whatever ARGB
 * buffer you hand it, which is the point: a client draws into its own
 * shared-memory surface with exactly the same code the compositor uses on
 * the real screen. Glyphs come from the kernel's own 8x16 console font.
 */
#ifndef ALPENGLOWED_DRAW_H
#define ALPENGLOWED_DRAW_H

#include <string.h>

#include "font_small.h"
#include "font_large.h"

typedef struct {
  unsigned int *px;
  int w, h;
} AwBuf;

static unsigned int aw_mix(unsigned int a, unsigned int b, int t) {
  unsigned int ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  unsigned int br = (b >> 16) & 255, bg = (b >> 8) & 255, bl = b & 255;
  return (((ar + ((int)(br - ar) * t >> 8)) & 255) << 16) |
         (((ag + ((int)(bg - ag) * t >> 8)) & 255) << 8) |
         ((ab + ((int)(bl - ab) * t >> 8)) & 255);
}

static void aw_px(AwBuf *b, int x, int y, unsigned int c) {
  if (x >= 0 && x < b->w && y >= 0 && y < b->h) b->px[y * b->w + x] = c;
}

static void aw_fill(AwBuf *b, int x, int y, int w, int h, unsigned int c) {
  int x0 = x < 0 ? 0 : x, y0 = y < 0 ? 0 : y;
  int x1 = x + w > b->w ? b->w : x + w, y1 = y + h > b->h ? b->h : y + h;
  for (int j = y0; j < y1; j++)
    for (int i = x0; i < x1; i++) b->px[j * b->w + i] = c;
}

static void aw_blend(AwBuf *b, int x, int y, int w, int h, unsigned int c,
                     int a) {
  int x0 = x < 0 ? 0 : x, y0 = y < 0 ? 0 : y;
  int x1 = x + w > b->w ? b->w : x + w, y1 = y + h > b->h ? b->h : y + h;
  for (int j = y0; j < y1; j++)
    for (int i = x0; i < x1; i++)
      b->px[j * b->w + i] = aw_mix(b->px[j * b->w + i], c, a);
}

/* Alpha-blend a coverage glyph over whatever is already there, so edges are
   smooth. scale is kept for callers but only 1 is used now. */
static void aw_blend_glyph(AwBuf *b, int x, int y, const unsigned char *g,
                           int gw, int gh, unsigned int c) {
  for (int r = 0; r < gh; r++)
    for (int i = 0; i < gw; i++) {
      int a = g[r * gw + i];
      if (!a) continue;
      int px = x + i, py = y + r;
      if (px < 0 || px >= b->w || py < 0 || py >= b->h) continue;
      unsigned int *d = &b->px[py * b->w + px];
      *d = aw_mix(*d, c, a);
    }
}

static void aw_glyph(AwBuf *b, int x, int y, unsigned char ch, unsigned int c,
                     int scale) {
  (void)scale;
  aw_blend_glyph(b, x, y, &font_small[ch * (FONT_SMALL_W * FONT_SMALL_H)],
                 FONT_SMALL_W, FONT_SMALL_H, c);
}

static int aw_text(AwBuf *b, int x, int y, const char *s, unsigned int c,
                   int scale) {
  (void)scale;
  int ox = x;
  for (; *s; s++) {
    aw_glyph(b, x, y, (unsigned char)*s, c, 1);
    x += FONT_SMALL_W;
  }
  return x - ox;
}

/* The display face: Geist Mono at 16x32, anti-aliased. */
static int aw_text_lg(AwBuf *b, int x, int y, const char *s, unsigned int c) {
  int ox = x;
  for (; *s; s++) {
    aw_blend_glyph(b, x, y,
                   &font_large[(unsigned char)*s * (FONT_LARGE_W * FONT_LARGE_H)],
                   FONT_LARGE_W, FONT_LARGE_H, c);
    x += FONT_LARGE_W;
  }
  return x - ox;
}

/* The surface chrome every widget shares, so they look like one system. */
static void aw_frame(AwBuf *b, const char *title) {
  aw_fill(b, 0, 0, b->w, b->h, 0x10131c);
  aw_fill(b, 0, 0, b->w, 1, 0x2a3040);
  aw_fill(b, 0, b->h - 1, b->w, 1, 0x1a1e2a);
  aw_fill(b, 0, 0, 1, b->h, 0x1f2432);
  aw_fill(b, b->w - 1, 0, 1, b->h, 0x1f2432);
  if (title) aw_text(b, 10, 6, title, 0x707a90, 1);
}

#endif
