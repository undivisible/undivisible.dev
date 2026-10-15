import { describe, expect, test } from "bun:test";
import { formatTimeForZone } from "./useHongKongDayTheme";

describe("travel clock zones", () => {
  test.each(["2026-01-15T12:34:56Z", "2026-07-15T12:34:56Z"])(
    "Hong Kong and Kuala Lumpur stay on UTC+8 at %s",
    (instant) => {
      const date = new Date(instant);
      expect(formatTimeForZone(date, "Asia/Hong_Kong")).toBe("20:34:56");
      expect(formatTimeForZone(date, "Asia/Kuala_Lumpur")).toBe("20:34:56");
    },
  );

  test.each(["2026-01-15T12:34:56Z", "2026-07-15T12:34:56Z"])(
    "Tokyo stays on UTC+9 at %s",
    (instant) => {
      expect(formatTimeForZone(new Date(instant), "Asia/Tokyo")).toBe(
        "21:34:56",
      );
    },
  );

  test.each([
    ["2026-01-15T12:34:56Z", "07:34:56"],
    ["2026-07-15T12:34:56Z", "08:34:56"],
  ])("New York follows its seasonal offset at %s", (instant, expected) => {
    expect(formatTimeForZone(new Date(instant), "America/New_York")).toBe(
      expected!,
    );
  });

  test("New York repeats 01:30 when daylight saving ends on November 1, 2026", () => {
    expect(
      formatTimeForZone(new Date("2026-11-01T05:30:00Z"), "America/New_York"),
    ).toBe("01:30:00");
    expect(
      formatTimeForZone(new Date("2026-11-01T06:30:00Z"), "America/New_York"),
    ).toBe("01:30:00");
  });
});
