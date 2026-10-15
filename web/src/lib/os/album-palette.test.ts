import { expect, test } from "bun:test";
import { albumPaletteCommand } from "./album-palette";
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
