import { describe, expect, test } from "bun:test";
import {
  contrastRatio,
  deriveAlbumPalette,
  selectArtworkColors,
} from "./album-theme";

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

describe("cover color diversity", () => {
  const pixels = (colors: number[][]) =>
    new Uint8ClampedArray(
      colors.flatMap(([r, g, b, count = 1]) =>
        Array.from({ length: count! }, () => [r!, g!, b!, 255]).flat(),
      ),
    );
  test("selects distinct minority colors ahead of near-identical dominant browns", () => {
    const result = selectArtworkColors(
      pixels([
        [96, 64, 32, 100],
        [112, 64, 32, 80],
        [96, 80, 32, 60],
        [0, 64, 224, 8],
        [224, 0, 64, 6],
        [0, 224, 96, 4],
        [224, 224, 0, 3],
      ]),
    )!;
    expect(result).toHaveLength(5);
    expect(result).toContain("#0040e0");
    expect(result).toContain("#e00040");
    expect(result).toContain("#00e060");
  });
  test("supports eight swatches and monochrome covers without inventing colors", () => {
    expect(selectArtworkColors(pixels([[32, 64, 96, 5]]), 8)).toEqual(
      Array(8).fill("#204060"),
    );
    expect(
      selectArtworkColors(new Uint8ClampedArray([255, 0, 0, 0])),
    ).toBeNull();
  });
});
