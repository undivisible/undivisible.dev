import { expect, test } from "bun:test";
import { contentCell } from "./ascii-content";
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
