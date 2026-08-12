const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const wire = @import("wire.zig");

const MAXW: i32 = 1920;
const MAXH: i32 = 1200;
const MAXSURF: usize = 24;
const MAXAPP: usize = 512;

const FBIOGET_VSCREENINFO: u32 = 0x4600;
const FBIOGET_FSCREENINFO: u32 = 0x4602;

const FbBitfield = extern struct {
    offset: u32,
    length: u32,
    msb_right: u32,
};

const FbVarScreeninfo = extern struct {
    xres: u32,
    yres: u32,
    xres_virtual: u32,
    yres_virtual: u32,
    xoffset: u32,
    yoffset: u32,
    bits_per_pixel: u32,
    grayscale: u32,
    red: FbBitfield,
    green: FbBitfield,
    blue: FbBitfield,
    transp: FbBitfield,
    nonstd: u32,
    activate: u32,
    height: u32,
    width: u32,
    accel_flags: u32,
    pixclock: u32,
    left_margin: u32,
    right_margin: u32,
    upper_margin: u32,
    lower_margin: u32,
    hsync_len: u32,
    vsync_len: u32,
    sync: u32,
    vmode: u32,
    rotate: u32,
    colorspace: u32,
    reserved: [4]u32,
};

const FbFixScreeninfo = extern struct {
    id: [16]u8,
    smem_start: usize,
    smem_len: u32,
    type: u32,
    type_aux: u32,
    visual: u32,
    xpanstep: u16,
    ypanstep: u16,
    ywrapstep: u16,
    line_length: u32,
    mmio_start: usize,
    mmio_len: u32,
    accel: u32,
    capabilities: u16,
    reserved: [2]u16,
};

const Surface = struct {
    fd: i32 = -1,
    id: i32 = 0,
    x: i32 = 0,
    y: i32 = 0,
    w: i32 = 0,
    h: i32 = 0,
    alpha: i32 = 0,
    px: [*]u32 = undefined,
    has_px: bool = false,
    title: [80]u8 = std.mem.zeroes([80]u8),
    alive: bool = false,
    bg: bool = false,
    resizable: bool = false,
};

var fbfd: i32 = -1;
var mousefd: i32 = -1;
var lfd: i32 = -1;
var fb: [*]u32 = undefined;
var back: draw.AwBuf = .{ .px = undefined, .w = 0, .h = 0 };
var W: i32 = 0;
var H: i32 = 0;
var stride: i32 = 0;
var saved_tio: linux.termios = undefined;

var surf: [MAXSURF]Surface = [_]Surface{.{}} ** MAXSURF;
var nsurf: usize = 0;
var next_id: i32 = 1;
var focus: i32 = -1;
var hovered_id: i32 = -1;

var dx0: i32 = 0;
var dy0: i32 = 0;
var dx1: i32 = 0;
var dy1: i32 = 0;

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
    if (hour >= 5 and hour < 8) { top.* = 0x2a1e33; bot.* = 0xc96f4a; }
    else if (hour < 12) { top.* = 0x1d3a5f; bot.* = 0x7fb2d9; }
    else if (hour < 15) { top.* = 0x2456a0; bot.* = 0x9fc7e8; }
    else if (hour < 18) { top.* = 0x27436e; bot.* = 0xd99a5b; }
    else if (hour < 20) { top.* = 0x1d1230; bot.* = 0xc4586e; }
    else { top.* = 0x05060e; bot.* = 0x141b2e; }
}

fn wallpaper() void {
    var top: u32 = 0;
    var bot: u32 = 0;
    const hour = hkHour();
    skyStops(hour, &top, &bot);
    var y: i32 = dy0;
    while (y < dy1) : (y += 1) {
        const c = draw.mix(top, bot, @divTrunc(y * 255, H));
        var x: i32 = dx0;
        while (x < dx1) : (x += 1)
            back.px[@as(usize, @intCast(y * W + x))] = if ((x ^ y) & 3 == 0) draw.mix(c, bot, 8) else c;
    }
    const day = hour >= 6 and hour < 19;
    const t = @mod(hour + 24 - 6, 24) * 60 + hkMin();
    const sx: i32 = 60 + @divTrunc(@as(i32, @intCast(W - 120)) * (if (day) t else t - 780), 780);
    const ax: i32 = sx - @divTrunc(W, 2);
    const adx: i32 = if (ax < 0) -ax else ax;
    const sy: i32 = @divTrunc(H, 5) + @divTrunc(adx * adx, W * 2);
    const sun: u32 = if (day) 0xfff2cc else 0xc9cfdd;
    var j: i32 = -14;
    while (j <= 14) : (j += 1) {
        var i: i32 = -14;
        while (i <= 14) : (i += 1) {
            if (i * i + j * j > 14 * 14) continue;
            const px_ = sx + i;
            const py_ = sy + j;
            if (px_ < dx0 or px_ >= dx1 or py_ < dy0 or py_ >= dy1) continue;
            const idx = @as(usize, @intCast(py_ * W + px_));
            back.px[idx] = if (i * i + j * j > 12 * 12) draw.mix(sun, back.px[idx], 128) else sun;
        }
    }
    if (!day) {
        var k: i32 = 0;
        while (k < 90) : (k += 1) {
            const sx2 = @mod(k * 977 + 131, W);
            const sy2 = @mod(k * 613 + 47, @divTrunc(H * 2, 3));
            if (sx2 < dx0 or sx2 >= dx1 or sy2 < dy0 or sy2 >= dy1) continue;
            back.px[@as(usize, @intCast(sy2 * W + sx2))] = if (@mod(k, 3) != 0) 0x556077 else 0x8a94aa;
        }
    }
}

var query: [80]u8 = std.mem.zeroes([80]u8);
var qlen: usize = 0;
var sel: usize = 0;
var bar_x: i32 = 0;
var bar_y: i32 = 0;
var bar_w: i32 = 0;

const App = struct {
    name: [64]u8 = std.mem.zeroes([64]u8),
    desc: [64]u8 = std.mem.zeroes([64]u8),
    builtin: bool = false,
};

var apps: [MAXAPP]App = [_]App{.{}} ** MAXAPP;
var napp: usize = 0;
var matches: [MAXAPP]usize = [_]usize{0} ** MAXAPP;
var nmatch: usize = 0;

fn builtinDesc(n: []const u8) []const u8 {
    if (std.mem.eql(u8, n, "about")) return "who this machine belongs to";
    if (std.mem.eql(u8, n, "works")) return "headline projects + the index";
    if (std.mem.eql(u8, n, "route")) return "airports, this year, at 17";
    if (std.mem.eql(u8, n, "before17")) return "the dial, in plain text";
    if (std.mem.eql(u8, n, "activity")) return "github, baked into the image";
    if (std.mem.eql(u8, n, "sites")) return "the software; click to open a tab";
    if (std.mem.eql(u8, n, "docs")) return "alpenglow's own documentation";
    if (std.mem.eql(u8, n, "web")) return "netsurf, the site with real css";
    if (std.mem.eql(u8, n, "links")) return "links, the small fallback browser";
    if (std.mem.eql(u8, n, "fetch")) return "fastfetch, the real one";
    if (std.mem.eql(u8, n, "sh")) return "the real console (exit returns)";
    return "";
}

fn copyStr(dst: []u8, src: []const u8) void {
    @memset(dst, 0);
    const n = @min(src.len, dst.len - 1);
    @memcpy(dst[0..n], src[0..n]);
}

fn addApp(name: []const u8, desc: []const u8, builtin: bool) void {
    if (napp >= MAXAPP) return;
    var i: usize = 0;
    while (i < napp) : (i += 1) {
        if (std.mem.eql(u8, apps[i].name[0..name.len], name) and apps[i].name[name.len] == 0) return;
    }
    copyStr(&apps[napp].name, name);
    copyStr(&apps[napp].desc, desc);
    apps[napp].builtin = builtin;
    napp += 1;
}

fn scanDir(dir: []const u8) void {
    var dz: [128]u8 = std.mem.zeroes([128]u8);
    @memcpy(dz[0..dir.len], dir);
    const dp_raw = linux.open(@ptrCast(&dz), .{ .ACCMODE = .RDONLY, .DIRECTORY = true }, 0);
    if (linux.errno(dp_raw) != .SUCCESS) return;
    const dp: i32 = @intCast(dp_raw);
    defer _ = linux.close(dp);
    var buf: [4096]u8 = undefined;
    while (true) {
        const n = linux.getdents64(dp, &buf, buf.len);
        if (linux.errno(n) != .SUCCESS or n == 0) break;
        var off: usize = 0;
        while (off < n) {
            const d: *linux.dirent64 = @ptrCast(@alignCast(&buf[off]));
            const reclen = d.reclen;
            const name_ptr: [*:0]const u8 = @ptrCast(&d.name);
            const name = std.mem.sliceTo(name_ptr, 0);
            off += reclen;
            if (name.len == 0 or name[0] == '.') continue;
            var path: [288]u8 = std.mem.zeroes([288]u8);
            const ps = std.fmt.bufPrint(&path, "{s}/{s}", .{ dir, name }) catch continue;
            var pz: [288]u8 = std.mem.zeroes([288]u8);
            @memcpy(pz[0..ps.len], ps);
            if (linux.errno(linux.access(@ptrCast(&pz), 1)) != .SUCCESS) continue;
            addApp(name, dir, false);
        }
    }
}

fn scanApps() void {
    const names = [_][]const u8{ "about", "works", "route", "before17", "activity", "sites", "docs", "web", "links", "fetch", "sh" };
    for (names) |n| addApp(n, builtinDesc(n), true);
    scanDir("/bin");
    scanDir("/usr/bin");
    scanDir("/usr/local/bin");
}

fn fuzzy(hay: []const u8, needle: []const u8) bool {
    if (needle.len == 0) return true;
    var ni: usize = 0;
    for (hay) |h| {
        if (h == needle[ni]) {
            ni += 1;
            if (ni == needle.len) return true;
        }
    }
    return false;
}

fn rankOf(a: *const App) i32 {
    if (qlen == 0) return if (a.builtin) 0 else 4;
    const q = query[0..qlen];
    const an = std.mem.sliceTo(&a.name, 0);
    if (std.mem.eql(u8, an, q)) return 0;
    if (an.len >= q.len and std.mem.eql(u8, an[0..q.len], q)) return if (a.builtin) 1 else 2;
    if (fuzzy(an, q)) return if (a.builtin) 3 else 5;
    return -1;
}

fn refilter() void {
    nmatch = 0;
    var tier: i32 = 0;
    while (tier <= 5 and nmatch < 9) : (tier += 1) {
        var i: usize = 0;
        while (i < napp and nmatch < 9) : (i += 1) {
            if (rankOf(&apps[i]) == tier) {
                matches[nmatch] = i;
                nmatch += 1;
            }
        }
    }
    if (sel >= nmatch) sel = if (nmatch > 0) nmatch - 1 else 0;
}

fn barH() i32 {
    return 52 + (if (nmatch > 0) @as(i32, @intCast(nmatch)) * 24 + 8 else 0);
}

fn drawBar() void {
    const h = barH();
    draw.blend(&back, bar_x + 4, bar_y + 6, bar_w, h, 0x000000, 90);
    draw.blend(&back, bar_x, bar_y, bar_w, h, 0x10131c, 215);
    draw.fill(&back, bar_x, bar_y, bar_w, 1, 0x2a3040);
    draw.fill(&back, bar_x, bar_y + h - 1, bar_w, 1, 0x1a1e2a);
    draw.fill(&back, bar_x, bar_y, 1, h, 0x1f2432);
    draw.fill(&back, bar_x + bar_w - 1, bar_y, 1, h, 0x1f2432);

    _ = draw.textLg(&back, bar_x + 12, bar_y + 8, ">", 0x7ec8e8);
    const room = bar_w - 46;
    const shown: usize = @intCast(@divTrunc(room, 16));
    var q = query[0..qlen];
    if (qlen > shown) q = query[qlen - shown .. qlen];
    if (qlen == 0) {
        _ = draw.textLg(&back, bar_x + 34, bar_y + 8, "type to launch", 0x596074);
    } else {
        _ = draw.textLg(&back, bar_x + 34, bar_y + 8, q, 0xffffff);
    }
    if (nowSec() & 1 != 0) {
        const used: i32 = @as(i32, @intCast(if (qlen > shown) shown else qlen)) * 16;
        draw.fill(&back, bar_x + 36 + used, bar_y + 10, 2, 26, 0xffffff);
    }

    var m: usize = 0;
    while (m < nmatch) : (m += 1) {
        const a = &apps[matches[m]];
        const ry = bar_y + 52 + @as(i32, @intCast(m)) * 24;
        if (m == sel) draw.blend(&back, bar_x + 6, ry - 3, bar_w - 12, 22, 0xffffff, 26);
        _ = draw.text(&back, bar_x + 16, ry, std.mem.sliceTo(&a.name, 0), if (m == sel) 0xffffff else 0xc4cad6, 1);
        _ = draw.text(&back, bar_x + 180, ry, std.mem.sliceTo(&a.desc, 0), 0x767e92, 1);
    }
}

const arrow = [_][]const u8{
    "X...........", "XX..........", "X.X.........", "X..X........",
    "X...X.......", "X....X......", "X.....X.....", "X......X....",
    "X.......X...", "X........X..", "X.....XXXXX.", "X..X..X.....",
    "X.X..X.X....", "XX...X.X....", "X.....X..X..", "......X..X..",
    ".......XX...", "............",
};

var mx: i32 = 0;
var my: i32 = 0;
var mbtn: i32 = 0;

fn drawCursor() void {
    var r: usize = 0;
    while (r < 18) : (r += 1) {
        var c: usize = 0;
        while (c < 12) : (c += 1) {
            if (arrow[r][c] == 'X') {
                if (mx + @as(i32, @intCast(c)) >= dx0 and mx + @as(i32, @intCast(c)) < dx1 and my + @as(i32, @intCast(r)) >= dy0 and my + @as(i32, @intCast(r)) < dy1)
                    back.px[@as(usize, @intCast((my + @as(i32, @intCast(r))) * W + mx + @as(i32, @intCast(c))))] = 0xffffff;
                if (mx + @as(i32, @intCast(c)) + 1 >= dx0 and mx + @as(i32, @intCast(c)) + 1 < dx1 and my + @as(i32, @intCast(r)) + 1 >= dy0 and my + @as(i32, @intCast(r)) + 1 < dy1)
                    back.px[@as(usize, @intCast((my + @as(i32, @intCast(r)) + 1) * W + mx + @as(i32, @intCast(c)) + 1))] = 0x000000;
            }
        }
    }
}

fn blitSurface(s: *const Surface) void {
    const x0: i32 = if (s.x < dx0) dx0 else s.x;
    const y0: i32 = if (s.y < dy0) dy0 else s.y;
    const x1: i32 = if (s.x + s.w > dx1) dx1 else s.x + s.w;
    const y1: i32 = if (s.y + s.h > dy1) dy1 else s.y + s.h;
    var j: i32 = y0;
    while (j < y1) : (j += 1) {
        var i: i32 = x0;
        while (i < x1) : (i += 1) {
            const c = s.px[@as(usize, @intCast((j - s.y) * s.w + (i - s.x)))];
            if (!s.bg and (c & 0xff000000) == 0) continue;
            const cc = c & 0xffffff;
            const idx = @as(usize, @intCast(j * W + i));
            back.px[idx] = if (s.alpha >= 255) cc else draw.mix(back.px[idx], cc, s.alpha);
        }
    }
}

fn composite(x: i32, y: i32, w: i32, h: i32) void {
    dx0 = if (x < 0) 0 else x;
    dy0 = if (y < 0) 0 else y;
    dx1 = if (x + w > W) W else x + w;
    dy1 = if (y + h > H) H else y + h;
    if (dx0 >= dx1 or dy0 >= dy1) return;
    var have_bg = false;
    var i: usize = 0;
    while (i < nsurf) : (i += 1) {
        if (surf[i].alive and surf[i].bg) { have_bg = true; break; }
    }
    if (!have_bg) wallpaper();
    i = 0;
    while (i < nsurf) : (i += 1)
        if (surf[i].alive and surf[i].bg) blitSurface(&surf[i]);
    i = 0;
    while (i < nsurf) : (i += 1)
        if (surf[i].alive and !surf[i].bg) blitSurface(&surf[i]);
    drawBar();
    drawCursor();
    var j: i32 = dy0;
    while (j < dy1) : (j += 1) {
        const src = @as(usize, @intCast(j * W + dx0));
        const dst = @as(usize, @intCast(@as(usize, @intCast(j)) * @as(usize, @intCast(stride)) + @as(usize, @intCast(dx0))));
        const len = @as(usize, @intCast(dx1 - dx0)) * 4;
        @memcpy(fb[dst .. dst + len / 4], back.px[src .. src + len / 4]);
    }
    dx0 = 0; dy0 = 0; dx1 = W; dy1 = H;
}

fn compositeAll() void {
    composite(0, 0, W, H);
}

fn damageSurface(s: *const Surface) void {
    composite(s.x - 6, s.y - 6, s.w + 18, s.h + 20);
}

fn sendMsg(fd: i32, m: *const wire.AwMsg) bool {
    const bytes = std.mem.asBytes(m);
    const n = linux.write(fd, bytes.ptr, bytes.len);
    return n == bytes.len;
}

fn dropSurface(idx: usize) void {
    if (surf[idx].has_px) {
        _ = linux.munmap(@ptrCast(surf[idx].px), @as(usize, @intCast(surf[idx].w * surf[idx].h * 4)));
    }
    var path: [128]u8 = std.mem.zeroes([128]u8);
    const ps = std.fmt.bufPrint(&path, "{s}/s{d}", .{ wire.DIR, surf[idx].id }) catch return;
    var pz: [128]u8 = std.mem.zeroes([128]u8);
    @memcpy(pz[0..ps.len], ps);
    _ = linux.unlink(@ptrCast(&pz));
    _ = linux.close(surf[idx].fd);
    const gone = surf[idx];
    var j = idx;
    while (j < nsurf - 1) : (j += 1) surf[j] = surf[j + 1];
    nsurf -= 1;
    if (focus == gone.id) focus = -1;
    composite(gone.x - 6, gone.y - 6, gone.w + 18, gone.h + 20);
}

fn surfacePath(buf: *[128]u8, id: i32) []const u8 {
    const ps = std.fmt.bufPrint(buf, "{s}/s{d}", .{ wire.DIR, id }) catch return buf[0..0];
    return ps;
}

fn handleHello(s: *Surface, m: *const wire.AwMsg) void {
    var w = m.a;
    var h = m.b;
    if (m.type == wire.AW_HELLO_BG) { w = W; h = H; }
    if (w < 8 or h < 8 or w > MAXW or h > MAXH) { s.alive = false; return; }
    var pbuf: [128]u8 = std.mem.zeroes([128]u8);
    const ps = surfacePath(&pbuf, s.id);
    var pz: [128]u8 = std.mem.zeroes([128]u8);
    @memcpy(pz[0..ps.len], ps);
    const f_raw = linux.open(@ptrCast(&pz), .{ .ACCMODE = .RDWR, .CREAT = true, .TRUNC = true }, 0o600);
    if (linux.errno(f_raw) != .SUCCESS) { s.alive = false; return; }
    const f: i32 = @intCast(f_raw);
    if (linux.errno(linux.ftruncate(f, @as(i64, w) * h * 4)) != .SUCCESS) { _ = linux.close(f); s.alive = false; return; }
    const px_raw = linux.mmap(null, @as(usize, @intCast(w * h * 4)), .{ .READ = true, .WRITE = true }, .{ .TYPE = .SHARED }, f, 0);
    _ = linux.close(f);
    if (linux.errno(px_raw) != .SUCCESS) { s.alive = false; return; }
    s.px = @ptrFromInt(px_raw);
    s.has_px = true;
    s.w = w;
    s.h = h;
    s.bg = m.type == wire.AW_HELLO_BG;
    if (s.bg) {
        s.x = 0;
        s.y = 0;
    } else {
        s.x = if (m.c == wire.AW_CENTER) @divTrunc(W - w, 2) else (if (m.c < 0) W + m.c - w else m.c);
        s.y = if (m.d == wire.AW_CENTER) @divTrunc(H - h, 2) else (if (m.d < 0) H + m.d - h else m.d);
    }
    s.alpha = if (s.bg) 255 else 215;
    s.resizable = (m.e & wire.AW_F_RESIZE) != 0;
    copyStr(&s.title, std.mem.sliceTo(&m.s, 0));

    var r: wire.AwMsg = std.mem.zeroes(wire.AwMsg);
    r.type = wire.AW_SURFACE;
    r.a = w;
    r.b = h;
    r.c = s.id;
    copyStr(&r.s, ps);
    if (!sendMsg(s.fd, &r)) s.alive = false;
}

fn resizeSurface(s: *Surface, w_in: i32, h_in: i32) bool {
    var w = w_in;
    var h = h_in;
    if (w < wire.AW_MIN_W) w = wire.AW_MIN_W;
    if (h < wire.AW_MIN_H) h = wire.AW_MIN_H;
    if (w > MAXW) w = MAXW;
    if (h > MAXH) h = MAXH;
    if (w == s.w and h == s.h) return true;
    var pbuf: [128]u8 = std.mem.zeroes([128]u8);
    const ps = surfacePath(&pbuf, s.id);
    var pz: [128]u8 = std.mem.zeroes([128]u8);
    @memcpy(pz[0..ps.len], ps);
    const f_raw = linux.open(@ptrCast(&pz), .{ .ACCMODE = .RDWR }, 0o600);
    if (linux.errno(f_raw) != .SUCCESS) return false;
    const f: i32 = @intCast(f_raw);
    if (linux.errno(linux.ftruncate(f, @as(i64, w) * h * 4)) != .SUCCESS) { _ = linux.close(f); return false; }
    const px_raw = linux.mmap(null, @as(usize, @intCast(w * h * 4)), .{ .READ = true, .WRITE = true }, .{ .TYPE = .SHARED }, f, 0);
    _ = linux.close(f);
    if (linux.errno(px_raw) != .SUCCESS) return false;
    _ = linux.munmap(@ptrCast(s.px), @as(usize, @intCast(s.w * s.h * 4)));
    s.px = @ptrFromInt(px_raw);
    s.has_px = true;
    s.w = w;
    s.h = h;
    var r: wire.AwMsg = std.mem.zeroes(wire.AwMsg);
    r.type = wire.AW_SURFACE;
    r.a = w;
    r.b = h;
    r.c = s.id;
    copyStr(&r.s, ps);
    if (!sendMsg(s.fd, &r)) s.alive = false;
    return true;
}

fn spawn(prog: [*:0]const u8, arg: ?[*:0]const u8) void {
    const p = linux.fork();
    if (p != 0) return;
    _ = linux.setsid();
    const devnull_raw = linux.open("/dev/null", .{ .ACCMODE = .RDWR }, 0);
    if (linux.errno(devnull_raw) == .SUCCESS) {
        const dn: i32 = @intCast(devnull_raw);
        _ = linux.dup2(dn, 0);
        _ = linux.dup2(dn, 1);
        _ = linux.dup2(dn, 2);
    }
    if (arg) |a| {
        const argv = [_:null]?[*:0]const u8{ prog, a };
        const envp = [_:null]?[*:0]const u8{};
        _ = linux.execve(prog, @ptrCast(&argv), @ptrCast(&envp));
    } else {
        const argv = [_:null]?[*:0]const u8{prog};
        const envp = [_:null]?[*:0]const u8{};
        _ = linux.execve(prog, @ptrCast(&argv), @ptrCast(&envp));
    }
    linux.exit(127);
}

fn handOver(cmd: []const u8) void {
    var path: [128]u8 = std.mem.zeroes([128]u8);
    const ps = std.fmt.bufPrint(&path, "{s}/exec", .{wire.DIR}) catch return;
    var pz: [128]u8 = std.mem.zeroes([128]u8);
    @memcpy(pz[0..ps.len], ps);
    const f_raw = linux.open(@ptrCast(&pz), .{ .ACCMODE = .WRONLY, .CREAT = true, .TRUNC = true }, 0o600);
    if (linux.errno(f_raw) != .SUCCESS) return;
    const f: i32 = @intCast(f_raw);
    var lbuf: [256]u8 = std.mem.zeroes([256]u8);
    const n = @min(cmd.len, 255);
    @memcpy(lbuf[0..n], cmd[0..n]);
    lbuf[n] = '\n';
    _ = linux.write(f, &lbuf, n + 1);
    _ = linux.close(f);
    linux.exit(43);
}

fn launch(app_index: usize) void {
    const a = &apps[app_index];
    const an = std.mem.sliceTo(&a.name, 0);
    if (std.mem.eql(u8, an, "sh")) linux.exit(42);
    if (std.mem.eql(u8, an, "web"))
        handOver("netsurf-fb -f linux -w 1440 -h 900 file:///usr/share/undesk/web/index.html");
    if (std.mem.eql(u8, an, "links"))
        handOver("links -g -driver fb file:///usr/share/undesk/web/index.html");
    if (a.builtin) {
        var name_z: [64]u8 = std.mem.zeroes([64]u8);
        @memcpy(name_z[0..an.len], an);
        spawn("/usr/bin/unpanel", @ptrCast(&name_z));
    } else {
        var path: [288]u8 = std.mem.zeroes([288]u8);
        const desc = std.mem.sliceTo(&a.desc, 0);
        const ps = std.fmt.bufPrint(&path, "{s}/{s}", .{ desc, an }) catch return;
        handOver(ps);
    }
    qlen = 0;
    query[0] = 0;
    sel = 0;
    refilter();
    compositeAll();
}

fn reap(_: c_int) callconv(.c) void {
    var status: u32 = 0;
    while (true) {
        const r = linux.waitpid(-1, &status, 1);
        if (linux.errno(r) != .SUCCESS or r == 0) break;
    }
}

pub fn main() void {
    const fbfd_raw = linux.open("/dev/fb0", .{ .ACCMODE = .RDWR }, 0);
    if (linux.errno(fbfd_raw) != .SUCCESS) linux.exit(1);
    fbfd = @intCast(fbfd_raw);

    var vi: FbVarScreeninfo = undefined;
    var fi: FbFixScreeninfo = undefined;
    _ = linux.ioctl(fbfd, FBIOGET_VSCREENINFO, @intFromPtr(&vi));
    _ = linux.ioctl(fbfd, FBIOGET_FSCREENINFO, @intFromPtr(&fi));
    if (vi.bits_per_pixel != 32) linux.exit(1);
    W = @intCast(vi.xres);
    H = @intCast(vi.yres);
    stride = @intCast(@divTrunc(fi.line_length, 4));
    if (W > MAXW or H > MAXH) linux.exit(1);
    const fb_raw = linux.mmap(null, @as(usize, @intCast(fi.line_length)) * @as(usize, @intCast(H)), .{ .READ = true, .WRITE = true }, .{ .TYPE = .SHARED }, fbfd, 0);
    if (linux.errno(fb_raw) != .SUCCESS) linux.exit(1);
    fb = @ptrFromInt(fb_raw);
    const back_raw = linux.mmap(null, @as(usize, @intCast(W * H * 4)), .{ .READ = true, .WRITE = true }, .{ .TYPE = .PRIVATE, .ANONYMOUS = true }, -1, 0);
    if (linux.errno(back_raw) != .SUCCESS) linux.exit(1);
    back.px = @ptrFromInt(back_raw);
    back.w = W;
    back.h = H;

    var sa: linux.Sigaction = .{
        .handler = .{ .handler = @ptrCast(&reap) },
        .mask = std.mem.zeroes(linux.sigset_t),
        .flags = 0,
    };
    _ = linux.sigaction(.CHLD, &sa, null);
    sa.handler = .{ .handler = linux.SIG.IGN };
    _ = linux.sigaction(.PIPE, &sa, null);

    _ = linux.mkdir(wire.DIR, 0o755);
    _ = linux.unlink(wire.SOCK);
    const ls = linux.socket(linux.AF.UNIX, linux.SOCK.STREAM, 0);
    if (linux.errno(ls) != .SUCCESS) linux.exit(1);
    lfd = @intCast(ls);
    var addr: linux.sockaddr.un = .{ .family = linux.AF.UNIX, .path = [_]u8{0} ** 108 };
    @memcpy(addr.path[0..wire.SOCK.len], wire.SOCK);
    if (linux.errno(linux.bind(lfd, @ptrCast(&addr), @sizeOf(linux.sockaddr.un))) != .SUCCESS) linux.exit(1);
    _ = linux.listen(lfd, 8);

    _ = linux.tcgetattr(0, &saved_tio);
    var tio = saved_tio;
    tio.lflag.ICANON = false;
    tio.lflag.ECHO = false;
    tio.cc[@intFromEnum(linux.V.MIN)] = 0;
    tio.cc[@intFromEnum(linux.V.TIME)] = 0;
    _ = linux.tcsetattr(0, .NOW, &tio);
    const hide = "\x1b[?25l";
    _ = linux.write(1, hide.ptr, hide.len);

    const mfd_raw = linux.open("/dev/input/mice", .{ .ACCMODE = .RDONLY, .NONBLOCK = true }, 0);
    mousefd = if (linux.errno(mfd_raw) == .SUCCESS) @intCast(mfd_raw) else -1;
    mx = @divTrunc(W, 2);
    my = @divTrunc(H, 2);

    scanApps();
    refilter();
    bar_w = 540;
    bar_x = @divTrunc(W, 2) - @divTrunc(bar_w, 2);
    bar_y = 150;
    compositeAll();

    // Tell the host the desktop is drawn, so it can drop its cover instead
    // of flashing the kernel boot log behind it.
    const ser_raw = linux.open("/dev/ttyS0", .{ .ACCMODE = .WRONLY }, 0);
    if (linux.errno(ser_raw) == .SUCCESS) {
        const ser: i32 = @intCast(ser_raw);
        _ = linux.write(ser, "@@desktop\n", 10);
        _ = linux.close(ser);
    }

    spawn("/usr/bin/unwall", null);
    spawn("/usr/bin/unclock", null);
    spawn("/usr/bin/unmachine", null);
    spawn("/usr/bin/uncard", null);

    var dragging: i32 = -1;
    var resizing: i32 = -1;
    var drag_dx: i32 = 0;
    var drag_dy: i32 = 0;
    var last_tick: i64 = 0;

    while (true) {
        var fds: [3 + MAXSURF]linux.pollfd = undefined;
        var nfds: usize = 0;
        fds[nfds] = .{ .fd = 0, .events = linux.POLL.IN, .revents = 0 };
        nfds += 1;
        fds[nfds] = .{ .fd = lfd, .events = linux.POLL.IN, .revents = 0 };
        nfds += 1;
        var mouse_slot: i32 = -1;
        if (mousefd >= 0) {
            mouse_slot = @intCast(nfds);
            fds[nfds] = .{ .fd = mousefd, .events = linux.POLL.IN, .revents = 0 };
            nfds += 1;
        }
        const first_surf = nfds;
        var i: usize = 0;
        while (i < nsurf) : (i += 1) {
            fds[nfds] = .{ .fd = surf[i].fd, .events = linux.POLL.IN, .revents = 0 };
            nfds += 1;
        }
        _ = linux.poll(&fds, nfds, 250);

        if (fds[1].revents & linux.POLL.IN != 0) {
            const cfd = linux.accept(lfd, null, null);
            if (linux.errno(cfd) == .SUCCESS) {
                if (nsurf >= MAXSURF) {
                    _ = linux.close(@intCast(cfd));
                } else {
                    surf[nsurf] = .{};
                    surf[nsurf].fd = @intCast(cfd);
                    surf[nsurf].id = next_id;
                    next_id += 1;
                    surf[nsurf].alive = true;
                    nsurf += 1;
                }
            }
        }

        var si: i32 = @as(i32, @intCast(nsurf)) - 1;
        while (si >= 0) : (si -= 1) {
            const idx: usize = @intCast(si);
            const slot = first_surf + idx;
            if (slot >= nfds or fds[slot].revents & linux.POLL.IN == 0) continue;
            var m: wire.AwMsg = undefined;
            const n = linux.read(surf[idx].fd, std.mem.asBytes(&m).ptr, @sizeOf(wire.AwMsg));
            if (n != @sizeOf(wire.AwMsg)) { dropSurface(idx); continue; }
            if (m.type == wire.AW_HELLO or m.type == wire.AW_HELLO_BG) {
                handleHello(&surf[idx], &m);
                if (!surf[idx].alive) { dropSurface(idx); continue; }
                damageSurface(&surf[idx]);
            } else if (m.type == wire.AW_COMMIT) {
                damageSurface(&surf[idx]);
            } else if (m.type == wire.AW_MOVE) {
                const old = surf[idx];
                surf[idx].x = m.a;
                surf[idx].y = m.b;
                composite(old.x - 6, old.y - 6, old.w + 18, old.h + 20);
                damageSurface(&surf[idx]);
            } else if (m.type == wire.AW_CLOSE) {
                dropSurface(idx);
            }
        }

        var k: u8 = 0;
        while (linux.read(0, @ptrCast(&k), 1) == 1) {
            if (focus >= 0) {
                var fi2: i32 = -1;
                var ii: usize = 0;
                while (ii < nsurf) : (ii += 1) if (surf[ii].id == focus) { fi2 = @intCast(ii); break; };
                if (fi2 < 0) {
                    focus = -1;
                } else if (k == 27) {
                    var k2: u8 = 0;
                    var k3: u8 = 0;
                    if (linux.read(0, @ptrCast(&k2), 1) == 1 and k2 == '[' and linux.read(0, @ptrCast(&k3), 1) == 1) {
                        var e: wire.AwMsg = std.mem.zeroes(wire.AwMsg);
                        e.type = wire.AW_INPUT;
                        e.a = wire.AW_IN_KEY;
                        e.d = @as(i32, 0x100) + k3;
                        _ = sendMsg(surf[@intCast(fi2)].fd, &e);
                    } else {
                        focus = -1;
                    }
                    continue;
                } else {
                    var e: wire.AwMsg = std.mem.zeroes(wire.AwMsg);
                    e.type = wire.AW_INPUT;
                    e.a = wire.AW_IN_KEY;
                    e.d = k;
                    _ = sendMsg(surf[@intCast(fi2)].fd, &e);
                    continue;
                }
            }
            if (k == 27) {
                var k2: u8 = 0;
                var k3: u8 = 0;
                if (linux.read(0, @ptrCast(&k2), 1) == 1 and k2 == '[' and linux.read(0, @ptrCast(&k3), 1) == 1) {
                    if (k3 == 'A' and sel > 0) sel -= 1;
                    if (k3 == 'B' and sel < nmatch - 1) sel += 1;
                    composite(bar_x, bar_y, bar_w, barH() + 8);
                } else if (qlen > 0) {
                    qlen = 0;
                    query[0] = 0;
                    refilter();
                    compositeAll();
                }
            } else if (k == '\r' or k == '\n') {
                if (qlen > 1 and query[0] == '>') {
                    handOver(query[1..qlen]);
                } else if (nmatch > 0) {
                    launch(matches[sel]);
                }
            } else if (k == 127 or k == 8) {
                if (qlen > 0) {
                    qlen -= 1;
                    query[qlen] = 0;
                    refilter();
                    compositeAll();
                }
            } else if (k >= 32 and k < 127 and qlen < 70) {
                query[qlen] = k;
                qlen += 1;
                query[qlen] = 0;
                sel = 0;
                refilter();
                compositeAll();
            }
        }

        if (mouse_slot >= 0) {
            var pkt: [3]u8 = undefined;
            var moved = false;
            const oldx = mx;
            const oldy = my;
            while (linux.read(mousefd, &pkt, 3) == 3) {
                const ddx: i32 = @as(i32, pkt[1]) - (if ((pkt[0] & 0x10) != 0) @as(i32, 256) else 0);
                const ddy: i32 = @as(i32, pkt[2]) - (if ((pkt[0] & 0x20) != 0) @as(i32, 256) else 0);
                mx += ddx;
                my -= ddy;
                if (mx < 0) mx = 0;
                if (mx > W - 2) mx = W - 2;
                if (my < 0) my = 0;
                if (my > H - 2) my = H - 2;
                moved = true;
                const btn: i32 = pkt[0] & 1;
                if (btn != 0 and mbtn == 0) {
                    const bh = barH();
                    if (mx >= bar_x and mx < bar_x + bar_w and my >= bar_y and my < bar_y + bh) {
                        focus = -1;
                        if (my > bar_y + 49 and nmatch > 0) {
                            const row: usize = @intCast(@divTrunc(my - bar_y - 49, 24));
                            if (row < nmatch) { sel = row; launch(matches[sel]); }
                        }
                    } else {
                        var hit: i32 = -1;
                        var hi: i32 = @as(i32, @intCast(nsurf)) - 1;
                        while (hi >= 0) : (hi -= 1) {
                            const idx: usize = @intCast(hi);
                            if (surf[idx].alive and !surf[idx].bg and mx >= surf[idx].x and mx < surf[idx].x + surf[idx].w and my >= surf[idx].y and my < surf[idx].y + surf[idx].h) { hit = hi; break; }
                        }
                        if (hit < 0) {
                            focus = -1;
                        } else {
                            focus = surf[@intCast(hit)].id;
                            if (hit != @as(i32, @intCast(nsurf)) - 1) {
                                const top = surf[@intCast(hit)];
                                var j2: usize = @intCast(hit);
                                while (j2 < nsurf - 1) : (j2 += 1) surf[j2] = surf[j2 + 1];
                                surf[nsurf - 1] = top;
                                hit = @intCast(nsurf - 1);
                            }
                            const s = &surf[@intCast(hit)];
                            if (s.resizable and mx >= s.x + s.w - 18 and my >= s.y + s.h - 18) {
                                resizing = hit;
                                drag_dx = s.x + s.w - mx;
                                drag_dy = s.y + s.h - my;
                            } else if (my < s.y + 20) {
                                dragging = hit;
                                drag_dx = mx - s.x;
                                drag_dy = my - s.y;
                            } else {
                                var e: wire.AwMsg = std.mem.zeroes(wire.AwMsg);
                                e.type = wire.AW_INPUT;
                                e.a = wire.AW_IN_PRESS;
                                e.b = mx - s.x;
                                e.c = my - s.y;
                                _ = sendMsg(s.fd, &e);
                            }
                            damageSurface(s);
                        }
                    }
                }
                if (btn == 0 and mbtn != 0 and dragging < 0 and focus >= 0) {
                    var ri: usize = 0;
                    while (ri < nsurf) : (ri += 1) {
                        if (surf[ri].id == focus) {
                            var e: wire.AwMsg = std.mem.zeroes(wire.AwMsg);
                            e.type = wire.AW_INPUT;
                            e.a = wire.AW_IN_RELEASE;
                            e.b = mx - surf[ri].x;
                            e.c = my - surf[ri].y;
                            _ = sendMsg(surf[ri].fd, &e);
                        }
                    }
                }
                if (btn == 0) { dragging = -1; resizing = -1; }
                mbtn = btn;
            }
            if (moved) {
                if (resizing >= 0) {
                    const s = &surf[@intCast(resizing)];
                    const old = s.*;
                    const nw = mx + drag_dx - s.x;
                    const nh = my + drag_dy - s.y;
                    _ = resizeSurface(s, nw, nh);
                    const ux1: i32 = if (old.x + old.w > s.x + s.w) old.x + old.w else s.x + s.w;
                    const uy1: i32 = if (old.y + old.h > s.y + s.h) old.y + old.h else s.y + s.h;
                    composite(old.x - 6, old.y - 6, ux1 - old.x + 18, uy1 - old.y + 20);
                } else if (dragging >= 0) {
                    const s = &surf[@intCast(dragging)];
                    const old = s.*;
                    s.x = mx - drag_dx;
                    s.y = my - drag_dy;
                    if (s.x < 0) s.x = 0;
                    if (s.y < 0) s.y = 0;
                    if (s.x + s.w > W) s.x = W - s.w;
                    if (s.y + s.h > H) s.y = H - s.h;
                    const ux: i32 = if (old.x < s.x) old.x else s.x;
                    const uy: i32 = if (old.y < s.y) old.y else s.y;
                    const ux1: i32 = if (old.x + old.w > s.x + s.w) old.x + old.w else s.x + s.w;
                    const uy1: i32 = if (old.y + old.h > s.y + s.h) old.y + old.h else s.y + s.h;
                    composite(ux - 6, uy - 6, ux1 - ux + 18, uy1 - uy + 20);
                } else {
                    if (nmatch > 0 and mx >= bar_x and mx < bar_x + bar_w and my > bar_y + 49 and my < bar_y + 49 + @as(i32, @intCast(nmatch)) * 24) {
                        const row: usize = @intCast(@divTrunc(my - bar_y - 49, 24));
                        if (row < nmatch and row != sel) {
                            sel = row;
                            composite(bar_x, bar_y, bar_w, barH() + 8);
                        }
                    }
                    var hs: i32 = -1;
                    var hi: i32 = @as(i32, @intCast(nsurf)) - 1;
                    while (hi >= 0) : (hi -= 1) {
                        const idx: usize = @intCast(hi);
                        if (surf[idx].alive and !surf[idx].bg and mx >= surf[idx].x and mx < surf[idx].x + surf[idx].w and my >= surf[idx].y and my < surf[idx].y + surf[idx].h) { hs = hi; break; }
                    }
                    const hid: i32 = if (hs >= 0) surf[@intCast(hs)].id else -1;
                    if (hovered_id != -1 and hovered_id != hid) {
                        var rj: usize = 0;
                        while (rj < nsurf) : (rj += 1) {
                            if (surf[rj].id == hovered_id) {
                                var e: wire.AwMsg = std.mem.zeroes(wire.AwMsg);
                                e.type = wire.AW_INPUT;
                                e.a = wire.AW_IN_MOTION;
                                e.b = -1;
                                _ = sendMsg(surf[rj].fd, &e);
                            }
                        }
                    }
                    hovered_id = hid;
                    if (hs >= 0) {
                        const s = &surf[@intCast(hs)];
                        var e: wire.AwMsg = std.mem.zeroes(wire.AwMsg);
                        e.type = wire.AW_INPUT;
                        e.a = wire.AW_IN_MOTION;
                        e.b = mx - s.x;
                        e.c = my - s.y;
                        var cb: [80]u8 = std.mem.zeroes([80]u8);
                        const cs = std.fmt.bufPrint(&cb, "{d} {d}", .{ s.x, s.y }) catch &cb;
                        copyStr(&e.s, cs);
                        _ = sendMsg(s.fd, &e);
                    }
                    const ux: i32 = (if (oldx < mx) oldx else mx) - 2;
                    const uy: i32 = (if (oldy < my) oldy else my) - 2;
                    const uw: i32 = (if (oldx > mx) oldx else mx) - ux + 16;
                    const uh: i32 = (if (oldy > my) oldy else my) - uy + 22;
                    composite(ux, uy, uw, uh);
                }
            }
        }

        const now = nowSec();
        if (now != last_tick) {
            last_tick = now;
            composite(bar_x, bar_y, bar_w, 44);
            if (@mod(now, 60) == 0) compositeAll();
        }
    }
}
