import { describe, expect, test } from "bun:test";
import { parseNowMarkdown } from "./parse-now-markdown";

describe("parseNowMarkdown", () => {
  test("status only when no horizontal rule", () => {
    expect(parseNowMarkdown("feeling lonely")).toEqual({
      status: "feeling lonely",
      article: null,
    });
  });

  test("splits on first --- line", () => {
    const raw = "busy\n---\n## note\n\nlong body";
    expect(parseNowMarkdown(raw)).toEqual({
      status: "busy",
      article: "## note\n\nlong body",
    });
  });

  test("status is first non-empty line above ---", () => {
    expect(parseNowMarkdown("line one\nline two\n---\nbody")).toEqual({
      status: "line one",
      article: "body",
    });
  });
});