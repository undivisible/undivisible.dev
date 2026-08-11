const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const awidget = @import("awidget.zig");
const wire = @import("wire.zig");

const MAXLINE: usize = 400;

var lines: [MAXLINE][200]u8 = std.mem.zeroes([MAXLINE][200]u8);
var llen: [MAXLINE]usize = [_]usize{0} ** MAXLINE;
var line_color: [MAXLINE]u32 = [_]u32{0} ** MAXLINE;
var nlines: usize = 0;
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
    var raw: [512]u8 = undefined;
    while (nlines < MAXLINE) {
        const n = linux.read(fd, &raw, raw.len);
        if (linux.errno(n) != .SUCCESS or n == 0) break;
        const data = raw[0..n];
        var p: usize = 0;
        while (p < data.len and nlines < MAXLINE) {
            var color: u32 = 0xd8dbe2;
            var out: [200]u8 = std.mem.zeroes([200]u8);
            var ol: usize = 0;
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
                            if (std.mem.eql(u8, c, "90")) color = 0x8890a0
                            else if (std.mem.eql(u8, c, "96")) color = 0x7ec8e8
                            else if (std.mem.eql(u8, c, "91")) color = 0xff8888
                            else if (std.mem.eql(u8, c, "1;37")) color = 0xffffff
                            else color = 0xd8dbe2;
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
            appendLine(color, out[0..ol]);
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
    var raw: [512]u8 = undefined;
    while (nlines < MAXLINE) {
        const n = linux.read(pfd[0], &raw, raw.len);
        if (linux.errno(n) != .SUCCESS or n == 0) break;
        const data = raw[0..n];
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
        const li: i32 = scroll_row + i;
        if (li >= @as(i32, @intCast(nlines))) break;
        const idx: usize = @intCast(li);
        _ = draw.text(&c.buf, 16, 28 + i * 18, lines[idx][0..llen[idx]], line_color[idx], 1);
    }
    if (@as(i32, @intCast(nlines)) > rows) {
        var pos: [48]u8 = undefined;
        const ps = std.fmt.bufPrint(&pos, "{d}/{d}  arrows scroll", .{ scroll_row + 1, nlines }) catch unreachable;
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

    if (std.mem.eql(u8, name, "fetch")) loadCmd("fastfetch 2>/dev/null")
    else if (std.mem.eql(u8, name, "docs")) loadText("/readme.md")
    else {
        var path: [160]u8 = undefined;
        const ps = std.fmt.bufPrint(&path, "/usr/share/alpenglowed/content/{s}.txt", .{name}) catch unreachable;
        var pz: [160]u8 = std.mem.zeroes([160]u8);
        @memcpy(pz[0..ps.len], ps);
        loadText(@ptrCast(&pz));
    }

    var c: awidget.AwClient = undefined;
    if (!awidget.open(&c, name, 800, 540, wire.AW_CENTER, 110, wire.AW_F_RESIZE)) linux.exit(1);
    drawAll(&c, name);

    while (true) {
        var in: wire.AwMsg = undefined;
        const r = awidget.poll(&c, &in, 400);
        if (r < 0) linux.exit(0);
        if (r == 0) continue;
        const rows: i32 = @divTrunc(c.buf.h - 40, 18);
        if (in.type == wire.AW_SURFACE) {
            if (scroll_row > @as(i32, @intCast(nlines)) - 1) scroll_row = @as(i32, @intCast(nlines)) - 1;
            if (scroll_row < 0) scroll_row = 0;
            drawAll(&c, name);
            continue;
        }
        if (in.type != wire.AW_INPUT) continue;

        if (in.a == wire.AW_IN_KEY) {
            const k = in.d;
            if (k == 'q') linux.exit(0);
            if (k == 0x100 + 'A' and scroll_row > 0) scroll_row -= 1;
            if (k == 0x100 + 'B' and scroll_row < @as(i32, @intCast(nlines)) - 1) scroll_row += 1;
            if (k == 0x100 + '5') { scroll_row -= rows; if (scroll_row < 0) scroll_row = 0; }
            if (k == 0x100 + '6') {
                scroll_row += rows;
                if (scroll_row > @as(i32, @intCast(nlines)) - 1) scroll_row = @as(i32, @intCast(nlines)) - 1;
            }
            drawAll(&c, name);
        } else if (in.a == wire.AW_IN_PRESS) {
            if (in.b > c.buf.w - 30 and in.c < 24) linux.exit(0);
            const row: i32 = @divTrunc(in.c - 28, 18) + scroll_row;
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
