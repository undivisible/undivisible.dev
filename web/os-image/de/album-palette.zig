const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");

fn brightness(c: u32) u32 {
    return (((c >> 16) & 255) * 54 + ((c >> 8) & 255) * 183 + (c & 255) * 19) >> 8;
}

fn parse(bytes: []const u8) ?[5]u32 {
    var tokens = std.mem.tokenizeAny(u8, bytes, " \t\r\n");
    var colors: [5]u32 = undefined;
    for (&colors) |*color| {
        const token = tokens.next() orelse return null;
        if (token.len != 6) return null;
        color.* = std.fmt.parseInt(u32, token, 16) catch return null;
        for (token) |c| if (!std.ascii.isHex(c)) return null;
    }
    if (tokens.next() != null) return null;
    std.mem.sort(u32, &colors, {}, struct {
        fn less(_: void, a: u32, b: u32) bool {
            return brightness(a) < brightness(b);
        }
    }.less);
    return colors;
}

fn makeTable(colors: [5]u32) [256]u32 {
    // Normalize the tones so dark album art cannot turn text into dark ink.
    const stops = [5]u32{
        draw.mix(colors[0], 0, 230),
        draw.mix(colors[1], 0xffffff, 64),
        draw.mix(colors[2], 0xffffff, 141),
        draw.mix(colors[3], 0xffffff, 192),
        draw.mix(colors[4], 0xffffff, 243),
    };
    var table: [256]u32 = undefined;
    for (&table, 0..) |*value, i| {
        const position = i * 4;
        const segment: usize = @min(position / 255, 3);
        value.* = draw.mix(stops[segment], stops[segment + 1], @intCast(position - segment * 255));
    }
    return table;
}

pub const Palette = struct {
    colors: ?[5]u32 = null,
    table: [256]u32 = undefined,

    pub fn reload(self: *Palette) bool {
        var next: ?[5]u32 = null;
        const raw = linux.open("/run/undesk/album-palette", .{ .ACCMODE = .RDONLY, .NONBLOCK = true }, 0);
        if (linux.errno(raw) == .SUCCESS) {
            const fd: i32 = @intCast(raw);
            defer _ = linux.close(fd);
            var bytes: [64]u8 = undefined;
            const n = linux.read(fd, &bytes, bytes.len);
            if (linux.errno(n) == .SUCCESS and n < bytes.len) next = parse(bytes[0..n]);
        }
        if (std.meta.eql(self.colors, next)) return false;
        self.colors = next;
        if (next) |colors| self.table = makeTable(colors);
        return true;
    }

    pub fn color(self: *const Palette, source: u32) u32 {
        return self.table[brightness(source)];
    }
};

test "album palette accepts exactly five RGB colors and rejects malformed input" {
    try std.testing.expect(parse("ff5705 101010 cccccc 123456 abcdef\n") != null);
    for ([_][]const u8{ "ff5705", "#ff5705 101010 cccccc 123456 abcdef", "gggggg 101010 cccccc 123456 abcdef", "-f5705 101010 cccccc 123456 abcdef", "ff5705 101010 cccccc 123456 abcdef ffffff" }) |bad| {
        try std.testing.expect(parse(bad) == null);
    }
    const colors = parse("ffffff 000000 555555 aaaaaa 888888").?;
    try std.testing.expectEqual(@as(u32, 0), colors[0]);
    try std.testing.expectEqual(@as(u32, 0xffffff), colors[4]);
}

fn relativeLuminance(color: u32) f64 {
    var result: f64 = 0;
    for ([_]u5{ 16, 8, 0 }, [_]f64{ 0.2126, 0.7152, 0.0722 }) |shift, weight| {
        const channel = @as(f64, @floatFromInt((color >> shift) & 255)) / 255;
        const linear = if (channel <= 0.04045) channel / 12.92 else std.math.pow(f64, (channel + 0.055) / 1.055, 2.4);
        result += linear * weight;
    }
    return result;
}

test "dark, monochrome and saturated albums retain readable text contrast" {
    for ([_][]const u8{
        "402000 602000 804000 a04000 000000",
        "000000 000000 000000 000000 000000",
        "ffffff ffffff ffffff ffffff ffffff",
        "000000 ffffff 000000 ffffff 000000",
        "0000ff 0000ff 0000ff 0000ff 0000ff",
    }) |input| {
        const colors = parse(input).?;
        const palette: Palette = .{ .colors = colors, .table = makeTable(colors) };
        const text = relativeLuminance(palette.color(0x969696));
        const panel = relativeLuminance(palette.color(0x0f0f0f));
        try std.testing.expect((text + 0.05) / (panel + 0.05) >= 4.5);
    }
}
