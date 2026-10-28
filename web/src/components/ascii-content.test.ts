import { expect, test } from "bun:test";
import {
  bitmapWordmark,
  asciiCellAdvance,
  contentCell,
  fitContentLine,
  personalAsciiGrid,
} from "./ascii-content";
test("content occupies the same grid during scrolling and at cell boundaries", () => {
  expect(contentCell(25, 41, 8.4, 20)).toEqual({ col: 2, row: 2 });
  expect(contentCell(25, -1, 8.4, 20)).toEqual({ col: 2, row: -1 });
  expect(contentCell(84, 40, 8.4, 20)).toEqual({ col: 10, row: 2 });
});

test("adjacent letters cannot overwrite each other when measured widths differ from the grid", () => {
  let previous: { col: number; row: number } | undefined;
  const cells = [..."Alpenglow"].map((char, index) => {
    previous = contentCell(100 + index * 7.9, 30, 8.4, 20, previous);
    return { ...previous, char };
  });
  expect(new Set(cells.map((cell) => `${cell.col},${cell.row}`)).size).toBe(9);
  expect(cells.map((cell) => cell.char).join("")).toBe("Alpenglow");
  expect(contentCell(0, 50, 8.4, 20, previous)).toEqual({ col: 0, row: 2 });
});

test("full-width CJK glyphs reserve two cells without splitting code points", () => {
  let previous: { col: number; row: number; advance?: number } | undefined;
  const cells = [..."A格𠮷B"].map((char) => {
    const cell = contentCell(0, 30, 8.4, 20, previous);
    previous = { ...cell, advance: asciiCellAdvance(char) };
    return { ...cell, char, advance: asciiCellAdvance(char) };
  });

  expect(cells.map(({ char, col }) => [char, col])).toEqual([
    ["A", 0],
    ["格", 1],
    ["𠮷", 3],
    ["B", 5],
  ]);
  expect(fitContentLine([{ char: "格", col: 9, advance: 2 }], 10)).toEqual([
    { char: "格", col: 7, advance: 2 },
  ]);
});

test("scaled letter spacing does not insert cells into words or intentional spaces", () => {
  let previous: { col: number; row: number } | undefined;
  const cells = [..."Reach out!"].map((char, index) => {
    previous = contentCell(14 + index * 15.68, 40, 8.4, 20, previous);
    return { ...previous, char };
  });

  expect(cells.map(({ char, col }) => [char, col])).toEqual([
    ["R", 1],
    ["e", 2],
    ["a", 3],
    ["c", 4],
    ["h", 5],
    [" ", 6],
    ["o", 7],
    ["u", 8],
    ["t", 9],
    ["!", 10],
  ]);
});

test("text at the right edge stays on its rendered row", () => {
  const line = [..."systems"].map((char, index) => ({
    char,
    col: 32 + index,
  }));

  expect(fitContentLine(line, 38)).toEqual(
    [..."systems"].map((char, index) => ({ char, col: 30 + index })),
  );
});

test("phone widths use four times the old grid resolution without changing desktop", () => {
  expect(personalAsciiGrid(320, 700)).toEqual({
    mobile: true,
    cellWidth: 4.2,
    cellHeight: 10,
    columns: 77,
    rows: 70,
  });
  expect(personalAsciiGrid(390, 844).columns).toBe(93);
  expect(personalAsciiGrid(430, 932).columns).toBe(103);
  expect(personalAsciiGrid(1440, 900)).toEqual({
    mobile: false,
    cellWidth: 8.4,
    cellHeight: 20,
    columns: 172,
    rows: 45,
  });
});

test("block wordmark grows vertically and fits the title box with a readable word gap", () => {
  const bounds = { left: 14, top: 200, width: 289, height: 44 };
  const blocks = bitmapWordmark("MAX CARTER.", bounds, 32);
  const unit = bounds.width / 64;
  const firstWordEnd = bounds.left + 17 * unit;
  const secondWordStart = bounds.left + 22 * unit;

  expect(blocks.length).toBeGreaterThan(100);
  expect(Math.min(...blocks.map((block) => block.x))).toBeGreaterThanOrEqual(
    bounds.left,
  );
  expect(
    Math.max(...blocks.map((block) => block.x + block.width)),
  ).toBeLessThanOrEqual(bounds.left + bounds.width);
  expect(
    Math.max(...blocks.map((block) => block.y + block.height)) -
      Math.min(...blocks.map((block) => block.y)),
  ).toBeGreaterThan(40);
  expect(blocks.every((block) => block.height > block.width)).toBe(true);
  expect(
    blocks.every(
      (block) =>
        block.x + block.width <= firstWordEnd || block.x >= secondWordStart,
    ),
  ).toBe(true);
});

test("20px text lines remain separate at viewport rounding boundaries", () => {
  const first = contentCell(132, 525, 8.4, 20);
  const next = contentCell(132, 545, 8.4, 20, first);
  expect(next.row).toBe(first.row + 1);
  expect(next.col).toBe(first.col);
});
