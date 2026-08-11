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

const dows = [_][]const u8{ "sun", "mon", "tue", "wed", "thu", "fri", "sat" };
const mons = [_][]const u8{ "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec" };

fn civilFromDays(z_in: i64) struct { year: i64, month: i32, day: i32 } {
    const z = z_in + 719468;
    const era = @divFloor(if (z >= 0) z else z - 146096, 146097);
    const doe = z - era * 146097;
    const yoe = @divFloor(doe - @divFloor(doe, 1460) + @divFloor(doe, 36524) - @divFloor(doe, 146096), 365);
    const y = yoe + era * 400;
    const doy = doe - (365 * yoe + @divFloor(yoe, 4) - @divFloor(yoe, 100));
    const mp = @divFloor(5 * doy + 2, 153);
    const d: i32 = @intCast(doy - @divFloor(153 * mp + 2, 5) + 1);
    const m: i32 = @intCast(if (mp < 10) mp + 3 else mp - 9);
    const year = y + @as(i64, if (m <= 2) 1 else 0);
    return .{ .year = year, .month = m, .day = d };
}

pub fn main() void {
    var c: awidget.AwClient = undefined;
    if (!awidget.open(&c, "hong kong", 250, 92, 28, 26, 0)) linux.exit(1);

    var last: i64 = 0;
    while (true) {
        var in: wire.AwMsg = undefined;
        if (awidget.poll(&c, &in, 200) < 0) linux.exit(0);
        const now = nowSec();
        if (now == last) continue;
        last = now;

        const t = now + 8 * 3600;
        const total_sec = @mod(t, 86400);
        const hour: i32 = @intCast(@divTrunc(total_sec, 3600));
        const min: i32 = @intCast(@divTrunc(@mod(total_sec, 3600), 60));
        const sec: i32 = @intCast(@mod(total_sec, 60));
        const days = @divFloor(t, 86400);
        const wday: i32 = @intCast(@mod(days + 4, 7));
        const civil = civilFromDays(days);

        draw.frame(&c.buf, "hong kong");
        var buf: [64]u8 = undefined;
        const time_str = std.fmt.bufPrint(&buf, "{d:0>2}:{d:0>2}:{d:0>2}", .{ hour, min, sec }) catch unreachable;
        _ = draw.textLg(&c.buf, 12, 22, time_str, 0xffffff);
        const date_str = std.fmt.bufPrint(&buf, "{s} {d:0>2} {s}  gmt+8", .{ dows[@intCast(wday)], civil.day, mons[@intCast(civil.month - 1)] }) catch unreachable;
        _ = draw.text(&c.buf, 12, 62, date_str, 0x8890a0, 1);
        awidget.commit(&c);
    }
}
