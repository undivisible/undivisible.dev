/*
 * alpenpanel — one content app, one window.
 *
 * The launcher execs this; it connects on its own and owns its surface.
 * Text comes from the files baked into the image, or from a real program
 * (fastfetch) run through a pipe. Rows carrying a URL are clickable: the
 * click goes out of the machine as `@@open <url>` on ttyS0, which the host
 * page turns into a browser tab.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "awidget.h"

#define MAXLINE 400

static char lines[MAXLINE][200];
static unsigned int line_color[MAXLINE];
static int nlines = 0;
static char site_urls[24][160];
static int site_rows[24], nsites = 0;
static int scroll_row = 0;

static void load_text(const char *path) {
  FILE *f = fopen(path, "r");
  if (!f) {
    snprintf(lines[0], 200, "missing: %s", path);
    line_color[0] = 0xff8888;
    nlines = 1;
    return;
  }
  char raw[512];
  while (fgets(raw, sizeof raw, f) && nlines < MAXLINE) {
    unsigned int color = 0xd8dbe2;
    char *o = lines[nlines];
    int ol = 0;
    for (char *p = raw; *p && ol < 198; p++) {
      if (*p == 27) {
        char *q = p + 1;
        if (*q == '[') {
          q++;
          char code[16];
          int cl = 0;
          while (*q && !((*q >= 'a' && *q <= 'z') || (*q >= 'A' && *q <= 'Z'))) {
            if (cl < 15) code[cl++] = *q;
            q++;
          }
          code[cl] = 0;
          if (*q == 'm') {
            if (!strcmp(code, "90")) color = 0x8890a0;
            else if (!strcmp(code, "96")) color = 0x7ec8e8;
            else if (!strcmp(code, "91")) color = 0xff8888;
            else if (!strcmp(code, "1;37")) color = 0xffffff;
            else color = 0xd8dbe2;
          }
          p = q;
        } else if (*q == ']') {
          while (*q && *q != 7) q++;
          p = q;
        }
        continue;
      }
      if (*p == '\n' || *p == '\r') break;
      o[ol++] = *p;
    }
    o[ol] = 0;
    line_color[nlines] = color;
    char *paren = strstr(o, ") ");
    char *url = strstr(o, "https://");
    if (paren && url && nsites < 24) {
      int len = 0;
      while (url[len] && url[len] != ' ' && len < 158) len++;
      memcpy(site_urls[nsites], url, len);
      site_urls[nsites][len] = 0;
      site_rows[nsites] = nlines;
      nsites++;
    }
    nlines++;
  }
  fclose(f);
}

static void load_cmd(const char *cmd) {
  FILE *f = popen(cmd, "r");
  if (!f) return;
  char raw[512];
  while (fgets(raw, sizeof raw, f) && nlines < MAXLINE) {
    int ol = 0;
    char *o = lines[nlines];
    for (char *p = raw; *p && ol < 198; p++) {
      if (*p == 27) {
        while (*p && *p != 'm' && *p != 7) p++;
        continue;
      }
      if (*p == '\n' || *p == '\r') break;
      o[ol++] = *p;
    }
    o[ol] = 0;
    line_color[nlines] = 0xd8dbe2;
    nlines++;
  }
  pclose(f);
}

static void draw(AwClient *c, const char *title) {
  aw_frame(&c->buf, title);
  aw_text(&c->buf, c->buf.w - 22, 6, "x", 0x9aa2b2, 1);
  int rows = (c->buf.h - 40) / 18;
  for (int i = 0; i < rows; i++) {
    int li = scroll_row + i;
    if (li >= nlines) break;
    aw_text(&c->buf, 16, 28 + i * 18, lines[li], line_color[li], 1);
  }
  if (nlines > rows) {
    char pos[48];
    snprintf(pos, sizeof pos, "%d/%d  arrows scroll", scroll_row + 1, nlines);
    aw_text(&c->buf, c->buf.w - 200, c->buf.h - 20, pos, 0x596074, 1);
  }
  /* the resize grip: three ticks in the bottom-right corner */
  for (int i = 0; i < 3; i++)
    aw_fill(&c->buf, c->buf.w - 6 - i * 5, c->buf.h - 6, 3, 3, 0x596074);
  aw_commit(c);
}

int main(int argc, char **argv) {
  const char *name = argc > 1 ? argv[1] : "about";

  if (!strcmp(name, "fetch")) load_cmd("fastfetch 2>/dev/null");
  else if (!strcmp(name, "docs")) load_text("/readme.md");
  else {
    char path[160];
    snprintf(path, sizeof path, "/usr/share/alpenglowed/content/%s.txt", name);
    load_text(path);
  }

  AwClient c;
  if (aw_open(&c, name, 800, 540, AW_CENTER, 110, AW_F_RESIZE) < 0) return 1;
  draw(&c, name);

  for (;;) {
    AwMsg in;
    int r = aw_poll(&c, &in, 400);
    if (r < 0) return 0;
    if (r == 0) continue;
    int rows = (c.buf.h - 40) / 18;
    // A resize hands back a bigger/smaller surface; redraw to fit it.
    if (in.type == AW_SURFACE) {
      if (scroll_row > nlines - 1) scroll_row = nlines - 1;
      if (scroll_row < 0) scroll_row = 0;
      draw(&c, name);
      continue;
    }
    if (in.type != AW_INPUT) continue;

    if (in.a == AW_IN_KEY) {
      int k = in.d;
      if (k == 'q') return 0;
      if (k == 0x100 + 'A' && scroll_row > 0) scroll_row--;
      if (k == 0x100 + 'B' && scroll_row < nlines - 1) scroll_row++;
      if (k == 0x100 + '5') { scroll_row -= rows; if (scroll_row < 0) scroll_row = 0; }
      if (k == 0x100 + '6') {
        scroll_row += rows;
        if (scroll_row > nlines - 1) scroll_row = nlines - 1;
      }
      draw(&c, name);
    } else if (in.a == AW_IN_PRESS) {
      if (in.b > c.buf.w - 30 && in.c < 24) return 0;
      int row = (in.c - 28) / 18 + scroll_row;
      for (int s = 0; s < nsites; s++)
        if (site_rows[s] == row) {
          FILE *ser = fopen("/dev/ttyS0", "w");
          if (ser) {
            fprintf(ser, "@@open %s\n", site_urls[s]);
            fclose(ser);
          }
        }
    }
  }
}
