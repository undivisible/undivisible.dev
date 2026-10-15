import { expect, test } from "bun:test";
import { albumPaletteCommand, nowPlayingCommand } from "./album-palette";
test("guest palette commands accept exactly five RGB colors without shell syntax", () => {
  expect(
    albumPaletteCommand([
      "#123456",
      "#abcdef",
      "#010203",
      "#ff5705",
      "#ffffff",
    ]),
  ).toBe(
    "printf '%s\\n' '123456 abcdef 010203 ff5705 ffffff' > /run/undesk/album-palette.tmp && mv /run/undesk/album-palette.tmp /run/undesk/album-palette\n",
  );
  for (const colors of [
    null,
    [],
    ["#123456"],
    Array(5).fill("$(id)"),
    Array(5).fill("#fff'\n"),
  ])
    expect(albumPaletteCommand(colors)).toBeNull();
});

test("guest song record is bounded and shell-quoted", () => {
  expect(nowPlayingCommand(null)).toBeNull();
  expect(nowPlayingCommand({ track: 3, artist: "x" })).toBeNull();
  const command = nowPlayingCommand({
    track: "It's $(id)\nnext",
    artist: "A".repeat(200),
    isNowPlaying: true,
  })!;
  expect(command).toContain("'listening'");
  expect(command).toContain("'It'\\''s $(id) next'");
  expect(command).not.toContain("A".repeat(121));
  expect(command.endsWith("\n")).toBe(true);
  expect(nowPlayingCommand({ track: "Song", artist: "Artist" })).toContain(
    "'last played'",
  );
});
