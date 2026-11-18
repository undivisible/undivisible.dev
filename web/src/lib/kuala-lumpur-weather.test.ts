import { describe, expect, test } from "bun:test";
import {
  buildKualaLumpurWeatherUrl,
  KUALA_LUMPUR_WEATHER_HREF,
  parseWeather,
  weatherFromCode,
} from "./kuala-lumpur-weather";

describe("fixed Kuala Lumpur weather", () => {
  test("requests KL independently of clocks, solar data and device location", () => {
    const url = new URL(buildKualaLumpurWeatherUrl());
    expect(url.origin + url.pathname).toBe(
      "https://api.open-meteo.com/v1/forecast",
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: "3.139",
      longitude: "101.6869",
      current: "temperature_2m,weather_code,rain",
      timezone: "Asia/Kuala_Lumpur",
    });
    expect(KUALA_LUMPUR_WEATHER_HREF).toBe(
      "https://openweathermap.org/city/1735161",
    );
  });

  test.each([
    [[0], "clear"],
    [[1, 2, 3], "cloudy"],
    [[45, 48], "fog"],
    [[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], "rain"],
    [[71, 73, 75, 77, 85, 86], "snow"],
    [[95, 96, 99], "storm"],
    [[-1, 100], "unknown"],
  ])("maps WMO codes %j to %s", (codes, kind) => {
    for (const code of codes) {
      const weather = weatherFromCode(code);
      expect(weather.kind).toBe(kind);
    }
  });

  test("preserves actual temperature and rain accumulation", () => {
    expect(
      parseWeather({
        current: { temperature_2m: 29.4, weather_code: 95, rain: 3.2 },
      }),
    ).toEqual({
      temperatureC: 29.4,
      kind: "storm",
      status: "STORMY",
      rainIntensity: 3.2,
    });
  });

  test.each([
    null,
    {},
    { current: null },
    { current: { temperature_2m: "29", weather_code: 0 } },
    { current: { temperature_2m: NaN, weather_code: 0 } },
    { current: { temperature_2m: 29, weather_code: 1.2 } },
    { current: { temperature_2m: 29, weather_code: 0, rain: -1 } },
    { current: { temperature_2m: 29, weather_code: 0, rain: Infinity } },
  ])("does not fabricate weather for malformed input %j", (payload) => {
    expect(parseWeather(payload)).toBeNull();
  });
});
