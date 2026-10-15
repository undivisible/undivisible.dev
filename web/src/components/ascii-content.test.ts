import { expect, test } from "bun:test";
import { contentCell } from "./ascii-content";
test("content occupies the same grid during scrolling and at cell boundaries", () => {
  expect(contentCell(25, 41, 8.4, 20)).toEqual({ col: 2, row: 2 });
  expect(contentCell(25, -1, 8.4, 20)).toEqual({ col: 2, row: -1 });
  expect(contentCell(84, 40, 8.4, 20)).toEqual({ col: 10, row: 2 });
});
