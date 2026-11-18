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
      current:
        "temperature_2m,weather_code,rain,apparent_temperature,relative_humidity_2m,wind_speed_10m",
      hourly:
        "temperature_2m,precipitation_probability,precipitation,weather_code",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      precipitation_unit: "mm",
      timeformat: "unixtime",
      timezone: "Asia/Kuala_Lumpur",
      forecast_hours: "24",
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
      observedAtMs: null,
      rainIntervalSeconds: null,
      feelsLikeC: null,
      humidityPercent: null,
      windKmh: null,
      hourly: [],
    });
  });

  test.each([
    null,
    {},
    { current: null },
    { current: { temperature_2m: "29", weather_code: 0 } },
    { current: { temperature_2m: NaN, weather_code: 0 } },
    { current: { temperature_2m: 29, weather_code: 1.2 } },
    { current: { temperature_2m: 29, weather_code: 0 } },
    { current: { temperature_2m: 29, weather_code: 0, rain: null } },
    { current: { temperature_2m: 29, weather_code: 0, rain: -1 } },
    { current: { temperature_2m: 29, weather_code: 0, rain: Infinity } },
  ])("does not fabricate weather for malformed input %j", (payload) => {
    expect(parseWeather(payload)).toBeNull();
  });

  const current = {
    time: 1795010400,
    interval: 900,
    temperature_2m: 24.5,
    apparent_temperature: 30,
    relative_humidity_2m: 98,
    wind_speed_10m: 4.8,
    weather_code: 55,
    rain: 0.3,
  };

  test("preserves distinct current values and backward-looking accumulation interval", () => {
    expect(parseWeather({ current })).toEqual({
      observedAtMs: 1795010400000,
      rainIntervalSeconds: 900,
      temperatureC: 24.5,
      feelsLikeC: 30,
      humidityPercent: 98,
      windKmh: 4.8,
      rainIntensity: 0.3,
      kind: "rain",
      status: "RAINY",
      hourly: [],
    });
  });

  test.each([null, undefined, "12", NaN, Infinity])(
    "keeps invalid optional current details unknown: %j",
    (value) => {
      expect(
        parseWeather({
          current: {
            ...current,
            time: value,
            interval: value,
            apparent_temperature: value,
            relative_humidity_2m: value,
            wind_speed_10m: value,
          },
        }),
      ).toMatchObject({
        temperatureC: 24.5,
        rainIntensity: 0.3,
        observedAtMs: null,
        rainIntervalSeconds: null,
        feelsLikeC: null,
        humidityPercent: null,
        windKmh: null,
        hourly: [],
      });
    },
  );

  test("validates ranges without discarding real zeros or negative temperatures", () => {
    expect(
      parseWeather({
        current: {
          ...current,
          apparent_temperature: -3,
          relative_humidity_2m: 0,
          wind_speed_10m: 0,
          rain: 0,
        },
      }),
    ).toMatchObject({
      feelsLikeC: -3,
      humidityPercent: 0,
      windKmh: 0,
      rainIntensity: 0,
    });
    for (const humidity of [-1, 101]) {
      expect(
        parseWeather({
          current: {
            ...current,
            relative_humidity_2m: humidity,
            wind_speed_10m: -1,
            interval: 0,
          },
        }),
      ).toMatchObject({
        humidityPercent: null,
        windKmh: null,
        rainIntervalSeconds: null,
      });
    }
    expect(
      parseWeather({ current: { ...current, interval: 0.5, time: 1e15 } }),
    ).toMatchObject({ rainIntervalSeconds: null, observedAtMs: null });
  });

  function forecast() {
    return {
      time: Array.from(
        { length: 24 },
        (_, index) => current.time + index * 3600,
      ),
      temperature_2m: Array.from(
        { length: 24 },
        (_, index) => 24.5 + index / 10,
      ),
      precipitation_probability: Array.from(
        { length: 24 },
        (_, index) => 85 - index,
      ),
      precipitation: Array.from({ length: 24 }, (_, index) => index / 10),
      weather_code: Array.from({ length: 24 }, (_, index) =>
        index % 2 === 0 ? 3 : 51,
      ),
    };
  }

  test("returns twelve strictly upcoming aligned hours based only on current response time", () => {
    const hourly = forecast();
    const weather = parseWeather({ current, hourly });
    expect(weather?.hourly).toHaveLength(12);
    expect(weather?.hourly[0]).toEqual({
      timeMs: (current.time + 3600) * 1000,
      temperatureC: 24.6,
      precipitationMm: 0.1,
      precipitationProbability: 84,
      kind: "rain",
      status: "RAINY",
    });
    expect(weather?.hourly[11]?.timeMs).toBe((current.time + 12 * 3600) * 1000);
    expect(
      parseWeather({
        current: { ...current, time: current.time + 900 },
        hourly,
      })?.hourly[0]?.timeMs,
    ).toBe((current.time + 3600) * 1000);
    expect(
      parseWeather({
        current: { ...current, time: current.time + 23 * 3600 },
        hourly,
      })?.hourly,
    ).toEqual([]);
  });

  test("nulls and malformed forecast cells remain unknown without shifting aligned values", () => {
    const hourly = {
      time: [current.time + 3600, current.time + 7200],
      temperature_2m: [null, -2],
      precipitation_probability: [null, 101],
      precipitation: [null, -1],
      weather_code: [null, 1.5],
    };
    expect(parseWeather({ current, hourly })?.hourly).toEqual([
      {
        timeMs: hourly.time[0] * 1000,
        temperatureC: null,
        precipitationMm: null,
        precipitationProbability: null,
        kind: "unknown",
        status: "WEATHER",
      },
      {
        timeMs: hourly.time[1] * 1000,
        temperatureC: -2,
        precipitationMm: null,
        precipitationProbability: null,
        kind: "unknown",
        status: "WEATHER",
      },
    ]);
    expect(
      parseWeather({ current, hourly: { time: [current.time + 3600] } })
        ?.hourly[0],
    ).toMatchObject({
      temperatureC: null,
      precipitationMm: null,
      precipitationProbability: null,
      kind: "unknown",
    });
  });

  test.each([
    null,
    {},
    { ...forecast(), temperature_2m: [29] },
    { ...forecast(), precipitation_probability: [] },
    { ...forecast(), precipitation: null },
    { ...forecast(), weather_code: [3] },
    { time: [current.time + 7200, current.time + 3600] },
    { time: [current.time + 3600, current.time + 3600] },
    { time: [current.time + 3600, current.time + 10800] },
    { time: [null] },
    { time: ["2026-11-19T00:00"] },
  ])("bad forecast never erases valid current: %j", (hourly) => {
    expect(parseWeather({ current, hourly })).toMatchObject({
      temperatureC: 24.5,
      rainIntensity: 0.3,
      hourly: [],
    });
  });

  test("uses absolute Unix timestamps across Kuala Lumpur midnight without timezone parsing", () => {
    const beforeMidnight = Date.parse("2026-11-18T23:45:00+08:00") / 1000;
    const midnight = Date.parse("2026-11-19T00:00:00+08:00") / 1000;
    const result = parseWeather({
      current: { ...current, time: beforeMidnight },
      hourly: { time: [midnight, midnight + 3600] },
    });
    expect(result?.observedAtMs).toBe(Date.parse("2026-11-18T15:45:00Z"));
    expect(result?.hourly.map((hour) => hour.timeMs)).toEqual([
      Date.parse("2026-11-18T16:00:00Z"),
      Date.parse("2026-11-18T17:00:00Z"),
    ]);
    expect(
      parseWeather({
        current: { ...current, time: "2026-11-18T23:45" },
        hourly: forecast(),
      }),
    ).toMatchObject({ observedAtMs: null, hourly: [] });
  });
});
