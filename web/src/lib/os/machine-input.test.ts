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

test("cover stays through boot until the desktop is ready, unless skipped", () => {
  expect(coverVisible({ skipped: false, stage: "loading" })).toBe(true);
  expect(coverVisible({ skipped: false, stage: "booting" })).toBe(true);
  expect(coverVisible({ skipped: false, stage: "ready" })).toBe(false);
  expect(coverVisible({ skipped: true, stage: "loading" })).toBe(false);
});

test("a startup failure stays visible even after skipping the loading screen", () => {
  expect(coverVisible({ skipped: false, stage: "failed" })).toBe(true);
  expect(coverVisible({ skipped: true, stage: "failed" })).toBe(true);
});

test("touch follows the contained framebuffer after viewport resize", () => {
  // A landscape framebuffer centered in a portrait viewport.
  expect(cssToGuest(100, 150, 200, 400, 800, 400)).toEqual({ x: 400, y: 0 });
  expect(cssToGuest(100, 250, 200, 400, 800, 400)).toEqual({ x: 400, y: 400 });
  expect(cssToGuest(100, 200, 200, 400, 800, 400)).toEqual({ x: 400, y: 200 });
  expect(cssToGuest(10, 200, 400, 400, 200, 400)).toEqual({ x: 0, y: 200 });
});
