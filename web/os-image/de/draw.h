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

#include "font8x16.h"

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

static void aw_glyph(AwBuf *b, int x, int y, unsigned char ch, unsigned int c,
                     int scale) {
  const unsigned char *g = &font8x16[ch * 16];
  for (int r = 0; r < 16; r++)
    for (int i = 0; i < 8; i++)
      if (g[r] & (0x80 >> i)) {
        if (scale == 1) aw_px(b, x + i, y + r, c);
        else aw_fill(b, x + i * scale, y + r * scale, scale, scale, c);
      }
}

static int aw_text(AwBuf *b, int x, int y, const char *s, unsigned int c,
                   int scale) {
  int ox = x;
  for (; *s; s++) {
    aw_glyph(b, x, y, (unsigned char)*s, c, scale);
    x += 8 * scale;
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
