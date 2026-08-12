const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const awidget = @import("awidget.zig");
const wire = @import("wire.zig");

const SW: i32 = 520;
const SH: i32 = 320;
const CARD_Y: i32 = SH - 100;

fn nowSec() i64 {
    var ts: linux.timespec = undefined;
    _ = linux.clock_gettime(.REALTIME, &ts);
    return @intCast(ts.sec);
}

fn readFile(path: [*:0]const u8, buf: []u8) []const u8 {
    const fd_raw = linux.open(path, .{ .ACCMODE = .RDONLY }, 0);
    if (linux.errno(fd_raw) != .SUCCESS) return &.{};
    const fd: i32 = @intCast(fd_raw);
    const n = linux.read(fd, buf.ptr, buf.len);
    _ = linux.close(fd);
    if (linux.errno(n) != .SUCCESS) return &.{};
    return buf[0..n];
}

fn copyStr(dst: []u8, src: []const u8) void {
    @memset(dst, 0);
    const n = @min(src.len, dst.len - 1);
    @memcpy(dst[0..n], src[0..n]);
}

fn sliceZ(buf: []const u8) []const u8 {
    return std.mem.sliceTo(buf, 0);
}

var tags: [24][64]u8 = std.mem.zeroes([24][64]u8);
var ntag: usize = 0;

var hword: [40][32]u8 = std.mem.zeroes([40][32]u8);
var htitle: [40][64]u8 = std.mem.zeroes([40][64]u8);
var hbody: [40][512]u8 = std.mem.zeroes([40][512]u8);
var nhover: usize = 0;

fn loadHovers(rbuf: []u8) void {
    const data = readFile("/usr/share/undesk/content/hovers.txt", rbuf);
    var lines = std.mem.splitScalar(u8, data, '\n');
    while (lines.next()) |line| {
        if (nhover >= 40) break;
        const t1 = std.mem.indexOfScalar(u8, line, '\t') orelse continue;
        const t2 = std.mem.indexOfScalarPos(u8, line, t1 + 1, '\t') orelse continue;
        copyStr(&hword[nhover], line[0..t1]);
        copyStr(&htitle[nhover], line[t1 + 1 .. t2]);
        copyStr(&hbody[nhover], line[t2 + 1 ..]);
        nhover += 1;
    }
}

fn hbodyOf(word: []const u8) ?struct { title: []const u8, body: []const u8 } {
    var i: usize = 0;
    while (i < nhover) : (i += 1) {
        if (std.mem.eql(u8, sliceZ(&hword[i]), word)) {
            return .{ .title = sliceZ(&htitle[i]), .body = sliceZ(&hbody[i]) };
        }
    }
    return null;
}

fn drawName(c: *awidget.AwClient, suffix: []const u8) void {
    var card = draw.AwBuf{ .px = c.buf.px + @as(usize, @intCast(CARD_Y * SW)), .w = SW, .h = 100 };
    draw.frame(&card, null);
    _ = draw.textLg(&card, 14, 10, "max carter", 0xffffff);
    var tag: [128]u8 = undefined;
    const ts = std.fmt.bufPrint(&tag, "the ghost of terry davis, but {s}", .{suffix}) catch unreachable;
    _ = draw.text(&card, 14, 50, ts, 0xaeb6c6, 1);
    _ = draw.text(&card, 14, 70, "founding engineer at based hardware - omi", 0x8890a0, 1);
}

fn drawHovercard(c: *awidget.AwClient, title: []const u8, body: []const u8) void {
    const cw: i32 = 480;
    const pad: i32 = 14;
    const cols: i32 = @divTrunc(cw - 2 * pad, 8);
    var lines: [16][80]u8 = std.mem.zeroes([16][80]u8);
    var llen: [16]usize = [_]usize{0} ** 16;
    var nl: usize = 0;
    var col: i32 = 0;
    var p: usize = 0;
    while (p < body.len and nl < 15) {
        while (p < body.len and body[p] == ' ') p += 1;
        var wl: usize = 0;
        while (p + wl < body.len and body[p + wl] != ' ' and wl < 78) wl += 1;
        if (wl == 0) break;
        if (col != 0 and col + 1 + @as(i32, @intCast(wl)) > cols) {
            nl += 1;
            llen[nl] = 0;
            col = 0;
        }
        if (col != 0) {
            lines[nl][llen[nl]] = ' ';
            llen[nl] += 1;
            col += 1;
        }
        @memcpy(lines[nl][llen[nl] .. llen[nl] + wl], body[p .. p + wl]);
        llen[nl] += wl;
        col += @intCast(wl);
        p += wl;
    }
    nl += 1;
    const ch: i32 = 44 + @as(i32, @intCast(nl)) * 18;
    var cy: i32 = CARD_Y - ch - 10;
    if (cy < 0) cy = 0;

    var b = c.buf;
    draw.blend(&b, 4, cy + 6, cw, ch, 0x000000, 90);
    draw.blend(&b, 0, cy, cw, ch, 0x10131c, 235);
    draw.fill(&b, 0, cy, cw, 1, 0x2a3040);
    draw.fill(&b, 0, cy + ch - 1, cw, 1, 0x1a1e2a);
    draw.fill(&b, 0, cy, 1, ch, 0x1f2432);
    draw.fill(&b, cw - 1, cy, 1, ch, 0x1f2432);
    _ = draw.textLg(&b, 12, cy + 8, title, 0xffffff);
    var i: usize = 0;
    while (i < nl) : (i += 1) {
        _ = draw.text(&b, 14, cy + 44 + @as(i32, @intCast(i)) * 18, lines[i][0..llen[i]], 0xc4cad6, 1);
    }
}

pub fn main() void {
    var c: awidget.AwClient = undefined;
    if (!awidget.open(&c, "max carter", SW, SH, 28, -30, 0)) linux.exit(1);

    var rbuf: [8192]u8 = undefined;
    const tdata = readFile("/usr/share/undesk/content/taglines.txt", &rbuf);
    var tlines = std.mem.splitScalar(u8, tdata, '\n');
    while (tlines.next()) |line| {
        if (ntag >= 24) break;
        if (line.len == 0) continue;
        copyStr(&tags[ntag], line);
        ntag += 1;
    }
    loadHovers(&rbuf);

    var idx: usize = 0;
    var suffix: []const u8 = if (ntag > 0) sliceZ(&tags[0]) else "asian";
    var hovering: [32]u8 = [_]u8{0} ** 32;

    draw.clear(&c.buf);
    drawName(&c, suffix);
    awidget.commit(&c);

    var last = nowSec();
    while (true) {
        var in: wire.AwMsg = undefined;
        const r = awidget.poll(&c, &in, 500);
        if (r < 0) linux.exit(0);

        if (r > 0 and in.type == wire.AW_INPUT and in.a == wire.AW_IN_MOTION) {
            var want: []const u8 = "";
            if (in.b >= 0) {
                const lx = in.b;
                const ly = in.c;
                const ty = CARD_Y + 50;
                if (ly >= ty and ly < ty + 16) {
                    // "the ghost of terry davis, but {suffix}" — three hover
                    // zones: the phrase, the man, the blank.
                    const col = @divTrunc(lx - 14, 8);
                    if (col >= 0 and col < 13) {
                        want = "ghost";
                    } else if (col >= 13 and col < 24) {
                        want = "terry";
                    } else if (col >= 30 and col < 30 + @as(i32, @intCast(suffix.len))) {
                        want = suffix;
                    }
                }
            }
            if (!std.mem.eql(u8, want, sliceZ(&hovering))) {
                copyStr(&hovering, want);
                draw.clear(&c.buf);
                drawName(&c, suffix);
                if (hovering[0] != 0) {
                    if (hbodyOf(sliceZ(&hovering))) |hv| {
                        drawHovercard(&c, hv.title, hv.body);
                    }
                }
                awidget.commit(&c);
            }
            continue;
        }

        const now = nowSec();
        if (now - last < 6) continue;
        last = now;
        idx = (idx + 1) % (if (ntag > 0) ntag else 1);
        suffix = if (ntag > 0) sliceZ(&tags[idx]) else "asian";
        if (hovering[0] == 0) {
            draw.clear(&c.buf);
            drawName(&c, suffix);
            awidget.commit(&c);
        }
    }
}
