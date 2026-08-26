import { expect, test } from "bun:test";
import { coverVisible, cssToGuest, guestDelta } from "./machine-input";

test("cssToGuest maps the top-left and bottom-right of the screen", () => {
  expect(cssToGuest(0, 0, 200, 100, 1024, 768)).toEqual({ x: 0, y: 0 });
  expect(cssToGuest(200, 100, 200, 100, 1024, 768)).toEqual({
    x: 1024,
    y: 768,
  });
});

test("cssToGuest clamps and survives a zero rect", () => {
  expect(cssToGuest(-20, 50, 100, 100, 800, 600)).toEqual({ x: 0, y: 300 });
  expect(cssToGuest(50, 50, 0, 0, 800, 600)).toEqual({ x: 0, y: 0 });
});

test("guestDelta is the PS/2 step between two guest points", () => {
  expect(guestDelta({ x: 10, y: 10 }, { x: 40, y: 4 })).toEqual({
    dx: 30,
    dy: -6,
  });
});

test("cover hides once the kernel is on screen or the visitor skips", () => {
  expect(coverVisible({ skipped: false, stage: "loading" })).toBe(true);
  expect(coverVisible({ skipped: false, stage: "booting" })).toBe(false);
  expect(coverVisible({ skipped: false, stage: "ready" })).toBe(false);
  expect(coverVisible({ skipped: true, stage: "loading" })).toBe(false);
});
