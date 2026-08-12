import { expect, test } from "bun:test";
import { randomizedTextInitialState } from "./randomized-text";

test("randomized text does not hide again after hydration", () => {
  expect(randomizedTextInitialState(true)).toBe(false);
});
