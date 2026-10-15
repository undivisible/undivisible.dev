const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const awidget = @import("awidget.zig");
const wire = @import("wire.zig");
const nowMs = @import("album-palette.zig").nowMs;

const Track = struct {
    listening: bool,
    title: [120]u8 = [_]u8{0} ** 120,
    artist: [120]u8 = [_]u8{0} ** 120,
    title_len: usize,
    artist_len: usize,
};

fn parseTrack(bytes: []const u8) ?Track {
    var lines = std.mem.splitScalar(u8, std.mem.trimEnd(u8, bytes, "\n"), '\n');
    const label = lines.next() orelse return null;
    const listening = if (std.mem.eql(u8, label, "listening")) true else if (std.mem.eql(u8, label, "last played")) false else return null;
    const title = lines.next() orelse return null;
    const artist = lines.next() orelse return null;
    if (lines.next() != null or title.len == 0 or title.len > 120 or artist.len == 0 or artist.len > 120) return null;
    for (title) |c| if (c < 32 or c > 126) return null;
    for (artist) |c| if (c < 32 or c > 126) return null;
    var track: Track = .{ .listening = listening, .title_len = title.len, .artist_len = artist.len };
    @memcpy(track.title[0..title.len], title);
    @memcpy(track.artist[0..artist.len], artist);
    return track;
}

fn readTrack() ?Track {
    const raw = linux.open("/run/undesk/now-playing", .{ .ACCMODE = .RDONLY, .NONBLOCK = true }, 0);
    if (linux.errno(raw) != .SUCCESS) return null;
    const fd: i32 = @intCast(raw);
    defer _ = linux.close(fd);
    var bytes: [384]u8 = undefined;
    const n = linux.read(fd, &bytes, bytes.len);
    if (linux.errno(n) != .SUCCESS or n >= bytes.len) return null;
    return parseTrack(bytes[0..n]);
}

fn trackLine(buf: *draw.AwBuf, y: i32, text: []const u8, color: u32) void {
    const max_chars: usize = @intCast(@max(0, @divTrunc(buf.w - 28, draw.FONT_SMALL_W)));
    if (text.len <= max_chars) {
        _ = draw.text(buf, 14, y, text, color, 1);
    } else if (max_chars > 3) {
        const end = draw.text(buf, 14, y, text[0 .. max_chars - 3], color, 1);
        _ = draw.text(buf, 14 + end, y, "...", color, 1);
    }
}

fn paint(client: *awidget.AwClient, track: ?Track, fade: i32) void {
    draw.clear(&client.buf);
    draw.frame(&client.buf, null);
    _ = draw.textLg(&client.buf, 14, 12, "max carter", 0xffffff);
    if (track) |song| {
        const muted = draw.mix(0x0d1118, 0xaeb6c6, fade);
        const bright = draw.mix(0x0d1118, 0xffffff, fade);
        _ = draw.text(&client.buf, 14, 52, if (song.listening) "listening" else "last played", muted, 1);
        trackLine(&client.buf, 74, song.title[0..song.title_len], bright);
        trackLine(&client.buf, 96, song.artist[0..song.artist_len], muted);
    }
    _ = draw.text(&client.buf, 14, 124, "software, systems and developer tools", 0xc4cad6, 1);
    _ = draw.text(&client.buf, 14, 148, "type 'about' for work and contact details", 0xaeb6c6, 1);
    awidget.commit(client);
}

pub fn main() void {
    var client: awidget.AwClient = undefined;
    if (!awidget.open(&client, "max carter", 520, 180, 28, -30, 0)) linux.exit(1);
    var track = readTrack();
    var fade_started = nowMs();
    var last_poll = fade_started;
    var last_frame = fade_started;
    var needs_fade = true;
    paint(&client, track, 0);
    while (true) {
        var message: wire.AwMsg = undefined;
        if (awidget.poll(&client, &message, if (needs_fade) 70 else 1000) < 0) linux.exit(0);
        const now = nowMs();
        if (now - last_poll >= 1000) {
            last_poll = now;
            const next = readTrack();
            if (!std.meta.eql(track, next)) {
                track = next;
                fade_started = now;
                needs_fade = true;
                paint(&client, track, 0);
            }
        }
        if (now - last_frame >= 70 and needs_fade) {
            last_frame = now;
            const progress: i32 = @intCast(@min(255, @divTrunc((now - fade_started) * 255, 600)));
            paint(&client, track, progress);
            needs_fade = progress < 255;
        }
    }
}

test "now playing accepts bounded printable metadata with accurate status" {
    const listening = parseTrack("listening\nSong\nArtist\n").?;
    try std.testing.expect(listening.listening);
    try std.testing.expectEqualStrings("Song", listening.title[0..listening.title_len]);
    try std.testing.expect(!parseTrack("last played\nSong\nArtist").?.listening);
    for ([_][]const u8{ "playing\nSong\nArtist", "listening\n\nArtist", "listening\nSong\nArtist\nextra", "listening\nSong\x1b\nArtist" }) |bad| try std.testing.expect(parseTrack(bad) == null);
    const too_long = "listening\n" ++ "a" ** 121 ++ "\nArtist";
    try std.testing.expect(parseTrack(too_long) == null);
}
