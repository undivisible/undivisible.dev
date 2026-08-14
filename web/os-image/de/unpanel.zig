const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const awidget = @import("awidget.zig");
const wire = @import("wire.zig");

const MAXLINE: usize = 400;

var lines: [MAXLINE][200]u8 = std.mem.zeroes([MAXLINE][200]u8);
var llen: [MAXLINE]usize = [_]usize{0} ** MAXLINE;
var line_color: [MAXLINE]u32 = [_]u32{0} ** MAXLINE;
// A line can change color mid-way (ages amber, titles cyan): each ANSI code
// opens a span at the offset it appeared. line_color keeps the first span's
// color for the rows that never split.
const MAXSPAN: usize = 8;
var span_at: [MAXLINE][MAXSPAN]u16 = std.mem.zeroes([MAXLINE][MAXSPAN]u16);
var span_color: [MAXLINE][MAXSPAN]u32 = std.mem.zeroes([MAXLINE][MAXSPAN]u32);
var span_n: [MAXLINE]usize = [_]usize{0} ** MAXLINE;
var nlines: usize = 0;
// The wrapped view: source lines folded to the panel's current width, so
// nothing clips at the edge (docs ships unwrapped upstream lines, and any
// panel can be resized narrower than the copy).
const MAXVIEW: usize = 1200;
var vline: [MAXVIEW]u16 = [_]u16{0} ** MAXVIEW;
var vfrom: [MAXVIEW]u16 = [_]u16{0} ** MAXVIEW;
var vto: [MAXVIEW]u16 = [_]u16{0} ** MAXVIEW;
var nview: usize = 0;
var wrap_cols: i32 = 0;

fn rewrap(cols_raw: i32) void {
    const cols: usize = @intCast(@max(cols_raw, 20));
    wrap_cols = @intCast(cols);
    nview = 0;
    var li: usize = 0;
    while (li < nlines and nview < MAXVIEW) : (li += 1) {
        const len = llen[li];
        if (len == 0) {
            vline[nview] = @intCast(li);
            vfrom[nview] = 0;
            vto[nview] = 0;
            nview += 1;
            continue;
        }
        var from: usize = 0;
        while (from < len and nview < MAXVIEW) {
            var to = @min(from + cols, len);
            if (to < len) {
                // Fold at the last space that fits; hard-break a single
                // word longer than the row.
                var brk = to;
                while (brk > from and lines[li][brk] != ' ') brk -= 1;
                if (brk > from) to = brk;
            }
            vline[nview] = @intCast(li);
            vfrom[nview] = @intCast(from);
            vto[nview] = @intCast(to);
            nview += 1;
            from = to;
            while (from < len and lines[li][from] == ' ') from += 1;
        }
    }
}
var site_urls: [24][160]u8 = std.mem.zeroes([24][160]u8);
var site_ulen: [24]usize = [_]usize{0} ** 24;
var site_rows: [24]i32 = [_]i32{0} ** 24;
var nsites: usize = 0;
var scroll_row: i32 = 0;

fn appendLine(color: u32, dst: []const u8) void {
    if (nlines >= MAXLINE) return;
    const n = @min(dst.len, 198);
    @memcpy(&lines[nlines], dst[0..n]);
    llen[nlines] = n;
    line_color[nlines] = color;
    var i: usize = 0;
    while (i < n) : (i += 1) {
        if (lines[nlines][i] == 0) { llen[nlines] = i; break; }
    }
    const o = lines[nlines][0..llen[nlines]];
    const paren = std.mem.indexOf(u8, o, ") ");
    const url = std.mem.indexOf(u8, o, "https://");
    if (paren != null and url != null and nsites < 24) {
        const u = url.?;
        var len: usize = 0;
        while (u + len < o.len and o[u + len] != ' ' and len < 158) len += 1;
        @memcpy(&site_urls[nsites], o[u .. u + len]);
        site_ulen[nsites] = len;
        site_rows[nsites] = @intCast(nlines);
        nsites += 1;
    }
    nlines += 1;
}

fn loadText(path: [*:0]const u8) void {
    const fd_raw = linux.open(path, .{ .ACCMODE = .RDONLY }, 0);
    if (linux.errno(fd_raw) != .SUCCESS) {
        const msg = std.fmt.bufPrint(&lines[0], "missing: {s}", .{path}) catch unreachable;
        llen[0] = msg.len;
        line_color[0] = 0xff8888;
        nlines = 1;
        return;
    }
    const fd: i32 = @intCast(fd_raw);
    defer _ = linux.close(fd);
    // Whole file first, one parse: chunked parsing split lines (and even
    // escape codes) at every 512-byte read boundary.
    const S = struct {
        var raw: [131072]u8 = undefined;
    };
    var total: usize = 0;
    while (total < S.raw.len) {
        const n = linux.read(fd, S.raw[total..].ptr, S.raw.len - total);
        if (linux.errno(n) != .SUCCESS or n == 0) break;
        total += n;
    }
    {
        const data = S.raw[0..total];
        var p: usize = 0;
        while (p < data.len and nlines < MAXLINE) {
            var out: [200]u8 = std.mem.zeroes([200]u8);
            var ol: usize = 0;
            var sp_at: [MAXSPAN]u16 = std.mem.zeroes([MAXSPAN]u16);
            var sp_color: [MAXSPAN]u32 = std.mem.zeroes([MAXSPAN]u32);
            var sp_n: usize = 0;
            while (p < data.len and data[p] != '\n' and ol < 198) {
                if (data[p] == 27) {
                    p += 1;
                    if (p < data.len and data[p] == '[') {
                        p += 1;
                        var code: [16]u8 = undefined;
                        var cl: usize = 0;
                        while (p < data.len and !((data[p] >= 'a' and data[p] <= 'z') or (data[p] >= 'A' and data[p] <= 'Z'))) {
                            if (cl < 15) { code[cl] = data[p]; cl += 1; }
                            p += 1;
                        }
                        if (p < data.len and data[p] == 'm') {
                            const c = code[0..cl];
                            var color: u32 = 0xd8dbe2;
                            if (std.mem.eql(u8, c, "90")) color = 0x8890a0
                            else if (std.mem.eql(u8, c, "96")) color = 0x7ec8e8
                            else if (std.mem.eql(u8, c, "91")) color = 0xff8888
                            else if (std.mem.eql(u8, c, "92")) color = 0xa8d68a
                            else if (std.mem.eql(u8, c, "93")) color = 0xf0c674
                            else if (std.mem.eql(u8, c, "95")) color = 0xd8a8e8
                            else if (std.mem.eql(u8, c, "1;37")) color = 0xffffff;
                            if (sp_n < MAXSPAN) {
                                sp_at[sp_n] = @intCast(ol);
                                sp_color[sp_n] = color;
                                sp_n += 1;
                            }
                            p += 1;
                        }
                    } else if (p < data.len and data[p] == ']') {
                        while (p < data.len and data[p] != 7) p += 1;
                        if (p < data.len) p += 1;
                    }
                    continue;
                }
                if (data[p] == '\r') { p += 1; continue; }
                out[ol] = data[p];
                ol += 1;
                p += 1;
            }
            if (p < data.len and data[p] == '\n') p += 1;
            const first: u32 = if (sp_n > 0) sp_color[0] else 0xd8dbe2;
            const idx = nlines;
            appendLine(first, out[0..ol]);
            if (nlines > idx) {
                span_at[idx] = sp_at;
                span_color[idx] = sp_color;
                span_n[idx] = sp_n;
            }
        }
    }
}

fn loadCmd(cmd: [*:0]const u8) void {
    var pfd: [2]i32 = undefined;
    if (linux.errno(linux.pipe(&pfd)) != .SUCCESS) return;
    const pid_raw = linux.fork();
    if (pid_raw == 0) {
        _ = linux.close(pfd[0]);
        _ = linux.dup2(pfd[1], 1);
        _ = linux.dup2(pfd[1], 2);
        const argv = [_:null]?[*:0]const u8{ "/bin/sh", "-c", cmd };
        const envp = [_:null]?[*:0]const u8{};
        _ = linux.execve("/bin/sh", @ptrCast(&argv), @ptrCast(&envp));
        linux.exit(127);
    }
    _ = linux.close(pfd[1]);
    const S = struct {
        var raw: [131072]u8 = undefined;
    };
    var total: usize = 0;
    while (total < S.raw.len) {
        const n = linux.read(pfd[0], S.raw[total..].ptr, S.raw.len - total);
        if (linux.errno(n) != .SUCCESS or n == 0) break;
        total += n;
    }
    {
        const data = S.raw[0..total];
        var p: usize = 0;
        while (p < data.len and nlines < MAXLINE) {
            var out: [200]u8 = std.mem.zeroes([200]u8);
            var ol: usize = 0;
            while (p < data.len and data[p] != '\n' and ol < 198) {
                if (data[p] == 27) {
                    while (p < data.len and data[p] != 'm' and data[p] != 7) p += 1;
                    if (p < data.len) p += 1;
                    continue;
                }
                if (data[p] == '\r') { p += 1; continue; }
                out[ol] = data[p];
                ol += 1;
                p += 1;
            }
            if (p < data.len and data[p] == '\n') p += 1;
            appendLine(0xd8dbe2, out[0..ol]);
        }
    }
    _ = linux.close(pfd[0]);
    var status: u32 = 0;
    _ = linux.waitpid(@intCast(pid_raw), &status, 0);
}

fn drawAll(c: *awidget.AwClient, title: []const u8) void {
    draw.frame(&c.buf, title);
    _ = draw.text(&c.buf, c.buf.w - 22, 6, "x", 0x9aa2b2, 1);
    const rows: i32 = @divTrunc(c.buf.h - 40, 18);
    var i: i32 = 0;
    while (i < rows) : (i += 1) {
        const vi: i32 = scroll_row + i;
        if (vi >= @as(i32, @intCast(nview))) break;
        const v: usize = @intCast(vi);
        const idx: usize = vline[v];
        const seg_from: usize = vfrom[v];
        const seg_to: usize = vto[v];
        const y = 28 + i * 18;
        if (span_n[idx] == 0) {
            _ = draw.text(&c.buf, 16, y, lines[idx][seg_from..seg_to], line_color[idx], 1);
        } else {
            var x: i32 = 16;
            var from: usize = seg_from;
            // The color already in effect where this row starts.
            var col: u32 = 0xd8dbe2;
            var sidx: usize = 0;
            while (sidx < span_n[idx] and @as(usize, span_at[idx][sidx]) <= from) : (sidx += 1) {
                col = span_color[idx][sidx];
            }
            while (from < seg_to) {
                var to: usize = seg_to;
                if (sidx < span_n[idx]) {
                    const at: usize = @min(@as(usize, span_at[idx][sidx]), seg_to);
                    if (at > from) {
                        to = at;
                    } else {
                        col = span_color[idx][sidx];
                        sidx += 1;
                        continue;
                    }
                }
                x += draw.text(&c.buf, x, y, lines[idx][from..to], col, 1);
                from = to;
            }
        }
    }
    if (@as(i32, @intCast(nview)) > rows) {
        var pos: [48]u8 = undefined;
        const ps = std.fmt.bufPrint(&pos, "{d}/{d}  arrows scroll", .{ scroll_row + 1, nview }) catch unreachable;
        _ = draw.text(&c.buf, c.buf.w - 200, c.buf.h - 20, ps, 0x596074, 1);
    }
    var k: i32 = 0;
    while (k < 3) : (k += 1)
        draw.fill(&c.buf, c.buf.w - 6 - k * 5, c.buf.h - 6, 3, 3, 0x596074);
    awidget.commit(c);
}

pub fn main() void {
    var name_buf: [64]u8 = std.mem.zeroes([64]u8);
    var name: []const u8 = "about";
    {
        var cmdline: [512]u8 = undefined;
        const fd_raw = linux.open("/proc/self/cmdline", .{ .ACCMODE = .RDONLY }, 0);
        if (linux.errno(fd_raw) == .SUCCESS) {
            const fd: i32 = @intCast(fd_raw);
            const n = linux.read(fd, &cmdline, cmdline.len);
            _ = linux.close(fd);
            if (linux.errno(n) == .SUCCESS and n > 0) {
                var parts = std.mem.splitScalar(u8, cmdline[0..n], 0);
                _ = parts.next();
                if (parts.next()) |a| {
                    const m = @min(a.len, 63);
                    @memcpy(name_buf[0..m], a[0..m]);
                    name = name_buf[0..m];
                }
            }
        }
    }

    if (std.mem.eql(u8, name, "fetch")) loadCmd("fastfetch 2>/dev/null | sed -e 's/Host: /\\nHost: /' -e 's/Kernel: /\\nKernel: /'")
    else if (std.mem.eql(u8, name, "docs")) loadText("/readme.md")
    else {
        var path: [160]u8 = undefined;
        const ps = std.fmt.bufPrint(&path, "/usr/share/undesk/content/{s}.txt", .{name}) catch unreachable;
        var pz: [160]u8 = std.mem.zeroes([160]u8);
        @memcpy(pz[0..ps.len], ps);
        loadText(@ptrCast(&pz));
    }

    var c: awidget.AwClient = undefined;
    if (!awidget.open(&c, name, 800, 540, wire.AW_CENTER, 110, wire.AW_F_RESIZE)) linux.exit(1);
    rewrap(@divTrunc(c.buf.w - 32, 8));
    drawAll(&c, name);

    while (true) {
        var in: wire.AwMsg = undefined;
        const r = awidget.poll(&c, &in, 400);
        if (r < 0) linux.exit(0);
        if (r == 0) continue;
        const rows: i32 = @divTrunc(c.buf.h - 40, 18);
        if (in.type == wire.AW_SURFACE) {
            const cols = @divTrunc(c.buf.w - 32, 8);
            if (cols != wrap_cols) rewrap(cols);
            if (scroll_row > @as(i32, @intCast(nview)) - 1) scroll_row = @as(i32, @intCast(nview)) - 1;
            if (scroll_row < 0) scroll_row = 0;
            drawAll(&c, name);
            continue;
        }
        if (in.type != wire.AW_INPUT) continue;

        if (in.a == wire.AW_IN_KEY) {
            const k = in.d;
            if (k == 'q') linux.exit(0);
            if (k == 0x100 + 'A' and scroll_row > 0) scroll_row -= 1;
            if (k == 0x100 + 'B' and scroll_row < @as(i32, @intCast(nview)) - 1) scroll_row += 1;
            if (k == 0x100 + '5') { scroll_row -= rows; if (scroll_row < 0) scroll_row = 0; }
            if (k == 0x100 + '6') {
                scroll_row += rows;
                if (scroll_row > @as(i32, @intCast(nview)) - 1) scroll_row = @as(i32, @intCast(nview)) - 1;
            }
            drawAll(&c, name);
        } else if (in.a == wire.AW_IN_PRESS) {
            if (in.b > c.buf.w - 30 and in.c < 24) linux.exit(0);
            const vrow: i32 = @divTrunc(in.c - 28, 18) + scroll_row;
            var row: i32 = -1;
            if (vrow >= 0 and vrow < @as(i32, @intCast(nview))) row = vline[@intCast(vrow)];
            var s: usize = 0;
            while (s < nsites) : (s += 1) {
                if (site_rows[s] == row) {
                    const ser_raw = linux.open("/dev/ttyS0", .{ .ACCMODE = .WRONLY }, 0);
                    if (linux.errno(ser_raw) == .SUCCESS) {
                        const ser: i32 = @intCast(ser_raw);
                        var buf: [200]u8 = undefined;
                        const msg = std.fmt.bufPrint(&buf, "@@open {s}\n", .{site_urls[s][0..site_ulen[s]]}) catch unreachable;
                        _ = linux.write(ser, msg.ptr, msg.len);
                        _ = linux.close(ser);
                    }
                }
            }
        }
    }
}
