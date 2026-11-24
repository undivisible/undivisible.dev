import { describe, expect, test } from "bun:test";
import {
  buildCityWeatherUrl,
  cityScene,
  parseCitySolar,
  WEATHER_CITIES,
  weatherIcon,
} from "./weather-cities";
import { parseWeather } from "./kuala-lumpur-weather";

describe("city weather", () => {
  test("KL requests only missing solar data, other cities retain the shared forecast fields", () => {
    for (const city of WEATHER_CITIES) {
      const url = new URL(buildCityWeatherUrl(city));
      expect(url.searchParams.get("timezone")).toBe(city.timezone);
      expect(url.searchParams.get("latitude")).toBe(String(city.latitude));
      expect(url.searchParams.get("timeformat")).toBe("unixtime");
      expect(url.searchParams.get("daily")).toBe("sunrise,sunset");
      if (city.id === "kl") {
        expect(url.searchParams.get("current")).toBe("is_day");
        expect(url.searchParams.has("hourly")).toBe(false);
      } else {
        expect(url.searchParams.get("current")).toContain("temperature_2m");
        expect(url.searchParams.get("current")).toContain("is_day");
        expect(url.searchParams.get("hourly")).toContain(
          "precipitation_probability",
        );
      }
    }
  });
  test("solar unix timestamps stay absolute, never shifted by timezone offsets", () => {
    expect(
      parseCitySolar({
        current: { is_day: 0 },
        daily: { sunrise: [1_790_000_000], sunset: [1_790_040_000] },
        utc_offset_seconds: -18000,
      }),
    ).toEqual({
      isDay: false,
      sunriseMs: 1_790_000_000_000,
      sunsetMs: 1_790_040_000_000,
      daylightWindows: [
        { sunriseMs: 1_790_000_000_000, sunsetMs: 1_790_040_000_000 },
      ],
    });
  });
  test("rejects missing, inverted or invalid daylight responses", () => {
    for (const payload of [
      null,
      {},
      { current: { is_day: 2 }, daily: { sunrise: [100], sunset: [200] } },
      { current: { is_day: 1 }, daily: { sunrise: [200], sunset: [100] } },
      { current: { is_day: 1 }, daily: { sunrise: [100], sunset: [Infinity] } },
    ])
      expect(parseCitySolar(payload)).toBeNull();
  });
  test("actual is_day and local sunrise/sunset drive independent day, night and rain scenes", () => {
    const weather = parseWeather({
      current: { temperature_2m: 20, weather_code: 61, rain: 2 },
    });
    if (!weather) throw new Error("Fixture should parse");
    const day = cityScene(
      { isDay: true, sunriseMs: 1000, sunsetMs: 100_000 },
      weather,
      50_500,
    );
    const night = cityScene(
      { isDay: false, sunriseMs: 1000, sunsetMs: 100_000 },
      weather,
      10_000_000,
    );
    expect(day.sunProgress).toBe(0.5);
    expect(day.daylightStrength).toBe(1);
    expect(night.daylightStrength).toBe(0);
    expect(night.deepNightStrength).toBe(1);
    expect(night.base).not.toBe(day.base);
    expect(day.weatherKind).toBe("rain");
    expect(day.rainIntensity).toBeGreaterThan(0);
  });
  test("all weather kinds map to bundled static icons", async () => {
    for (const kind of [
      "clear",
      "cloudy",
      "fog",
      "rain",
      "snow",
      "storm",
      "unknown",
    ] as const) {
      for (const isDay of [false, true]) {
        const source = await Bun.file(
          new URL(
            `../../public/meteocons/${weatherIcon(kind, isDay)}.svg`,
            import.meta.url,
          ),
        ).text();
        expect(source).toContain("<svg");
        expect(source).not.toMatch(/<animate|@keyframes|<script/);
      }
    }
  });
});
