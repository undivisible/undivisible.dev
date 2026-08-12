import { expect, test } from "bun:test";
import { safeExternalHref } from "@/lib/safe-external-href";

test("safeExternalHref allows https", () => {
  expect(safeExternalHref("https://github.com/a/b")).toBe(
    "https://github.com/a/b",
  );
});

test("safeExternalHref blocks javascript", () => {
  expect(safeExternalHref("javascript:alert(1)")).toBe("#");
});

test("safeExternalHref keeps hash placeholder", () => {
  expect(safeExternalHref("#")).toBe("#");
});