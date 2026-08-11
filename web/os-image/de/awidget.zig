const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const wire = @import("wire.zig");
const AwBuf = draw.AwBuf;
const AwMsg = wire.AwMsg;

pub const AwClient = struct {
    fd: i32,
    buf: AwBuf,
    id: i32,
    mapped: bool = false,
};

fn setStr(dst: *[80]u8, src: []const u8) void {
    @memset(dst, 0);
    const n = @min(src.len, 79);
    @memcpy(dst[0..n], src[0..n]);
}

pub fn send(fd: i32, m: *const AwMsg) bool {
    const bytes = std.mem.asBytes(m);
    var off: usize = 0;
    while (off < bytes.len) {
        const n = linux.write(fd, bytes.ptr + off, bytes.len - off);
        if (linux.errno(n) != .SUCCESS) return false;
        if (n == 0) return false;
        off += n;
    }
    return true;
}

pub fn recv(fd: i32, m: *AwMsg) bool {
    const bytes = std.mem.asBytes(m);
    var off: usize = 0;
    while (off < bytes.len) {
        const n = linux.read(fd, bytes.ptr + off, bytes.len - off);
        if (linux.errno(n) != .SUCCESS) return false;
        if (n == 0) return false;
        off += n;
    }
    return true;
}

fn mapSurface(c: *AwClient, r: *const AwMsg) bool {
    const path: [*:0]const u8 = @ptrCast(&r.s);
    const sfd_raw = linux.open(path, .{ .ACCMODE = .RDWR }, 0);
    if (linux.errno(sfd_raw) != .SUCCESS) return false;
    const sfd: i32 = @intCast(sfd_raw);
    const len: usize = @as(usize, @intCast(r.a)) * @as(usize, @intCast(r.b)) * 4;
    const prot: linux.PROT = .{ .READ = true, .WRITE = true };
    const flags: linux.MAP = .{ .TYPE = .SHARED };
    const px_raw = linux.mmap(null, len, prot, flags, sfd, 0);
    _ = linux.close(sfd);
    if (linux.errno(px_raw) != .SUCCESS) return false;
    if (c.mapped) {
        const old_len: usize = @as(usize, @intCast(c.buf.w)) * @as(usize, @intCast(c.buf.h)) * 4;
        _ = linux.munmap(@ptrCast(c.buf.px), old_len);
    }
    c.id = r.c;
    c.buf.px = @ptrFromInt(px_raw);
    c.buf.w = r.a;
    c.buf.h = r.b;
    c.mapped = true;
    return true;
}

pub fn openAs(c: *AwClient, hello: u32, title: []const u8, w: i32, h: i32, x: i32, y: i32, flags: i32) bool {
    c.mapped = false;
    const s = linux.socket(linux.AF.UNIX, linux.SOCK.STREAM, 0);
    if (linux.errno(s) != .SUCCESS) return false;
    c.fd = @intCast(s);
    var addr: linux.sockaddr.un = .{ .family = linux.AF.UNIX, .path = [_]u8{0} ** 108 };
    @memcpy(addr.path[0..wire.SOCK.len], wire.SOCK);
    if (linux.errno(linux.connect(c.fd, @ptrCast(&addr), @sizeOf(linux.sockaddr.un))) != .SUCCESS)
        return false;
    var m: AwMsg = std.mem.zeroes(AwMsg);
    m.type = hello;
    m.a = w;
    m.b = h;
    m.c = x;
    m.d = y;
    m.e = flags;
    setStr(&m.s, title);
    if (!send(c.fd, &m)) return false;
    var r: AwMsg = undefined;
    if (!recv(c.fd, &r) or r.type != wire.AW_SURFACE) return false;
    return mapSurface(c, &r);
}

pub fn open(c: *AwClient, title: []const u8, w: i32, h: i32, x: i32, y: i32, flags: i32) bool {
    return openAs(c, wire.AW_HELLO, title, w, h, x, y, flags);
}

pub fn openBg(c: *AwClient, title: []const u8) bool {
    return openAs(c, wire.AW_HELLO_BG, title, 0, 0, 0, 0, 0);
}

pub fn commit(c: *AwClient) void {
    var m: AwMsg = std.mem.zeroes(AwMsg);
    m.type = wire.AW_COMMIT;
    _ = send(c.fd, &m);
}

pub fn poll(c: *AwClient, out: *AwMsg, ms: i32) i32 {
    var p: linux.pollfd = .{ .fd = c.fd, .events = linux.POLL.IN, .revents = 0 };
    const n = linux.poll(@ptrCast(&p), 1, ms);
    if (n == 0) return 0;
    if (linux.errno(n) != .SUCCESS) return -1;
    if (!recv(c.fd, out)) return -1;
    if (out.type == wire.AW_SURFACE and !mapSurface(c, out)) return -1;
    return 1;
}
