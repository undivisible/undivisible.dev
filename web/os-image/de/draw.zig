const std = @import("std");

pub const FONT_SMALL_W: i32 = 8;
pub const FONT_SMALL_H: i32 = 16;
pub const FONT_LARGE_W: i32 = 16;
pub const FONT_LARGE_H: i32 = 32;

const font_small_bin: *const [256 * 128]u8 = @embedFile("font_small.bin");
const font_large_bin: *const [256 * 512]u8 = @embedFile("font_large.bin");

pub const font_small: [*]const u8 = font_small_bin;
pub const font_large: [*]const u8 = font_large_bin;

pub const AW_OPAQUE: u32 = 0xff000000;

pub const AwBuf = struct {
    px: [*]u32,
    w: i32,
    h: i32,
};

pub fn mix(a: u32, b: u32, t: i32) u32 {
    const ar: u32 = (a >> 16) & 255;
    const ag: u32 = (a >> 8) & 255;
    const ab: u32 = a & 255;
    const br: u32 = (b >> 16) & 255;
    const bg: u32 = (b >> 8) & 255;
    const bl: u32 = b & 255;
    const dr: i32 = @bitCast(br -% ar);
    const dg: i32 = @bitCast(bg -% ag);
    const db: i32 = @bitCast(bl -% ab);
    const r: u32 = ar +% @as(u32, @bitCast(dr * t >> 8));
    const g: u32 = ag +% @as(u32, @bitCast(dg * t >> 8));
    const c: u32 = ab +% @as(u32, @bitCast(db * t >> 8));
    return ((r & 255) << 16) | ((g & 255) << 8) | (c & 255);
}

fn bufSlice(b: *const AwBuf) []u32 {
    return b.px[0..@as(usize, @intCast(b.w * b.h))];
}

pub fn clear(b: *AwBuf) void {
    @memset(bufSlice(b), 0);
}

pub fn px(b: *AwBuf, x: i32, y: i32, c: u32) void {
    if (x >= 0 and x < b.w and y >= 0 and y < b.h)
        b.px[@as(usize, @intCast(y * b.w + x))] = AW_OPAQUE | (c & 0xffffff);
}

pub fn fill(b: *AwBuf, x: i32, y: i32, w: i32, h: i32, c: u32) void {
    const x0: i32 = if (x < 0) 0 else x;
    const y0: i32 = if (y < 0) 0 else y;
    const x1: i32 = if (x + w > b.w) b.w else x + w;
    const y1: i32 = if (y + h > b.h) b.h else y + h;
    const v: u32 = AW_OPAQUE | (c & 0xffffff);
    var j: i32 = y0;
    while (j < y1) : (j += 1) {
        var i: i32 = x0;
        while (i < x1) : (i += 1)
            b.px[@as(usize, @intCast(j * b.w + i))] = v;
    }
}

pub fn blend(b: *AwBuf, x: i32, y: i32, w: i32, h: i32, c: u32, a: i32) void {
    const x0: i32 = if (x < 0) 0 else x;
    const y0: i32 = if (y < 0) 0 else y;
    const x1: i32 = if (x + w > b.w) b.w else x + w;
    const y1: i32 = if (y + h > b.h) b.h else y + h;
    var j: i32 = y0;
    while (j < y1) : (j += 1) {
        var i: i32 = x0;
        while (i < x1) : (i += 1) {
            const idx = @as(usize, @intCast(j * b.w + i));
            b.px[idx] = AW_OPAQUE | (mix(b.px[idx] & 0xffffff, c, a) & 0xffffff);
        }
    }
}

pub fn blendGlyph(b: *AwBuf, x: i32, y: i32, g: [*]const u8, gw: i32, gh: i32, c: u32) void {
    var r: i32 = 0;
    while (r < gh) : (r += 1) {
        var i: i32 = 0;
        while (i < gw) : (i += 1) {
            const a: i32 = g[@as(usize, @intCast(r * gw + i))];
            if (a == 0) continue;
            const px_x: i32 = x + i;
            const px_y: i32 = y + r;
            if (px_x < 0 or px_x >= b.w or px_y < 0 or px_y >= b.h) continue;
            const idx = @as(usize, @intCast(px_y * b.w + px_x));
            // Keep the pixel opaque: without the top byte the compositor
            // treats every glyph pixel as a transparent hole and the text
            // renders as sky — the great "why is everything slate blue".
            b.px[idx] = AW_OPAQUE | (mix(b.px[idx] & 0xffffff, c, a) & 0xffffff);
        }
    }
}

pub fn glyph(b: *AwBuf, x: i32, y: i32, ch: u8, c: u32, scale: i32) void {
    _ = scale;
    blendGlyph(b, x, y, font_small + @as(usize, ch) * @as(usize, @intCast(FONT_SMALL_W * FONT_SMALL_H)), FONT_SMALL_W, FONT_SMALL_H, c);
}

pub fn text(b: *AwBuf, x: i32, y: i32, s: []const u8, c: u32, scale: i32) i32 {
    _ = scale;
    var x0 = x;
    for (s) |ch| {
        glyph(b, x0, y, ch, c, 1);
        x0 += FONT_SMALL_W;
    }
    return x0 - x;
}

pub fn textLg(b: *AwBuf, x: i32, y: i32, s: []const u8, c: u32) i32 {
    var x0 = x;
    for (s) |ch| {
        blendGlyph(b, x0, y, font_large + @as(usize, ch) * @as(usize, @intCast(FONT_LARGE_W * FONT_LARGE_H)), FONT_LARGE_W, FONT_LARGE_H, c);
        x0 += FONT_LARGE_W;
    }
    return x0 - x;
}

pub fn frame(b: *AwBuf, title: ?[]const u8) void {
    fill(b, 0, 0, b.w, b.h, 0x10131c);
    // A visible title bar — the top strip is the drag handle, so it should
    // look like one instead of being an invisible 20px zone.
    if (title != null) {
        fill(b, 0, 0, b.w, 24, 0x181d2b);
        fill(b, 0, 24, b.w, 1, 0x232a3a);
    }
    fill(b, 0, 0, b.w, 1, 0x2a3040);
    fill(b, 0, b.h - 1, b.w, 1, 0x1a1e2a);
    fill(b, 0, 0, 1, b.h, 0x1f2432);
    fill(b, b.w - 1, 0, 1, b.h, 0x1f2432);
    if (title) |t| {
        fill(b, 10, 10, 6, 6, 0x7ec8e8);
        _ = text(b, 24, 6, t, 0x8e97ab, 1);
    }
}
