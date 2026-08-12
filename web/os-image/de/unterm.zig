const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const awidget = @import("awidget.zig");
const wire = @import("wire.zig");

// A terminal in a window: bash on a unix98 pty, a small vt parser, the
// grid drawn into a shared-memory surface. The compositor forwards raw
// tty bytes as AW_IN_KEY, so ctrl-c and friends arrive for free. This is
// the windowed alternative to `sh`, which hands over the whole screen.

const CELL_W: i32 = 8;
const CELL_H: i32 = 16;
const MAXC: usize = 220;
const MAXR: usize = 70;

const TIOCSPTLCK: u32 = 0x40045431;
const TIOCGPTN: u32 = 0x80045430;
const TIOCSCTTY: u32 = 0x540E;
const TIOCSWINSZ: u32 = 0x5414;

const Winsize = extern struct { row: u16, col: u16, xpix: u16, ypix: u16 };

var grid: [MAXR][MAXC]u8 = std.mem.zeroes([MAXR][MAXC]u8);
var gcol: [MAXR][MAXC]u32 = std.mem.zeroes([MAXR][MAXC]u32);
var rows: usize = 0;
var cols: usize = 0;
var cx: usize = 0;
var cy: usize = 0;
var fg: u32 = 0xd8dbe2;

// vt parser state
var st: u8 = 0; // 0 normal, 1 esc, 2 csi, 3 osc
var params: [8]i32 = [_]i32{0} ** 8;
var nparam: usize = 0;

fn ansiColor(code: i32) u32 {
    return switch (code) {
        30 => 0x596074,
        31 => 0xff8888,
        32 => 0xa8d68a,
        33 => 0xf0c674,
        34 => 0x7ea6e8,
        35 => 0xd8a8e8,
        36 => 0x7ec8e8,
        37 => 0xd8dbe2,
        90 => 0x8890a0,
        91 => 0xff9d9d,
        92 => 0xbfe6a4,
        93 => 0xf5d494,
        94 => 0x9dbcf0,
        95 => 0xe4c0f0,
        96 => 0x9dd6f0,
        97 => 0xffffff,
        else => 0xd8dbe2,
    };
}

fn clearRow(r: usize, from: usize) void {
    var i = from;
    while (i < MAXC) : (i += 1) {
        grid[r][i] = ' ';
        gcol[r][i] = fg;
    }
}

fn clearAll() void {
    var r: usize = 0;
    while (r < MAXR) : (r += 1) clearRow(r, 0);
    cx = 0;
    cy = 0;
}

fn scrollUp() void {
    var r: usize = 0;
    while (r + 1 < rows) : (r += 1) {
        grid[r] = grid[r + 1];
        gcol[r] = gcol[r + 1];
    }
    clearRow(rows - 1, 0);
}

fn newline() void {
    if (cy + 1 >= rows) scrollUp() else cy += 1;
}

fn putChar(ch: u8) void {
    if (cx >= cols) {
        cx = 0;
        newline();
    }
    grid[cy][cx] = ch;
    gcol[cy][cx] = fg;
    cx += 1;
}

fn feed(ch: u8) void {
    switch (st) {
        1 => {
            if (ch == '[') {
                st = 2;
                nparam = 0;
                params = [_]i32{0} ** 8;
            } else if (ch == ']') {
                st = 3;
            } else st = 0;
            return;
        },
        2 => {
            if (ch >= '0' and ch <= '9') {
                params[nparam] = params[nparam] * 10 + @as(i32, ch - '0');
                return;
            }
            if (ch == ';') {
                if (nparam + 1 < params.len) nparam += 1;
                return;
            }
            if (ch == '?') return;
            st = 0;
            const np = nparam + 1;
            switch (ch) {
                'm' => {
                    var i: usize = 0;
                    var bright = false;
                    while (i < np) : (i += 1) {
                        const p = params[i];
                        if (p == 0) {
                            fg = 0xd8dbe2;
                            bright = false;
                        } else if (p == 1) {
                            bright = true;
                        } else if ((p >= 30 and p <= 37) or (p >= 90 and p <= 97)) {
                            fg = ansiColor(if (bright and p <= 37) p + 60 else p);
                        }
                    }
                },
                'K' => clearRow(cy, if (params[0] == 0) cx else 0),
                'J' => {
                    if (params[0] == 2) clearAll() else {
                        clearRow(cy, cx);
                        var r = cy + 1;
                        while (r < rows) : (r += 1) clearRow(r, 0);
                    }
                },
                'H', 'f' => {
                    const pr: usize = @intCast(@max(params[0], 1));
                    const pc: usize = @intCast(@max(params[1], 1));
                    cy = @min(pr - 1, rows - 1);
                    cx = @min(pc - 1, cols - 1);
                },
                'A' => cy -|= @intCast(@max(params[0], 1)),
                'B' => cy = @min(cy + @as(usize, @intCast(@max(params[0], 1))), rows - 1),
                'C' => cx = @min(cx + @as(usize, @intCast(@max(params[0], 1))), cols - 1),
                'D' => cx -|= @as(usize, @intCast(@max(params[0], 1))),
                'G' => cx = @min(@as(usize, @intCast(@max(params[0], 1))) - 1, cols - 1),
                'P' => {
                    // delete N chars, pull the tail left
                    var n: usize = @intCast(@max(params[0], 1));
                    if (n > cols - cx) n = cols - cx;
                    var i = cx;
                    while (i + n < cols) : (i += 1) {
                        grid[cy][i] = grid[cy][i + n];
                        gcol[cy][i] = gcol[cy][i + n];
                    }
                    while (i < cols) : (i += 1) grid[cy][i] = ' ';
                },
                else => {},
            }
            return;
        },
        3 => {
            if (ch == 7) st = 0; // OSC ends at BEL
            return;
        },
        else => {},
    }
    switch (ch) {
        27 => st = 1,
        '\n' => newline(),
        '\r' => cx = 0,
        8 => cx -|= 1,
        '\t' => {
            cx = @min((cx / 8 + 1) * 8, cols - 1);
        },
        7 => {},
        else => {
            if (ch >= 32) putChar(ch);
        },
    }
}

fn redraw(c: *awidget.AwClient) void {
    draw.frame(&c.buf, "terminal");
    _ = draw.text(&c.buf, c.buf.w - 22, 6, "x", 0x9aa2b2, 1);
    var r: usize = 0;
    while (r < rows) : (r += 1) {
        var i: usize = 0;
        while (i < cols) : (i += 1) {
            const ch = grid[r][i];
            if (ch != ' ' and ch != 0)
                draw.glyph(&c.buf, 12 + @as(i32, @intCast(i)) * CELL_W, 28 + @as(i32, @intCast(r)) * CELL_H, ch, gcol[r][i], 1);
        }
    }
    // block cursor
    draw.blend(&c.buf, 12 + @as(i32, @intCast(cx)) * CELL_W, 28 + @as(i32, @intCast(cy)) * CELL_H, CELL_W, CELL_H, 0xffffff, 110);
    var k: i32 = 0;
    while (k < 3) : (k += 1)
        draw.fill(&c.buf, c.buf.w - 6 - k * 5, c.buf.h - 6, 3, 3, 0x596074);
    awidget.commit(c);
}

fn gridSize(c: *const awidget.AwClient) void {
    cols = @min(@as(usize, @intCast(@divTrunc(c.buf.w - 24, CELL_W))), MAXC);
    rows = @min(@as(usize, @intCast(@divTrunc(c.buf.h - 40, CELL_H))), MAXR);
    if (cy >= rows) cy = rows - 1;
    if (cx >= cols) cx = cols - 1;
}

fn setWinsize(fd: i32) void {
    var ws: Winsize = .{ .row = @intCast(rows), .col = @intCast(cols), .xpix = 0, .ypix = 0 };
    _ = linux.ioctl(fd, TIOCSWINSZ, @intFromPtr(&ws));
}

pub fn main() void {
    var c: awidget.AwClient = undefined;
    if (!awidget.open(&c, "terminal", 720, 440, wire.AW_CENTER, 140, wire.AW_F_RESIZE | wire.AW_F_KEYBOARD)) linux.exit(1);
    gridSize(&c);
    clearAll();

    // the pty pair
    const ptm_raw = linux.open("/dev/ptmx", .{ .ACCMODE = .RDWR, .NOCTTY = true }, 0);
    if (linux.errno(ptm_raw) != .SUCCESS) linux.exit(1);
    const ptm: i32 = @intCast(ptm_raw);
    var zero: i32 = 0;
    _ = linux.ioctl(ptm, TIOCSPTLCK, @intFromPtr(&zero));
    var ptn: i32 = 0;
    _ = linux.ioctl(ptm, TIOCGPTN, @intFromPtr(&ptn));
    var spath: [32]u8 = std.mem.zeroes([32]u8);
    _ = std.fmt.bufPrint(&spath, "/dev/pts/{d}", .{ptn}) catch linux.exit(1);
    setWinsize(ptm);

    const pid = linux.fork();
    if (pid == 0) {
        _ = linux.close(ptm);
        _ = linux.setsid();
        const pts_raw = linux.open(@ptrCast(&spath), .{ .ACCMODE = .RDWR }, 0);
        if (linux.errno(pts_raw) != .SUCCESS) linux.exit(127);
        const pts: i32 = @intCast(pts_raw);
        _ = linux.ioctl(pts, TIOCSCTTY, 0);
        _ = linux.dup2(pts, 0);
        _ = linux.dup2(pts, 1);
        _ = linux.dup2(pts, 2);
        if (pts > 2) _ = linux.close(pts);
        const argv = [_:null]?[*:0]const u8{ "/bin/bash", "--login", "-i" };
        const envp = [_:null]?[*:0]const u8{ "TERM=linux", "HOME=/", "PATH=/usr/local/bin:/usr/bin:/bin" };
        _ = linux.execve("/bin/bash", @ptrCast(&argv), @ptrCast(&envp));
        linux.exit(127);
    }

    redraw(&c);

    while (true) {
        var fds: [2]linux.pollfd = .{
            .{ .fd = c.fd, .events = linux.POLL.IN, .revents = 0 },
            .{ .fd = ptm, .events = linux.POLL.IN, .revents = 0 },
        };
        const pn = linux.poll(&fds, 2, 1000);
        if (linux.errno(pn) != .SUCCESS) linux.exit(0);

        if (fds[1].revents & (linux.POLL.IN) != 0) {
            var buf: [2048]u8 = undefined;
            const n = linux.read(ptm, &buf, buf.len);
            if (linux.errno(n) != .SUCCESS or n == 0) linux.exit(0);
            for (buf[0..n]) |ch| feed(ch);
            redraw(&c);
        } else if (fds[1].revents & (linux.POLL.HUP | linux.POLL.ERR) != 0) {
            linux.exit(0);
        }

        if (fds[0].revents & linux.POLL.IN != 0) {
            var in: wire.AwMsg = undefined;
            if (!awidget.recv(c.fd, &in)) linux.exit(0);
            if (in.type == wire.AW_SURFACE) {
                if (!awidget.remap(&c, &in)) linux.exit(0);
                gridSize(&c);
                setWinsize(ptm);
                redraw(&c);
            } else if (in.type == wire.AW_INPUT and in.a == wire.AW_IN_KEY) {
                const k = in.d;
                if (k >= 0x100) {
                    const seq: []const u8 = switch (@as(u8, @intCast(k - 0x100))) {
                        'A' => "\x1b[A",
                        'B' => "\x1b[B",
                        'C' => "\x1b[C",
                        'D' => "\x1b[D",
                        '5' => "\x1b[5~",
                        '6' => "\x1b[6~",
                        else => "",
                    };
                    if (seq.len > 0) _ = linux.write(ptm, seq.ptr, seq.len);
                } else if (k > 0 and k < 256) {
                    var b: [1]u8 = .{@intCast(k)};
                    _ = linux.write(ptm, &b, 1);
                }
            } else if (in.type == wire.AW_INPUT and in.a == wire.AW_IN_PRESS) {
                if (in.b > c.buf.w - 30 and in.c < 24) linux.exit(0);
            }
        }
    }
}
