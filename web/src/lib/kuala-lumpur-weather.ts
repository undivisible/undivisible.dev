export const KUALA_LUMPUR_COORDS = { latitude: 3.139, longitude: 101.6869 };
export const KUALA_LUMPUR_WEATHER_HREF =
  "https://openweathermap.org/city/1735161";

export type WeatherKind =
  | "clear"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "storm"
  | "unknown";

export type WeatherInfo = {
  temperatureC: number;
  status: string;
  kind: WeatherKind;
  /** Rain accumulated over the preceding rainIntervalSeconds, in millimetres. */
  rainIntensity: number;
  observedAtMs: number | null;
  rainIntervalSeconds: number | null;
  feelsLikeC: number | null;
  humidityPercent: number | null;
  windKmh: number | null;
  hourly: WeatherHour[];
};

export type WeatherHour = {
  timeMs: number;
  temperatureC: number | null;
  /** Total precipitation over the hour ending at timeMs, in millimetres. */
  precipitationMm: number | null;
  /** Probability of precipitation over the hour ending at timeMs, in percent. */
  precipitationProbability: number | null;
  kind: WeatherKind;
  status: string;
};

export function buildKualaLumpurWeatherUrl() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(KUALA_LUMPUR_COORDS.latitude));
  url.searchParams.set("longitude", String(KUALA_LUMPUR_COORDS.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,weather_code,rain,apparent_temperature,relative_humidity_2m,wind_speed_10m",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,precipitation,weather_code",
  );
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("precipitation_unit", "mm");
  url.searchParams.set("timeformat", "unixtime");
  url.searchParams.set("timezone", "Asia/Kuala_Lumpur");
  url.searchParams.set("forecast_hours", "24");
  return url.toString();
}

export function weatherFromCode(
  code: number,
): Pick<WeatherInfo, "kind" | "status"> {
  if ([95, 96, 99].includes(code)) return { kind: "storm", status: "STORMY" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { kind: "rain", status: "RAINY" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { kind: "snow", status: "SNOWY" };
  if ([45, 48].includes(code)) return { kind: "fog", status: "FOGGY" };
  if ([1, 2, 3].includes(code)) return { kind: "cloudy", status: "CLOUDY" };
  if (code === 0) return { kind: "clear", status: "CLEAR" };
  return { kind: "unknown", status: "WEATHER" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(
  value: unknown,
  min = -Infinity,
  max = Infinity,
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
    ? value
    : null;
}

function unixTimeMs(value: unknown): number | null {
  const seconds = finiteNumber(value);
  return seconds !== null &&
    Number.isSafeInteger(seconds) &&
    Math.abs(seconds) <= 8.64e12
    ? seconds * 1000
    : null;
}

function parseHourly(
  value: unknown,
  observedAtMs: number | null,
): WeatherHour[] {
  if (!isRecord(value) || observedAtMs === null || !Array.isArray(value.time))
    return [];
  const times = Array.from(value.time, unixTimeMs);
  if (
    times.some((time, index) => {
      const previous = times[index - 1];
      return (
        time === null ||
        (index > 0 &&
          (previous === null ||
            previous === undefined ||
            time !== previous + 3_600_000))
      );
    })
  )
    return [];
  const fields = [
    "temperature_2m",
    "precipitation_probability",
    "precipitation",
    "weather_code",
  ];
  for (const field of fields) {
    const samples = value[field];
    if (
      samples !== undefined &&
      (!Array.isArray(samples) || samples.length !== times.length)
    )
      return [];
  }
  const hours: WeatherHour[] = [];
  for (const [index, timeMs] of times.entries()) {
    if (timeMs === null || timeMs <= observedAtMs) continue;
    const sample = (field: string): unknown =>
      Array.isArray(value[field]) ? value[field][index] : undefined;
    const code = sample("weather_code");
    hours.push({
      timeMs,
      temperatureC: finiteNumber(sample("temperature_2m")),
      precipitationMm: finiteNumber(sample("precipitation"), 0),
      precipitationProbability: finiteNumber(
        sample("precipitation_probability"),
        0,
        100,
      ),
      ...weatherFromCode(
        typeof code === "number" && Number.isInteger(code) ? code : -1,
      ),
    });
    if (hours.length === 12) break;
  }
  return hours;
}

export function parseWeather(payload: unknown): WeatherInfo | null {
  if (!isRecord(payload)) return null;
  const current = payload.current;
  if (!isRecord(current)) return null;
  if (
    !("temperature_2m" in current) ||
    typeof current.temperature_2m !== "number" ||
    !Number.isFinite(current.temperature_2m) ||
    !("weather_code" in current) ||
    typeof current.weather_code !== "number" ||
    !Number.isInteger(current.weather_code)
  )
    return null;
  const rain = current.rain;
  if (typeof rain !== "number" || !Number.isFinite(rain) || rain < 0)
    return null;
  const observedAtMs = unixTimeMs(current.time);
  const interval = finiteNumber(current.interval, 1);
  return {
    temperatureC: current.temperature_2m,
    ...weatherFromCode(current.weather_code),
    rainIntensity: rain,
    observedAtMs,
    rainIntervalSeconds:
      interval !== null && Number.isInteger(interval) ? interval : null,
    feelsLikeC: finiteNumber(current.apparent_temperature),
    humidityPercent: finiteNumber(current.relative_humidity_2m, 0, 100),
    windKmh: finiteNumber(current.wind_speed_10m, 0),
    hourly: parseHourly(payload.hourly, observedAtMs),
  };
}
