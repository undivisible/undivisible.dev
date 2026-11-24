import {
  buildKualaLumpurWeatherUrl,
  type WeatherInfo,
} from "./kuala-lumpur-weather";
import type { ShaderPalette } from "./useHongKongDayTheme";

export const WEATHER_CITIES = [
  {
    id: "kl",
    name: "Kuala Lumpur",
    latitude: 3.139,
    longitude: 101.6869,
    timezone: "Asia/Kuala_Lumpur",
  },
  {
    id: "hk",
    name: "Hong Kong",
    latitude: 22.3193,
    longitude: 114.1694,
    timezone: "Asia/Hong_Kong",
  },
  {
    id: "mel",
    name: "Melbourne",
    latitude: -37.8136,
    longitude: 144.9631,
    timezone: "Australia/Melbourne",
  },
  {
    id: "nyc",
    name: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: "Asia/Tokyo",
  },
] as const;
export type WeatherCity = (typeof WEATHER_CITIES)[number];
export type CitySolar = {
  isDay: boolean;
  sunriseMs: number;
  sunsetMs: number;
  daylightWindows: { sunriseMs: number; sunsetMs: number }[];
};

export function buildCityWeatherUrl(city: WeatherCity) {
  const url = new URL(buildKualaLumpurWeatherUrl());
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("timezone", city.timezone);
  url.searchParams.set("daily", "sunrise,sunset");
  url.searchParams.set("forecast_days", "2");
  // KL already has a shared weather request. Only fetch its missing daylight.
  url.searchParams.set(
    "current",
    city.id === "kl" ? "is_day" : `${url.searchParams.get("current")},is_day`,
  );
  if (city.id === "kl") url.searchParams.delete("hourly");
  return url.toString();
}

export function parseCitySolar(payload: unknown): CitySolar | null {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("current" in payload) ||
    !("daily" in payload)
  )
    return null;
  const { current, daily } = payload;
  if (
    !current ||
    typeof current !== "object" ||
    !("is_day" in current) ||
    (current.is_day !== 0 && current.is_day !== 1)
  )
    return null;
  if (
    !daily ||
    typeof daily !== "object" ||
    !("sunrise" in daily) ||
    !("sunset" in daily) ||
    !Array.isArray(daily.sunrise) ||
    !Array.isArray(daily.sunset) ||
    daily.sunrise.length !== daily.sunset.length
  )
    return null;
  const daylightWindows: CitySolar["daylightWindows"] = [];
  for (const [index, sunrise] of daily.sunrise.entries()) {
    const sunset: unknown = daily.sunset[index];
    if (
      typeof sunrise !== "number" ||
      typeof sunset !== "number" ||
      !Number.isSafeInteger(sunrise) ||
      !Number.isSafeInteger(sunset) ||
      sunrise <= 0 ||
      sunset <= sunrise ||
      sunset > 8.64e12
    )
      return null;
    daylightWindows.push({
      sunriseMs: sunrise * 1000,
      sunsetMs: sunset * 1000,
    });
  }
  const today = daylightWindows[0];
  if (!today) return null;
  return {
    isDay: current.is_day === 1,
    ...today,
    daylightWindows,
  };
}

export function cityScene(
  solar: Pick<CitySolar, "isDay" | "sunriseMs" | "sunsetMs">,
  weather: WeatherInfo,
  nowMs: number,
): ShaderPalette {
  const progress = Math.max(
    0,
    Math.min(1, (nowMs - solar.sunriseMs) / (solar.sunsetMs - solar.sunriseMs)),
  );
  const edgeDistance = Math.min(
    Math.abs(nowMs - solar.sunriseMs),
    Math.abs(nowMs - solar.sunsetMs),
  );
  const twilight = Math.max(0, 1 - edgeDistance / 3_600_000);
  const wet = weather.kind === "rain" || weather.kind === "storm";
  return {
    base: solar.isDay ? (wet ? "#9cbdc9" : "#cee5ef") : "#18243c",
    beam: twilight > 0.3 ? "#edb58a" : "#fff1c6",
    beamSecondary: solar.isDay ? "#b6d8eb" : "#526987",
    shadow: solar.isDay ? "#738f9e" : "#080e1b",
    accent: twilight > 0.3 ? "#c78573" : "#9cbecf",
    sunProgress: progress,
    daylightStrength: solar.isDay
      ? Math.max(0.25, Math.sin(progress * Math.PI))
      : 0,
    twilightStrength: twilight,
    deepNightStrength: solar.isDay ? 0 : 1 - twilight,
    midnightStrength: solar.isDay ? 0 : (1 - twilight) * 0.7,
    weatherKind: weather.kind,
    rainIntensity: wet
      ? Math.max(0.25, Math.min(1, weather.rainIntensity / 4))
      : 0,
  };
}

export function weatherIcon(kind: WeatherInfo["kind"], isDay: boolean) {
  switch (kind) {
    case "clear":
      return isDay ? "clear-day" : "clear-night";
    case "cloudy":
      return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
    case "fog":
      return "fog";
    case "rain":
      return "rain";
    case "snow":
      return "snow";
    case "storm":
      return "thunderstorms-rain";
    case "unknown":
      return "not-available";
  }
}
