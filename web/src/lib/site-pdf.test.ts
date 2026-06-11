import { expect, test } from "bun:test";
import { sitePdfFileName } from "./site-pdf";

test("site pdf targets use stable download names", () => {
  expect(sitePdfFileName("resume")).toBe("max-carter-resume.pdf");
  expect(sitePdfFileName("brief")).toBe("max-carter-brief.pdf");
});
