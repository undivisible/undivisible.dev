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
  /** Open-Meteo rain accumulation, in millimetres. */
  rainIntensity: number;
};

export function buildKualaLumpurWeatherUrl() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(KUALA_LUMPUR_COORDS.latitude));
  url.searchParams.set("longitude", String(KUALA_LUMPUR_COORDS.longitude));
  url.searchParams.set("current", "temperature_2m,weather_code,rain");
  url.searchParams.set("timezone", "Asia/Kuala_Lumpur");
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

export function parseWeather(payload: unknown): WeatherInfo | null {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("current" in payload)
  )
    return null;
  const current = payload.current;
  if (typeof current !== "object" || current === null) return null;
  if (
    !("temperature_2m" in current) ||
    typeof current.temperature_2m !== "number" ||
    !Number.isFinite(current.temperature_2m) ||
    !("weather_code" in current) ||
    typeof current.weather_code !== "number" ||
    !Number.isInteger(current.weather_code)
  )
    return null;
  const rain = "rain" in current ? current.rain : 0;
  if (typeof rain !== "number" || !Number.isFinite(rain) || rain < 0)
    return null;
  return {
    temperatureC: current.temperature_2m,
    ...weatherFromCode(current.weather_code),
    rainIntensity: rain,
  };
}
