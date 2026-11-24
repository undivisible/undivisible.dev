import { useEffect, useState } from "react";
import { parseWeather, type WeatherInfo } from "./kuala-lumpur-weather";
import {
  buildCityWeatherUrl,
  parseCitySolar,
  type CitySolar,
  type WeatherCity,
} from "./weather-cities";

type CityResult =
  | { cityId: string; status: "loading" | "unavailable" }
  | {
      cityId: string;
      status: "ready";
      solar: CitySolar;
      weather: WeatherInfo | null;
    };

export function useWeatherCity(city: WeatherCity) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<CityResult>({
    cityId: city.id,
    status: "loading",
  });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setResult({ cityId: city.id, status: "loading" });
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    void (async () => {
      try {
        const response = await fetch(buildCityWeatherUrl(city), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Weather unavailable");
        const payload: unknown = await response.json();
        const solar = parseCitySolar(payload);
        const weather = city.id === "kl" ? null : parseWeather(payload);
        if (!solar || (city.id !== "kl" && !weather))
          throw new Error("Invalid forecast");
        if (active)
          setResult({ cityId: city.id, status: "ready", solar, weather });
      } catch {
        if (active) setResult({ cityId: city.id, status: "unavailable" });
      } finally {
        window.clearTimeout(timeout);
      }
    })();
    const refresh = window.setInterval(
      () => setAttempt((value) => value + 1),
      10 * 60_000,
    );
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
      window.clearInterval(refresh);
    };
  }, [city, attempt]);
  return {
    result:
      result.cityId === city.id
        ? result
        : { cityId: city.id, status: "loading" as const },
    retry: () => setAttempt((value) => value + 1),
  };
}
