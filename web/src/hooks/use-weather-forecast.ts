"use client";

import { useEffect, useState } from "react";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const COORDS = { lat: 22.3193, lng: 114.1694 };
const TIME_ZONE = "Asia/Hong_Kong";

export type ForecastHour = {
  /** "14" — the hour, local to the place. */
  hour: string;
  temperatureC: number;
  code: number;
  rainChance: number;
  isNow: boolean;
};

export type Forecast = {
  temperatureC: number;
  feelsLikeC: number;
  code: number;
  humidity: number;
  windKph: number;
  highC: number;
  lowC: number;
  sunrise: string;
  sunset: string;
  hours: ForecastHour[];
};

type Payload = {
  current?: Record<string, number>;
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    weather_code?: number[];
    precipitation_probability?: number[];
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    sunrise?: string[];
    sunset?: string[];
  };
};

/** Open-Meteo's WMO codes, said in as few words as possible. */
export function conditionFromCode(code: number): string {
  if (code === 0) return "clear";
  if (code === 1) return "mostly clear";
  if (code === 2) return "part cloud";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "showers";
  if (code >= 85 && code <= 86) return "snow showers";
  if (code >= 95) return "thunderstorm";
  return "—";
}

/** One character per condition, so the strip reads without icons. */
export function glyphFromCode(code: number): string {
  if (code === 0 || code === 1) return "○";
  if (code === 2) return "◔";
  if (code === 3) return "●";
  if (code === 45 || code === 48) return "≡";
  if (code >= 95) return "⚡";
  if (code >= 71 && code <= 86) return "✳";
  if (code >= 51) return "☂";
  return "·";
}

function hourLabel(iso: string): string {
  return iso.slice(11, 13);
}

export type ForecastState = {
  forecast: Forecast | null;
  /** True once the request has come back one way or the other. */
  settled: boolean;
  failed: boolean;
};

/**
 * The next twelve hours, plus today's shape.
 *
 * Fetched once on mount rather than on hover — one small request, and the
 * panel is already full the first time it opens instead of spending its first
 * second saying so. If the request fails the panel says that too; it never
 * sits on a loading line forever.
 */
export function useWeatherForecast(): ForecastState {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [settled, setSettled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const url = new URL(FORECAST_URL);
    url.searchParams.set("latitude", String(COORDS.lat));
    url.searchParams.set("longitude", String(COORDS.lng));
    url.searchParams.set("timezone", TIME_ZONE);
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m",
    );
    url.searchParams.set(
      "hourly",
      "temperature_2m,weather_code,precipitation_probability",
    );
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,sunrise,sunset",
    );
    url.searchParams.set("forecast_days", "2");

    void fetch(url.toString(), { signal: controller.signal })
      .then((response) => response.json() as Promise<Payload>)
      .then((payload) => {
        const times = payload.hourly?.time;
        const temps = payload.hourly?.temperature_2m;
        const codes = payload.hourly?.weather_code;
        const current = payload.current;
        if (!times || !temps || !codes || !current) {
          setFailed(true);
          setSettled(true);
          return;
        }

        // Open-Meteo returns local wall-clock strings ("2026-08-09T11:00").
        // sv-SE gives the same field order with a space instead of the T, so
        // normalise before comparing or every string compare is off.
        const nowKey = new Date()
          .toLocaleString("sv-SE", { timeZone: TIME_ZONE })
          .replace(" ", "T")
          .slice(0, 13);
        const found = times.findIndex((time) => time.slice(0, 13) >= nowKey);
        const start = found === -1 ? 0 : found;

        const hours: ForecastHour[] = times
          .slice(start, start + 12)
          .map((time, index) => ({
            hour: hourLabel(time),
            temperatureC: temps[start + index] ?? 0,
            code: codes[start + index] ?? 0,
            rainChance:
              payload.hourly?.precipitation_probability?.[start + index] ?? 0,
            isNow: index === 0,
          }));

        setForecast({
          temperatureC: current.temperature_2m ?? 0,
          feelsLikeC: current.apparent_temperature ?? current.temperature_2m ?? 0,
          code: current.weather_code ?? 0,
          humidity: current.relative_humidity_2m ?? 0,
          windKph: current.wind_speed_10m ?? 0,
          highC: payload.daily?.temperature_2m_max?.[0] ?? 0,
          lowC: payload.daily?.temperature_2m_min?.[0] ?? 0,
          sunrise: payload.daily?.sunrise?.[0]?.slice(11, 16) ?? "--:--",
          sunset: payload.daily?.sunset?.[0]?.slice(11, 16) ?? "--:--",
          hours,
        });
        setSettled(true);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        setFailed(true);
        setSettled(true);
      });

    return () => controller.abort();
  }, []);

  return { forecast, settled, failed };
}
