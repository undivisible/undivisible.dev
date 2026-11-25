import { describe, expect, test } from "bun:test";
import { localSolarDay, solarElevation } from "./solar-elevation";
import { WEATHER_CITIES } from "./weather-cities";

const kl = WEATHER_CITIES[0];
const melbourne = WEATHER_CITIES[2];
const nyc = WEATHER_CITIES[3];
const tokyo = WEATHER_CITIES[4];
const time = Date.parse;

describe("geometric solar elevation", () => {
  test("matches independent Kuala Lumpur timeanddate references", () => {
    // User-supplied timeanddate references; apparent altitude includes refraction.
    // A 0.5° tolerance covers that difference, rounding and location differences.
    expect(
      Math.abs(
        solarElevation(kl.latitude, kl.longitude, time("2026-11-25T05:00Z")) -
          66.1,
      ),
    ).toBeLessThan(0.5);
    expect(
      Math.abs(
        solarElevation(kl.latitude, kl.longitude, time("2026-11-20T10:20Z")) -
          7.9,
      ),
    ).toBeLessThan(0.5);
  });

  test("uses signed coordinates and the date, not a symmetric daylight parabola", () => {
    const stamp = time("2026-11-25T03:17Z");
    const south = solarElevation(
      melbourne.latitude,
      melbourne.longitude,
      stamp,
    );
    const north = solarElevation(
      -melbourne.latitude,
      melbourne.longitude,
      stamp,
    );
    const west = solarElevation(
      melbourne.latitude,
      -melbourne.longitude,
      stamp,
    );
    expect(south).toBeGreaterThan(65);
    expect(north).toBeLessThan(30);
    expect(south - west).toBeGreaterThan(40);
    expect(
      solarElevation(
        melbourne.latitude,
        melbourne.longitude,
        time("2026-06-25T03:17Z"),
      ),
    ).toBeLessThan(30);
  });

  test("keeps midnight below the horizon and separates tropical and winter noon", () => {
    expect(
      solarElevation(kl.latitude, kl.longitude, time("2026-11-24T16:00Z")),
    ).toBeLessThan(-60);
    expect(
      solarElevation(kl.latitude, kl.longitude, time("2026-11-25T05:00Z")),
    ).toBeGreaterThan(65);
    const winterNoon = solarElevation(
      nyc.latitude,
      nyc.longitude,
      time("2026-12-21T17:00Z"),
    );
    expect(winterNoon).toBeGreaterThan(25);
    expect(winterNoon).toBeLessThan(27);
  });

  test.each([90, -90])(
    "remains finite at latitude %s in both polar seasons",
    (latitude) => {
      for (const month of ["06", "12"]) {
        const samples = Array.from({ length: 25 }, (_, hour) =>
          solarElevation(
            latitude,
            37.2,
            time(`2026-${month}-21T00:00Z`) + hour * 3_600_000,
          ),
        );
        expect(samples.every(Number.isFinite)).toBe(true);
        const summer = latitude > 0 === (month === "06");
        expect(
          samples.every((altitude) =>
            summer ? altitude > 23 : altitude < -23,
          ),
        ).toBe(true);
      }
    },
  );
});

describe("local solar civil day", () => {
  test("samples the full day and computes the current instant without rounding", () => {
    const nowMs = time("2026-11-25T05:02:34.567Z");
    const day = localSolarDay(kl, nowMs);
    expect(day.startMs).toBe(time("2026-11-24T16:00Z"));
    expect(day.endMs).toBe(time("2026-11-25T16:00Z"));
    expect(day.points).toHaveLength(145);
    for (const [index, point] of day.points.entries()) {
      expect(point.timeMs).toBe(day.startMs + index * 600_000);
      expect(point.altitude).toBe(
        solarElevation(kl.latitude, kl.longitude, point.timeMs),
      );
    }
    expect(day.current).toEqual({
      timeMs: nowMs,
      altitude: solarElevation(kl.latitude, kl.longitude, nowMs),
    });
    expect(day.points.some((point) => point.timeMs === nowMs)).toBe(false);
    expect(day.points[0]?.altitude).toBeLessThan(0);
    expect(day.points.at(-1)?.timeMs).toBe(day.endMs);
  });

  test("interpolates the conventional -0.833° sunrise and sunset crossings", () => {
    const day = localSolarDay(kl, time("2026-11-25T05:00Z"));
    expect(day.sunriseMs).not.toBeNull();
    expect(day.sunsetMs).not.toBeNull();
    if (day.sunriseMs === null || day.sunsetMs === null)
      throw new Error("Expected equatorial crossings");
    // Independent timeanddate references: 07:01 and 18:58, UTC+8.
    expect(Math.abs(day.sunriseMs - time("2026-11-24T23:01Z"))).toBeLessThan(
      120_000,
    );
    expect(Math.abs(day.sunsetMs - time("2026-11-25T10:58Z"))).toBeLessThan(
      120_000,
    );
    for (const crossing of [day.sunriseMs, day.sunsetMs]) {
      expect(
        Math.abs(solarElevation(kl.latitude, kl.longitude, crossing) + 0.833),
      ).toBeLessThan(0.01);
    }
    expect(
      solarElevation(kl.latitude, kl.longitude, day.sunriseMs - 60_000),
    ).toBeLessThan(-0.833);
    expect(
      solarElevation(kl.latitude, kl.longitude, day.sunsetMs + 60_000),
    ).toBeLessThan(-0.833);
  });

  test("uses each city's local date even when UTC is on another date", () => {
    const nowMs = time("2026-11-25T02:00Z");
    expect(localSolarDay(nyc, nowMs).startMs).toBe(time("2026-11-24T05:00Z"));
    expect(localSolarDay(tokyo, nowMs).startMs).toBe(time("2026-11-24T15:00Z"));
    expect(localSolarDay(tokyo, time("2026-11-25T16:00Z")).startMs).toBe(
      time("2026-11-25T15:00Z"),
    );
  });

  test.each([
    ["2026-03-08T16:00Z", "2026-03-08T05:00Z", "2026-03-09T04:00Z", 23],
    ["2026-11-01T17:00Z", "2026-11-01T04:00Z", "2026-11-02T05:00Z", 25],
  ])("resolves NYC DST boundaries on %s", (now, start, end, hours) => {
    const day = localSolarDay(nyc, time(now));
    expect(day.startMs).toBe(time(start));
    expect(day.endMs).toBe(time(end));
    expect(day.endMs - day.startMs).toBe(hours * 3_600_000);
    expect(day.points).toHaveLength(hours * 6 + 1);
    expect(day.points.at(-1)?.timeMs).toBe(day.endMs);
    expect(localSolarDay(nyc, day.endMs - 1).startMs).toBe(day.startMs);
    expect(localSolarDay(nyc, day.endMs).startMs).toBe(day.endMs);
  });
});
