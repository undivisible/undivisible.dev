import { describe, expect, test } from "bun:test";
import {
  DEFAULT_NOW_LOCATION,
  formatUtcOffset,
  parseNowMarkdown,
  parseUtcOffset,
} from "./parse-now-markdown";

describe("parseNowMarkdown", () => {
  test("status only when no horizontal rule", () => {
    expect(parseNowMarkdown("feeling lonely")).toEqual({
      status: "feeling lonely",
      article: null,
      location: DEFAULT_NOW_LOCATION,
    });
  });

  test("splits on first --- line", () => {
    const raw = "busy\n---\n## note\n\nlong body";
    expect(parseNowMarkdown(raw)).toEqual({
      status: "busy",
      article: "## note\n\nlong body",
      location: DEFAULT_NOW_LOCATION,
    });
  });

  test("status is first non-empty line above ---", () => {
    expect(parseNowMarkdown("line one\nline two\n---\nbody")).toEqual({
      status: "line one",
      article: "body",
      location: DEFAULT_NOW_LOCATION,
    });
  });

  test("reads location and offset from frontmatter", () => {
    const raw = "---\nlocation: lisbon\noffset: +1\n---\n\nshipping";
    expect(parseNowMarkdown(raw)).toEqual({
      status: "shipping",
      article: null,
      location: { label: "lisbon", utcOffsetMinutes: 60 },
    });
  });

  test("frontmatter still allows a status and an article", () => {
    const raw = "---\nlocation: tokyo\noffset: UTC+9\n---\nbusy\n---\nbody";
    expect(parseNowMarkdown(raw)).toEqual({
      status: "busy",
      article: "body",
      location: { label: "tokyo", utcOffsetMinutes: 540 },
    });
  });

  test("keeps defaults for a partial or invalid frontmatter", () => {
    const raw = "---\noffset: nonsense\n---\nhere";
    expect(parseNowMarkdown(raw).location).toEqual(DEFAULT_NOW_LOCATION);
  });
});

describe("parseUtcOffset", () => {
  test.each([
    ["+3", 180],
    ["3", 180],
    ["-4", -240],
    ["GMT+8", 480],
    ["utc-4:30", -270],
    ["+0545", 345],
    ["0", 0],
  ])("parses %s", (input, expected) => {
    expect(parseUtcOffset(input as string)).toBe(expected as number);
  });

  test.each(["", "nonsense", "+99", "+3:75"])("rejects %p", (input) => {
    expect(parseUtcOffset(input)).toBeNull();
  });
});

describe("formatUtcOffset", () => {
  test.each([
    [180, "GMT+3"],
    [-270, "GMT-4:30"],
    [0, "GMT"],
    [345, "GMT+5:45"],
  ])("formats %i", (input, expected) => {
    expect(formatUtcOffset(input as number)).toBe(expected as string);
  });
});
