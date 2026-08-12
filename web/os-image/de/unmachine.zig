const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const awidget = @import("awidget.zig");
const wire = @import("wire.zig");

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

fn firstF64(data: []const u8) f64 {
    var i: usize = 0;
    while (i < data.len and (data[i] == ' ' or data[i] == '\n' or data[i] == '\t')) i += 1;
    const start = i;
    while (i < data.len and data[i] != ' ' and data[i] != '\n' and data[i] != '\t') i += 1;
    return std.fmt.parseFloat(f64, data[start..i]) catch 0;
}

pub fn main() void {
    var c: awidget.AwClient = undefined;
    if (!awidget.open(&c, "machine", 250, 116, -28, 26, 0)) linux.exit(1);

    var rbuf: [4096]u8 = undefined;
    var last: i64 = 0;
    while (true) {
        var in: wire.AwMsg = undefined;
        if (awidget.poll(&c, &in, 200) < 0) linux.exit(0);
        const now = nowSec();
        if (now == last) continue;
        last = now;

        const up = firstF64(readFile("/proc/uptime", &rbuf));
        const load = firstF64(readFile("/proc/loadavg", &rbuf));

        var mt: i64 = 0;
        var ma: i64 = 0;
        const mem = readFile("/proc/meminfo", &rbuf);
        var it = std.mem.tokenizeAny(u8, mem, " \n");
        while (it.next()) |k| {
            const v_str = it.next() orelse break;
            const _kb = it.next() orelse break;
            _ = _kb;
            const v = std.fmt.parseInt(i64, v_str, 10) catch 0;
            if (std.mem.eql(u8, k, "MemTotal:")) mt = v;
            if (std.mem.eql(u8, k, "MemAvailable:")) ma = v;
        }

        draw.frame(&c.buf, "machine");
        var buf: [96]u8 = undefined;
        const s1 = std.fmt.bufPrint(&buf, "up {d: >3}s   load {d:.2}", .{ @as(u32, @intFromFloat(up)), load }) catch unreachable;
        _ = draw.text(&c.buf, 12, 26, s1, 0xd8dbe2, 1);
        // The meters: mem in amber, load in cyan, on a dark track. The load
        // bar treats 1.0 as full — one busy cpu is all this machine has.
        const track_w: i32 = c.buf.w - 24;
        const mem_fill: i32 = if (mt > 0) @intCast(@divTrunc((mt - ma) * @as(i64, track_w), mt)) else 0;
        draw.fill(&c.buf, 12, 46, track_w, 6, 0x232a3a);
        draw.fill(&c.buf, 12, 46, @max(mem_fill, 1), 6, 0xf0c674);
        var load_fill: i32 = @intFromFloat(load * @as(f64, @floatFromInt(track_w)));
        if (load_fill > track_w) load_fill = track_w;
        draw.fill(&c.buf, 12, 66, track_w, 6, 0x232a3a);
        draw.fill(&c.buf, 12, 66, @max(load_fill, 1), 6, 0x7ec8e8);
        const s2 = std.fmt.bufPrint(&buf, "mem {d}/{d}M", .{ @divTrunc(mt - ma, 1024), @divTrunc(mt, 1024) }) catch unreachable;
        _ = draw.text(&c.buf, 12, 76, s2, 0x8890a0, 1);
        _ = draw.text(&c.buf, 12, 94, "linux 7.1.3 i686 real", 0x8890a0, 1);
        awidget.commit(&c);
    }
}
