/*
 * The alpenglowed wire protocol.
 *
 * A widget is not part of the desktop — it is a separate program that
 * connects to /run/alpenglowed/wm.sock, is handed a shared pixel buffer on
 * tmpfs, draws into it, and says commit. The compositor owns /dev/fb0 and
 * the PS/2 devices; clients own their own pixels and nothing else.
 *
 * One fixed-size message both ways. Same machine, same arch, no packing
 * games needed.
 */
#ifndef ALPENGLOWED_WIRE_H
#define ALPENGLOWED_WIRE_H

#define AW_SOCK "/run/alpenglowed/wm.sock"
#define AW_DIR "/run/alpenglowed"

enum {
  AW_HELLO = 1,
  AW_SURFACE,
  AW_COMMIT,
  AW_MOVE,
  AW_INPUT,
  AW_CLOSE,
  AW_RAISE,
  /* Same as AW_HELLO, but the surface is the wallpaper: full screen, at
     the bottom, never focused, never dragged. Ask for 0x0 and the
     compositor answers with the real screen size. */
  AW_HELLO_BG
};

enum { AW_IN_MOTION = 1, AW_IN_PRESS, AW_IN_RELEASE, AW_IN_KEY };

enum { AW_F_PINNED = 1, AW_F_KEYBOARD = 2, AW_F_RESIZE = 4 };

/* Placement: negative x/y anchor to the far edge, AW_CENTER centres. */
#define AW_CENTER (-100000)

/* A resizable window can't shrink below this, so the chrome stays usable. */
#define AW_MIN_W 240
#define AW_MIN_H 160

typedef struct {
  unsigned int type;
  int a, b, c, d;
  int e; /* HELLO: flags. */
  char s[80];
} AwMsg;

#endif
