/*
 * The client half of alpenglowed: what a widget links against.
 *
 * Connect, get a surface, draw into it with draw.h, commit. Input arrives
 * in surface-local coordinates. A widget never opens /dev/fb0 and never
 * sees another widget's pixels.
 */
#ifndef ALPENGLOWED_AWIDGET_H
#define ALPENGLOWED_AWIDGET_H

#include <fcntl.h>
#include <poll.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

#include "draw.h"
#include "wire.h"

typedef struct {
  int fd;
  AwBuf buf;
  int id;
} AwClient;

static int aw_send(int fd, const AwMsg *m) {
  return write(fd, m, sizeof *m) == (long)sizeof *m ? 0 : -1;
}

static int aw_recv(int fd, AwMsg *m) {
  char *p = (char *)m;
  size_t got = 0;
  while (got < sizeof *m) {
    long n = read(fd, p + got, sizeof *m - got);
    if (n <= 0) return -1;
    got += (size_t)n;
  }
  return 0;
}

static int aw_map(AwClient *c, const AwMsg *r);

static int aw_open_as(AwClient *c, unsigned int hello, const char *title, int w,
                      int h, int x, int y, int flags) {
  struct sockaddr_un addr;
  c->buf.px = 0;
  c->fd = socket(AF_UNIX, SOCK_STREAM, 0);
  if (c->fd < 0) return -1;
  memset(&addr, 0, sizeof addr);
  addr.sun_family = AF_UNIX;
  snprintf(addr.sun_path, sizeof addr.sun_path, "%s", AW_SOCK);
  if (connect(c->fd, (struct sockaddr *)&addr, sizeof addr) < 0) return -1;

  AwMsg m;
  memset(&m, 0, sizeof m);
  m.type = hello;
  m.a = w;
  m.b = h;
  m.c = x;
  m.d = y;
  m.e = flags;
  snprintf(m.s, sizeof m.s, "%s", title);
  if (aw_send(c->fd, &m) < 0) return -1;

  AwMsg r;
  if (aw_recv(c->fd, &r) < 0 || r.type != AW_SURFACE) return -1;
  return aw_map(c, &r);
}

/* (Re)map the shared surface a compositor just handed us — used both at
   open and when the compositor grows the surface on a resize. */
static int aw_map(AwClient *c, const AwMsg *r) {
  int sfd = open(r->s, O_RDWR);
  if (sfd < 0) return -1;
  void *px = mmap(0, (size_t)r->a * r->b * 4, PROT_READ | PROT_WRITE,
                  MAP_SHARED, sfd, 0);
  close(sfd);
  if (px == MAP_FAILED) return -1;
  if (c->buf.px) munmap(c->buf.px, (size_t)c->buf.w * c->buf.h * 4);
  c->id = r->c;
  c->buf.px = (unsigned int *)px;
  c->buf.w = r->a;
  c->buf.h = r->b;
  return 0;
}

static int aw_open(AwClient *c, const char *title, int w, int h, int x, int y,
                   int flags) {
  return aw_open_as(c, AW_HELLO, title, w, h, x, y, flags);
}

static int aw_open_bg(AwClient *c, const char *title) {
  return aw_open_as(c, AW_HELLO_BG, title, 0, 0, 0, 0, 0);
}

static void aw_commit(AwClient *c) {
  AwMsg m;
  memset(&m, 0, sizeof m);
  m.type = AW_COMMIT;
  aw_send(c->fd, &m);
}

/* Blocks up to `ms`. Returns 1 with `out` filled, 0 on timeout, -1 if the
   compositor went away — a widget outliving its desktop should just die. */
static int aw_poll(AwClient *c, AwMsg *out, int ms) {
  struct pollfd p = {c->fd, POLLIN, 0};
  int n = poll(&p, 1, ms);
  if (n <= 0) return 0;
  if (aw_recv(c->fd, out) < 0) return -1;
  /* A fresh AW_SURFACE mid-run is a resize: re-map before the caller sees
     it, so a client just redraws at c->buf's new w/h. */
  if (out->type == AW_SURFACE && aw_map(c, out) < 0) return -1;
  return 1;
}

#endif
