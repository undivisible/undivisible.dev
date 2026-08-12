pub const SOCK = "/run/undesk/wm.sock";
pub const DIR = "/run/undesk";

pub const AW_HELLO: u32 = 1;
pub const AW_SURFACE: u32 = 2;
pub const AW_COMMIT: u32 = 3;
pub const AW_MOVE: u32 = 4;
pub const AW_INPUT: u32 = 5;
pub const AW_CLOSE: u32 = 6;
pub const AW_RAISE: u32 = 7;
pub const AW_HELLO_BG: u32 = 8;

pub const AW_IN_MOTION: i32 = 1;
pub const AW_IN_PRESS: i32 = 2;
pub const AW_IN_RELEASE: i32 = 3;
pub const AW_IN_KEY: i32 = 4;

pub const AW_F_PINNED: i32 = 1;
pub const AW_F_KEYBOARD: i32 = 2;
pub const AW_F_RESIZE: i32 = 4;

pub const AW_CENTER: i32 = -100000;
pub const AW_MIN_W: i32 = 240;
pub const AW_MIN_H: i32 = 160;

pub const AwMsg = extern struct {
    type: u32,
    a: i32,
    b: i32,
    c: i32,
    d: i32,
    e: i32,
    s: [80]u8,
};

comptime {
    if (@sizeOf(AwMsg) != 104) @compileError("AwMsg must be 104 bytes");
}
