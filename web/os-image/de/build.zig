const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.resolveTargetQuery(.{
        .cpu_arch = .x86,
        .os_tag = .linux,
        .abi = .musl,
    });
    const optimize: std.builtin.OptimizeMode = .ReleaseSmall;

    const progs = [_][]const u8{
        "undeskd",
        "unwall",
        "unclock",
        "unmachine",
        "uncard",
        "unpanel",
    };

    for (progs) |name| {
        const mod = b.createModule(.{
            .root_source_file = b.path(b.fmt("{s}.zig", .{name})),
            .target = target,
            .optimize = optimize,
            .strip = true,
        });
        const exe = b.addExecutable(.{
            .name = name,
            .root_module = mod,
        });
        b.installArtifact(exe);
    }
}
