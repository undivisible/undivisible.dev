"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, WheelEvent as ReactWheelEvent } from "react";

const HONG_KONG_TIME_ZONE = "Asia/Hong_Kong";
const MELBOURNE_TIME_ZONE = "Australia/Melbourne";
const HONG_KONG_COORDS = { lat: 22.3193, lng: 114.1694 };
const SOLAR_STORAGE_PREFIX = "undivisible.dev:hkt-solar:";
const LOCATION_STORAGE_KEY = "undivisible.dev:ip-location";
const MINUTES_IN_DAY = 24 * 60;
const SUNRISE_API_URL = "https://api.sunrise-sunset.org/json";
const IP_API_URL = "https://ipapi.co/json/";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const SUNRISE_API_ATTRIBUTION_URL = "https://sunrise-sunset.org/api";
const DEFAULT_SOLAR_MINUTES = {
  sunrise: 6 * 60 + 30,
  sunset: 18 * 60 + 30,
  solarNoon: 12 * 60 + 30,
  civilTwilightBegin: 6 * 60,
  civilTwilightEnd: 19 * 60,
  nauticalTwilightBegin: 5 * 60 + 30,
  nauticalTwilightEnd: 19 * 60 + 30,
  astronomicalTwilightBegin: 5 * 60,
  astronomicalTwilightEnd: 20 * 60,
};

type SolarResponse = {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
};

type SolarTimes = {
  dateKey: string;
  sunrise: number;
  sunset: number;
  solarNoon: number;
  civilTwilightBegin: number;
  civilTwilightEnd: number;
  nauticalTwilightBegin: number;
  nauticalTwilightEnd: number;
  astronomicalTwilightBegin: number;
  astronomicalTwilightEnd: number;
};

type LocationResponse = {
  city?: string;
  timezone?: string;
};

type WeatherResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

type WeatherKind = "clear" | "cloudy" | "rain" | "storm";

type WeatherInfo = {
  temperatureC: number;
  status: string;
  kind: WeatherKind;
};

type LocationInfo = {
  city: string;
  label: string;
  timeZone: string;
  cachedAt: number;
};

type ThemePalette = {
  background: string;
  text: string;
  muted: string;
  soft: string;
  surface: string;
  surfaceHover: string;
  beam: string;
  beamSecondary: string;
  shadow: string;
  accent: string;
  transportText: string;
};

type ThemeStop = {
  minute: number;
  palette: ThemePalette;
};

export type ThemePhase = "night" | "dawn" | "day" | "sunset" | "twilight";

export type ShaderPalette = {
  base: string;
  beam: string;
  beamSecondary: string;
  shadow: string;
  accent: string;
  sunProgress: number;
  daylightStrength: number;
  twilightStrength: number;
  deepNightStrength: number;
  midnightStrength: number;
  weatherKind: WeatherKind;
};

export type HongKongDayTheme = {
  ready: boolean;
  phase: ThemePhase;
  style: CSSProperties;
  shader: ShaderPalette;
  hkgTime: string;
  melTime: string;
  localTime: string;
  localLabel: string;
  showLocalTime: boolean;
  weatherDisplay: string;
  isScrubbing: boolean;
  onScrubWheel: (event: ReactWheelEvent<HTMLElement>) => void;
  resetScrub: () => void;
  getTransportStyle: (baseHex: string) => CSSProperties;
  attributionUrl: string;
};

function logSolar(message: string, extra?: unknown) {
  if (extra === undefined) {
    console.info(`[hkt-solar] ${message}`);
    return;
  }
  console.info(`[hkt-solar] ${message}`, extra);
}

function logLocation(message: string, extra?: unknown) {
  if (extra === undefined) {
    console.info(`[ip-location] ${message}`);
    return;
  }
  console.info(`[ip-location] ${message}`, extra);
}

function logWeather(message: string, extra?: unknown) {
  if (extra === undefined) {
    console.info(`[hkt-weather] ${message}`);
    return;
  }
  console.info(`[hkt-weather] ${message}`, extra);
}

function formatTimeForZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function triangleStrength(value: number, start: number, end: number) {
  if (end <= start || value <= start || value >= end) {
    return 0;
  }
  const mid = (start + end) * 0.5;
  if (value <= mid) {
    return (value - start) / Math.max(1, mid - start);
  }
  return 1 - (value - mid) / Math.max(1, end - mid);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function wrapMinutes(value: number) {
  return ((value % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
}

function isWithinWrappedRange(minute: number, start: number, end: number) {
  if (start <= end) {
    return minute >= start && minute < end;
  }
  return minute >= start || minute < end;
}

function shortestWrappedDelta(from: number, to: number) {
  let delta = (to - from) % MINUTES_IN_DAY;
  if (delta > MINUTES_IN_DAY / 2) {
    delta -= MINUTES_IN_DAY;
  }
  if (delta < -MINUTES_IN_DAY / 2) {
    delta += MINUTES_IN_DAY;
  }
  return delta;
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getDateKey(parts: { year: number; month: number; day: number }) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function minutesFromIso(value: string) {
  const date = new Date(value);
  const parts = getTimeZoneParts(date, HONG_KONG_TIME_ZONE);
  return parts.hour * 60 + parts.minute + parts.second / 60;
}

function buildFallbackSolarTimes(dateKey: string): SolarTimes {
  return {
    dateKey,
    sunrise: DEFAULT_SOLAR_MINUTES.sunrise,
    sunset: DEFAULT_SOLAR_MINUTES.sunset,
    solarNoon: DEFAULT_SOLAR_MINUTES.solarNoon,
    civilTwilightBegin: DEFAULT_SOLAR_MINUTES.civilTwilightBegin,
    civilTwilightEnd: DEFAULT_SOLAR_MINUTES.civilTwilightEnd,
    nauticalTwilightBegin: DEFAULT_SOLAR_MINUTES.nauticalTwilightBegin,
    nauticalTwilightEnd: DEFAULT_SOLAR_MINUTES.nauticalTwilightEnd,
    astronomicalTwilightBegin: DEFAULT_SOLAR_MINUTES.astronomicalTwilightBegin,
    astronomicalTwilightEnd: DEFAULT_SOLAR_MINUTES.astronomicalTwilightEnd,
  };
}

function readCachedSolarTimes(dateKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = window.localStorage.getItem(`${SOLAR_STORAGE_PREFIX}${dateKey}`);
  if (!cached) {
    return null;
  }

  try {
    const parsed = JSON.parse(cached) as SolarTimes;
    return parsed.dateKey === dateKey ? parsed : null;
  } catch {
    return null;
  }
}

function parseSolarTimes(dateKey: string, payload: SolarResponse): SolarTimes | null {
  if (payload.status !== "OK") {
    logSolar("api returned non-OK status, using fallback", payload.status);
    return null;
  }

  return {
    dateKey,
    sunrise: minutesFromIso(payload.results.sunrise),
    sunset: minutesFromIso(payload.results.sunset),
    solarNoon: minutesFromIso(payload.results.solar_noon),
    civilTwilightBegin: minutesFromIso(payload.results.civil_twilight_begin),
    civilTwilightEnd: minutesFromIso(payload.results.civil_twilight_end),
    nauticalTwilightBegin: minutesFromIso(payload.results.nautical_twilight_begin),
    nauticalTwilightEnd: minutesFromIso(payload.results.nautical_twilight_end),
    astronomicalTwilightBegin: minutesFromIso(payload.results.astronomical_twilight_begin),
    astronomicalTwilightEnd: minutesFromIso(payload.results.astronomical_twilight_end),
  };
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0")).join("")}`;
}

function mixColors(colorA: string, colorB: string, amount: number) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount,
  );
}

function withAlpha(color: string, alpha: number) {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbToHsl(color: string) {
  const { r, g, b } = hexToRgb(color);
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case nr:
        h = ((ng - nb) / delta) % 6;
        break;
      case ng:
        h = (nb - nr) / delta + 2;
        break;
      default:
        h = (nr - ng) / delta + 4;
        break;
    }
  }

  return {
    h: ((h * 60) + 360) % 360,
    s,
    l,
  };
}

function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

function getPhase(minute: number, solarTimes: SolarTimes): ThemePhase {
  if (minute < solarTimes.civilTwilightBegin || minute >= solarTimes.nauticalTwilightEnd) {
    return "night";
  }
  if (minute < solarTimes.sunrise) {
    return "dawn";
  }
  if (minute < solarTimes.sunset) {
    return "day";
  }
  if (minute < solarTimes.civilTwilightEnd) {
    return "sunset";
  }
  return "twilight";
}

function buildThemeStops(solarTimes: SolarTimes): ThemeStop[] {
  const lateAfternoon = Math.max(solarTimes.solarNoon + 30, solarTimes.sunset - 90);
  return [
    {
      minute: 0,
      palette: {
        background: "#000000",
        text: "#f0ddff",
        muted: "#b89ccf",
        soft: "#77638f",
        surface: "#130e18",
        surfaceHover: "#1a1221",
        beam: "#ff8f52",
        beamSecondary: "#ff4438",
        shadow: "#020102",
        accent: "#ff9a44",
        transportText: "#f4e8ff",
      },
    },
    {
      minute: 120,
      palette: {
        background: "#000000",
        text: "#edd8ff",
        muted: "#ab8bc3",
        soft: "#6a5484",
        surface: "#100b14",
        surfaceHover: "#170f1d",
        beam: "#ff8e46",
        beamSecondary: "#ff3d30",
        shadow: "#010001",
        accent: "#ff9240",
        transportText: "#f2e6ff",
      },
    },
    {
      minute: solarTimes.civilTwilightBegin,
      palette: {
        background: "#171a22",
        text: "#f0ebf7",
        muted: "#c4bfd0",
        soft: "#8f96aa",
        surface: "#232a37",
        surfaceHover: "#30394b",
        beam: "#d5a4d8",
        beamSecondary: "#8ea7cf",
        shadow: "#121722",
        accent: "#b7c7e8",
        transportText: "#edf2ff",
      },
    },
    {
      minute: solarTimes.sunrise,
      palette: {
        background: "#667ea5",
        text: "#f7f9ff",
        muted: "#dce4f5",
        soft: "#b6c2d9",
        surface: "#758bb0",
        surfaceHover: "#879cc2",
        beam: "#ffce9d",
        beamSecondary: "#f19ab5",
        shadow: "#4c6185",
        accent: "#b6d2ff",
        transportText: "#f4f8ff",
      },
    },
    {
      minute: solarTimes.solarNoon,
      palette: {
        background: "#c8d8ed",
        text: "#ffffff",
        muted: "#ecf3ff",
        soft: "#d1def2",
        surface: "#97afcf",
        surfaceHover: "#abc1de",
        beam: "#e7f2ff",
        beamSecondary: "#c6ddfb",
        shadow: "#6d87ab",
        accent: "#e5f0ff",
        transportText: "#ffffff",
      },
    },
    {
      minute: lateAfternoon,
      palette: {
        background: "#93aac8",
        text: "#ffffff",
        muted: "#dde8f9",
        soft: "#c2d3ea",
        surface: "#738cac",
        surfaceHover: "#819cbf",
        beam: "#e7d4c7",
        beamSecondary: "#a6bad7",
        shadow: "#556b8a",
        accent: "#d5e4f8",
        transportText: "#ffffff",
      },
    },
    {
      minute: solarTimes.sunset,
      palette: {
        background: "#3f3f56",
        text: "#f5f0fb",
        muted: "#d2ccdd",
        soft: "#a8a3b8",
        surface: "#4c4d66",
        surfaceHover: "#5b5d79",
        beam: "#ff9c76",
        beamSecondary: "#cc80b1",
        shadow: "#26293a",
        accent: "#9fb5d8",
        transportText: "#f3f5ff",
      },
    },
    {
      minute: solarTimes.civilTwilightEnd,
      palette: {
        background: "#252938",
        text: "#f2ecfb",
        muted: "#c4c1d2",
        soft: "#9197ac",
        surface: "#33384a",
        surfaceHover: "#40475c",
        beam: "#947eaa",
        beamSecondary: "#7387a8",
        shadow: "#1d2231",
        accent: "#9eafcb",
        transportText: "#edf2ff",
      },
    },
    {
      minute: solarTimes.nauticalTwilightEnd,
      palette: {
        background: "#11131a",
        text: "#ebe6f2",
        muted: "#b5b7c5",
        soft: "#7f8598",
        surface: "#1b2130",
        surfaceHover: "#262e40",
        beam: "#6f7999",
        beamSecondary: "#5d6e8c",
        shadow: "#0e1119",
        accent: "#8190af",
        transportText: "#e7edf8",
      },
    },
    {
      minute: 1260,
      palette: {
        background: "#020102",
        text: "#efdcff",
        muted: "#b79ed0",
        soft: "#76608f",
        surface: "#15101a",
        surfaceHover: "#1d1424",
        beam: "#ff8f56",
        beamSecondary: "#ff3d37",
        shadow: "#020103",
        accent: "#ff9647",
        transportText: "#f4e8ff",
      },
    },
    {
      minute: 1380,
      palette: {
        background: "#000000",
        text: "#f0deff",
        muted: "#b9a0d1",
        soft: "#77638f",
        surface: "#120d16",
        surfaceHover: "#1a1220",
        beam: "#ff9058",
        beamSecondary: "#ff3f39",
        shadow: "#010001",
        accent: "#ff9647",
        transportText: "#f5e9ff",
      },
    },
  ];
}

function interpolatePalette(stops: ThemeStop[], minute: number) {
  const extendedStops = [
    { minute: stops[stops.length - 1].minute - MINUTES_IN_DAY, palette: stops[stops.length - 1].palette },
    ...stops,
    { minute: stops[0].minute + MINUTES_IN_DAY, palette: stops[0].palette },
  ];

  let currentIndex = 0;
  for (let index = 0; index < extendedStops.length - 1; index += 1) {
    if (minute >= extendedStops[index].minute && minute <= extendedStops[index + 1].minute) {
      currentIndex = index;
      break;
    }
  }

  const start = extendedStops[currentIndex];
  const end = extendedStops[currentIndex + 1];
  const amount = clamp((minute - start.minute) / Math.max(1, end.minute - start.minute), 0, 1);

  return {
    background: mixColors(start.palette.background, end.palette.background, amount),
    text: mixColors(start.palette.text, end.palette.text, amount),
    muted: mixColors(start.palette.muted, end.palette.muted, amount),
    soft: mixColors(start.palette.soft, end.palette.soft, amount),
    surface: mixColors(start.palette.surface, end.palette.surface, amount),
    surfaceHover: mixColors(start.palette.surfaceHover, end.palette.surfaceHover, amount),
    beam: mixColors(start.palette.beam, end.palette.beam, amount),
    beamSecondary: mixColors(start.palette.beamSecondary, end.palette.beamSecondary, amount),
    shadow: mixColors(start.palette.shadow, end.palette.shadow, amount),
    accent: mixColors(start.palette.accent, end.palette.accent, amount),
    transportText: mixColors(start.palette.transportText, end.palette.transportText, amount),
  };
}

function buildLocationLabel(city: string) {
  const words = city.replace(/[^a-zA-Z\s]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
  }
  if (words.length === 2) {
    return `${words[0].slice(0, 2)}${words[1].slice(0, 1)}`.toUpperCase();
  }
  return city.slice(0, 3).toUpperCase();
}

function weatherFromCode(code: number): { kind: WeatherKind; status: string } {
  if (code === 95 || code === 96 || code === 99) {
    return { kind: "storm", status: "STORMY" };
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { kind: "rain", status: "RAINY" };
  }
  if ([1, 2, 3, 45, 48].includes(code)) {
    return { kind: "cloudy", status: "CLOUDY" };
  }
  return { kind: "clear", status: "CLEAR" };
}

function formatWeatherDisplay(weather: WeatherInfo) {
  return `${Math.round(weather.temperatureC)}°C ${weather.status}`;
}

function getFallbackLocationInfo(): LocationInfo {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const city = zone.split("/").pop()?.replace(/_/g, " ") ?? "Local";
  return {
    city,
    label: buildLocationLabel(city),
    timeZone: zone,
    cachedAt: Date.now(),
  };
}

function readCachedLocationInfo() {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = window.localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!cached) {
    return null;
  }

  try {
    const parsed = JSON.parse(cached) as LocationInfo;
    return Date.now() - parsed.cachedAt < 24 * 60 * 60 * 1000 ? parsed : null;
  } catch {
    return null;
  }
}

function adjustPillColor(baseHex: string, accentHex: string, minute: number, phase: ThemePhase) {
  const base = rgbToHsl(baseHex);
  const accent = rgbToHsl(accentHex);
  const pulse = 0.5 + Math.sin((minute / MINUTES_IN_DAY) * Math.PI * 2 - Math.PI / 2) * 0.5;
  const hue = (base.h * 0.76 + accent.h * 0.24 + (phase === "night" ? 10 : phase === "sunset" ? -6 : 0) + 360) % 360;
  const saturation = clamp(base.s + (phase === "night" ? 0.26 : phase === "day" ? 0.08 : 0.18) + pulse * 0.06, 0.32, 0.96);
  const lightness = clamp(base.l + (phase === "day" ? 0.12 : phase === "night" ? -0.11 : 0.01), 0.18, 0.7);
  return hslToHex(hue, saturation, lightness);
}

function minuteInZone(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  return parts.hour * 60 + parts.minute + parts.second / 60;
}

export function useHongKongDayTheme(): HongKongDayTheme {
  const initialDateKey = getDateKey(getTimeZoneParts(new Date(), HONG_KONG_TIME_ZONE));
  const initialCachedSolar = readCachedSolarTimes(initialDateKey);
  const initialCachedLocation = readCachedLocationInfo();
  const [now, setNow] = useState(() => new Date());
  const [solarTimes, setSolarTimes] = useState<SolarTimes>(() => initialCachedSolar ?? buildFallbackSolarTimes(initialDateKey));
  const [location, setLocation] = useState<LocationInfo>(() => initialCachedLocation ?? getFallbackLocationInfo());
  const [weather, setWeather] = useState<WeatherInfo>({ temperatureC: 24, status: "CLEAR", kind: "clear" });
  const [displayedMinute, setDisplayedMinute] = useState(() => minuteInZone(new Date(), HONG_KONG_TIME_ZONE));
  const [isScrubbing, setIsScrubbing] = useState(false);
  const resetFrameRef = useRef<number | null>(null);

  const hktParts = useMemo(() => getTimeZoneParts(now, HONG_KONG_TIME_ZONE), [now]);
  const hktDateKey = useMemo(() => getDateKey(hktParts), [hktParts]);
  const liveMinute = hktParts.hour * 60 + hktParts.minute + hktParts.second / 60;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let disposed = false;
    const url = new URL(WEATHER_API_URL);
    url.searchParams.set("latitude", String(HONG_KONG_COORDS.lat));
    url.searchParams.set("longitude", String(HONG_KONG_COORDS.lng));
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("timezone", HONG_KONG_TIME_ZONE);
    logWeather("requesting weather api", url.toString());

    void fetch(url.toString())
      .then((response) => response.json() as Promise<WeatherResponse>)
      .then((payload) => {
        if (disposed) {
          return;
        }
        const temperature = payload.current?.temperature_2m;
        const code = payload.current?.weather_code;
        if (typeof temperature !== "number" || typeof code !== "number") {
          logWeather("api response missing weather fields", payload);
          return;
        }
        const parsed = weatherFromCode(code);
        setWeather({
          temperatureC: temperature,
          status: parsed.status,
          kind: parsed.kind,
        });
        logWeather("api success, weather updated", { temperature, code, parsed });
      })
      .catch((error: unknown) => {
        logWeather("api request failed, keeping fallback", error);
      });

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (resetFrameRef.current !== null) {
        window.cancelAnimationFrame(resetFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    const storageKey = `${SOLAR_STORAGE_PREFIX}${hktDateKey}`;
    const cached = readCachedSolarTimes(hktDateKey);

    if (cached) {
      logSolar(`cache hit for ${hktDateKey}`);
      return;
    }

    logSolar(`cache miss for ${hktDateKey}, fetching without immediate fallback`);

    const url = new URL(SUNRISE_API_URL);
    url.searchParams.set("lat", String(HONG_KONG_COORDS.lat));
    url.searchParams.set("lng", String(HONG_KONG_COORDS.lng));
    url.searchParams.set("formatted", "0");
    url.searchParams.set("date", hktDateKey);
    url.searchParams.set("tzid", HONG_KONG_TIME_ZONE);
    logSolar("requesting sunrise-sunset API", url.toString());

    void fetch(url.toString())
      .then((response) => response.json() as Promise<SolarResponse>)
      .then((payload) => {
        if (disposed) {
          return;
        }
        const parsed = parseSolarTimes(hktDateKey, payload);
        if (parsed) {
          setSolarTimes(parsed);
          window.localStorage.setItem(storageKey, JSON.stringify(parsed));
          logSolar(`api success for ${hktDateKey}, cached response`);
          return;
        }

        setSolarTimes(buildFallbackSolarTimes(hktDateKey));
        logSolar(`api parse failed for ${hktDateKey}, fallback applied`);
      })
      .catch((error: unknown) => {
        setSolarTimes(buildFallbackSolarTimes(hktDateKey));
        logSolar(`api request failed for ${hktDateKey}, fallback retained`, error);
      });

    return () => {
      disposed = true;
    };
  }, [hktDateKey]);

  useEffect(() => {
    let disposed = false;
    const cached = readCachedLocationInfo();
    if (cached) {
      logLocation("cache hit", cached);
      return;
    }

    logLocation("cache miss, requesting location api", IP_API_URL);

    void fetch(IP_API_URL)
      .then((response) => response.json() as Promise<LocationResponse>)
      .then((payload) => {
        if (disposed || !payload.city || !payload.timezone) {
          logLocation("api response missing city/timezone, keeping fallback", payload);
          return;
        }
        const nextLocation = {
          city: payload.city,
          label: buildLocationLabel(payload.city),
          timeZone: payload.timezone,
          cachedAt: Date.now(),
        };
        setLocation(nextLocation);
        window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nextLocation));
        logLocation("api success, cached location", nextLocation);
      })
      .catch((error: unknown) => {
        logLocation("api request failed, keeping fallback", error);
      });

    return () => {
      disposed = true;
    };
  }, []);

  const stops = useMemo(() => buildThemeStops(solarTimes), [solarTimes]);
  const effectiveDisplayedMinute = isScrubbing ? displayedMinute : liveMinute;
  const palette = useMemo(() => interpolatePalette(stops, effectiveDisplayedMinute), [effectiveDisplayedMinute, stops]);
  const phase = getPhase(effectiveDisplayedMinute, solarTimes);
  const displayedDate = useMemo(() => {
    const delta = shortestWrappedDelta(liveMinute, effectiveDisplayedMinute);
    return new Date(now.getTime() + delta * 60 * 1000);
  }, [effectiveDisplayedMinute, liveMinute, now]);

  const daylightStrength = useMemo(() => {
    if (effectiveDisplayedMinute <= solarTimes.sunrise || effectiveDisplayedMinute >= solarTimes.sunset) {
      return 0;
    }
    const solarNoon = (solarTimes.sunrise + solarTimes.sunset) * 0.5;
    if (effectiveDisplayedMinute <= solarNoon) {
      return clamp(
        (effectiveDisplayedMinute - solarTimes.sunrise) / Math.max(1, solarNoon - solarTimes.sunrise),
        0,
        1,
      );
    }
    return clamp(
      1 - (effectiveDisplayedMinute - solarNoon) / Math.max(1, solarTimes.sunset - solarNoon),
      0,
      1,
    );
  }, [effectiveDisplayedMinute, solarTimes.sunrise, solarTimes.sunset]);
  const morningTwilight = triangleStrength(
    effectiveDisplayedMinute,
    solarTimes.nauticalTwilightBegin,
    solarTimes.sunrise,
  );
  const eveningTwilight = triangleStrength(
    effectiveDisplayedMinute,
    solarTimes.sunset,
    solarTimes.nauticalTwilightEnd,
  );
  const twilightStrength = clamp(Math.max(morningTwilight, eveningTwilight), 0, 1);
  const midnightCenter = 0;
  const midnightDistance = Math.min(
    Math.abs(effectiveDisplayedMinute - midnightCenter),
    MINUTES_IN_DAY - Math.abs(effectiveDisplayedMinute - midnightCenter),
  );
  const midnightStrength = clamp(1 - midnightDistance / 180, 0, 1);
  const deepNightStrength = isWithinWrappedRange(
    effectiveDisplayedMinute,
    solarTimes.nauticalTwilightEnd,
    solarTimes.nauticalTwilightBegin,
  )
    ? 1
    : 0;
  const fullSpan = solarTimes.civilTwilightEnd - solarTimes.civilTwilightBegin;
  const sunProgress = fullSpan > 0
    ? clamp((effectiveDisplayedMinute - solarTimes.civilTwilightBegin) / fullSpan, 0, 1)
    : 0;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-background", palette.background);
    root.style.setProperty("--page-text", "#ffffff");
    root.style.setProperty("--page-text-muted", "rgba(255, 255, 255, 0.76)");
    root.style.setProperty("--page-text-soft", "rgba(255, 255, 255, 0.54)");
    root.style.setProperty("--page-surface", palette.surface);
    root.style.setProperty("--page-surface-hover", palette.surfaceHover);
    root.style.setProperty("--page-accent", palette.accent);
    root.style.setProperty("--transport-text", palette.transportText);
    root.style.setProperty("--wall-text-shadow", "none");
    root.style.setProperty("--neon-shadow", "none");
    root.style.setProperty("--neon-text-glow", "none");
  }, [palette, phase]);

  const style = useMemo<CSSProperties>(() => ({}), []);

  const onScrubWheel = (event: ReactWheelEvent<HTMLElement>) => {
    if (resetFrameRef.current !== null) {
      window.cancelAnimationFrame(resetFrameRef.current);
      resetFrameRef.current = null;
    }
    const step = event.shiftKey ? 12 : 3;
    const direction = event.deltaY > 0 ? step : -step;
    setIsScrubbing(true);
    setDisplayedMinute((current) => wrapMinutes(current + direction));
  };

  const resetScrub = () => {
    if (!isScrubbing) {
      return;
    }

    if (resetFrameRef.current !== null) {
      window.cancelAnimationFrame(resetFrameRef.current);
    }

    const startedAt = performance.now();
    const startMinute = displayedMinute;
    const delta = shortestWrappedDelta(startMinute, liveMinute);
    const duration = 420;

    const animate = (frameTime: number) => {
      const progress = clamp((frameTime - startedAt) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextMinute = wrapMinutes(startMinute + delta * eased);
      setDisplayedMinute(nextMinute);

      if (progress < 1) {
        resetFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      resetFrameRef.current = null;
      setIsScrubbing(false);
      setDisplayedMinute(liveMinute);
    };

    resetFrameRef.current = window.requestAnimationFrame(animate);
  };

  return {
    ready: true,
    phase,
    style,
    shader: {
      base: palette.background,
      beam: palette.beam,
      beamSecondary: palette.beamSecondary,
      shadow: palette.shadow,
      accent: palette.accent,
      sunProgress,
      daylightStrength,
      twilightStrength,
      deepNightStrength,
      midnightStrength,
      weatherKind: weather.kind,
    },
    hkgTime: formatTimeForZone(displayedDate, HONG_KONG_TIME_ZONE),
    melTime: formatTimeForZone(displayedDate, MELBOURNE_TIME_ZONE),
    localTime: formatTimeForZone(displayedDate, location.timeZone),
    localLabel: location.label,
    showLocalTime: location.timeZone !== HONG_KONG_TIME_ZONE && location.timeZone !== MELBOURNE_TIME_ZONE,
    weatherDisplay: formatWeatherDisplay(weather),
    isScrubbing,
    onScrubWheel,
    resetScrub,
    getTransportStyle: (baseHex: string) => {
      const background = adjustPillColor(baseHex, palette.accent, effectiveDisplayedMinute, phase);
      return {
        background,
        color: palette.transportText,
      };
    },
    attributionUrl: SUNRISE_API_ATTRIBUTION_URL,
  };
}
