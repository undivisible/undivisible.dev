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

fn hkHour() i32 {
    const t = nowSec();
    return @intCast(@mod(@divTrunc(t, 3600) + 8, 24));
}

fn hkMin() i32 {
    const t = nowSec();
    return @intCast(@mod(@divTrunc(t, 60), 60));
}

fn skyStops(hour: i32, top: *u32, bot: *u32) void {
    if (hour >= 5 and hour < 8) {
        top.* = 0x2a1e33;
        bot.* = 0xc96f4a;
    } else if (hour < 12) {
        top.* = 0x1d3a5f;
        bot.* = 0x7fb2d9;
    } else if (hour < 15) {
        top.* = 0x2456a0;
        bot.* = 0x9fc7e8;
    } else if (hour < 18) {
        top.* = 0x27436e;
        bot.* = 0xd99a5b;
    } else if (hour < 20) {
        top.* = 0x1d1230;
        bot.* = 0xc4586e;
    } else {
        top.* = 0x05060e;
        bot.* = 0x141b2e;
    }
}

fn paint(b: *draw.AwBuf) void {
    var top: u32 = 0;
    var bot: u32 = 0;
    const hour = hkHour();
    const W = b.w;
    const H = b.h;
    skyStops(hour, &top, &bot);
    var y: i32 = 0;
    while (y < H) : (y += 1) {
        const c = draw.mix(top, bot, @divTrunc(y * 255, H));
        var x: i32 = 0;
        while (x < W) : (x += 1) {
            const idx = @as(usize, @intCast(y * W + x));
            b.px[idx] = if ((x ^ y) & 3 == 0) draw.mix(c, bot, 8) else c;
        }
    }
    const day = hour >= 6 and hour < 19;
    const t = @mod(hour + 24 - 6, 24) * 60 + hkMin();
    const sx: i32 = 60 + @divTrunc(@as(i32, @intCast(W - 120)) * (if (day) t else t - 780), 780);
    const dx: i32 = sx - @divTrunc(W, 2);
    const adx: i32 = if (dx < 0) -dx else dx;
    const sy: i32 = @divTrunc(H, 5) + @divTrunc(adx * adx, W * 2);
    const sun: u32 = if (day) 0xfff2cc else 0xc9cfdd;
    var j: i32 = -14;
    while (j <= 14) : (j += 1) {
        var i: i32 = -14;
        while (i <= 14) : (i += 1) {
            if (i * i + j * j > 14 * 14) continue;
            const px_x = sx + i;
            const px_y = sy + j;
            if (px_x < 0 or px_x >= W or px_y < 0 or px_y >= H) continue;
            const idx = @as(usize, @intCast(px_y * W + px_x));
            b.px[idx] = if (i * i + j * j > 12 * 12) draw.mix(sun, b.px[idx], 128) else sun;
        }
    }
    if (!day) {
        var k: i32 = 0;
        while (k < 90) : (k += 1) {
            const sx2 = @mod(k * 977 + 131, W);
            const sy2 = @mod(k * 613 + 47, @divTrunc(H * 2, 3));
            b.px[@as(usize, @intCast(sy2 * W + sx2))] = if (@mod(k, 3) != 0) 0x556077 else 0x8a94aa;
        }
    }
}

pub fn main() void {
    var c: awidget.AwClient = undefined;
    if (!awidget.openBg(&c, "sky")) linux.exit(1);
    paint(&c.buf);
    awidget.commit(&c);
    var last = nowSec();
    while (true) {
        var in: wire.AwMsg = undefined;
        if (awidget.poll(&c, &in, 1000) < 0) linux.exit(0);
        if (in.type == wire.AW_SURFACE) {
            paint(&c.buf);
            awidget.commit(&c);
            last = nowSec();
            continue;
        }
        const now = nowSec();
        if (now - last < 60) continue;
        last = now;
        paint(&c.buf);
        awidget.commit(&c);
    }
}
