import { describe, expect, test } from "bun:test";
import { contrastRatio, deriveAlbumPalette } from "./album-theme";

describe("album palette", () => {
  test("rejects malformed or incomplete color events", () => {
    expect(deriveAlbumPalette(["#ff5705"])).toBeNull();
    expect(deriveAlbumPalette(Array(5).fill("red"))).toBeNull();
  });
  test("derives every surface from artwork and retains readable text", () => {
    for (const colors of [
      Array(5).fill("#000000"),
      Array(5).fill("#ffffff"),
      ["#aa2200", "#334488", "#efcc00", "#000011", "#bbbbbb"],
    ]) {
      const palette = deriveAlbumPalette(colors)!;
      expect(
        contrastRatio(palette.text, palette.background),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(palette.muted, palette.surface),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(palette.accent, palette.surface),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(palette.onAccent, palette.accent),
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(deriveAlbumPalette(Array(5).fill("#cc2200"))!.background).not.toBe(
      deriveAlbumPalette(Array(5).fill("#0022cc"))!.background,
    );
  });
});
