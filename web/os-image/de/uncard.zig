const std = @import("std");
const linux = std.os.linux;
const draw = @import("draw.zig");
const awidget = @import("awidget.zig");
const wire = @import("wire.zig");

pub fn main() void {
    var client: awidget.AwClient = undefined;
    if (!awidget.open(&client, "max carter", 520, 112, 28, -30, 0)) linux.exit(1);
    draw.clear(&client.buf);
    draw.frame(&client.buf, null);
    _ = draw.textLg(&client.buf, 14, 12, "max carter", 0xffffff);
    _ = draw.text(&client.buf, 14, 54, "software, systems and developer tools", 0xc4cad6, 1);
    _ = draw.text(&client.buf, 14, 78, "type 'about' for work and contact details", 0xaeb6c6, 1);
    awidget.commit(&client);
    while (true) {
        var message: wire.AwMsg = undefined;
        if (awidget.poll(&client, &message, -1) < 0) linux.exit(0);
    }
}
