import { useEffect, useMemo, useState } from "react";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { WEATHER_CITIES, cityScene, weatherIcon } from "@/lib/weather-cities";
import { useWeatherCity } from "@/lib/useWeatherCity";
import { Light } from "./Light";
import { StatusPreview } from "./StatusPreview";
import { WeatherRain } from "./WeatherRain";

const value = (number: number | null, unit: string, digits = 0) =>
  number === null ? "not available" : `${number.toFixed(digits)}${unit}`;

export function WeatherPreview({
  dayTheme,
  label,
}: {
  dayTheme: HongKongDayTheme;
  label: string;
}) {
  const [city, setCity] = useState<(typeof WEATHER_CITIES)[number]>(
    WEATHER_CITIES[0],
  );
  const { result, retry } = useWeatherCity(city);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimated(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const weather =
    city.id === "kl"
      ? dayTheme.weather
      : result.status === "ready"
        ? result.weather
        : null;
  const solar = result.status === "ready" ? result.solar : null;
  const loading =
    result.status === "loading" ||
    (city.id === "kl" && dayTheme.weatherStatus === "loading");
  const scene = useMemo(
    () =>
      solar && weather
        ? cityScene(solar, weather, weather.observedAtMs ?? Date.now())
        : null,
    [solar, weather],
  );
  const raining = weather?.kind === "rain" || weather?.kind === "storm";
  const time = (milliseconds: number, date = false) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: city.timezone,
      weekday: date ? "short" : undefined,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(milliseconds);
  const icon = (kind: NonNullable<typeof weather>["kind"], isDay: boolean) => (
    <img
      className="weather-condition-icon"
      src={`/meteocons/${animated ? "animated/" : ""}${weatherIcon(kind, isDay)}.svg`}
      width="64"
      height="64"
      alt=""
      aria-hidden="true"
    />
  );
  return (
    <StatusPreview
      id="weather-preview"
      label={label}
      title={`${city.name} weather`}
      panelClassName="weather-popover"
    >
      {raining && <WeatherRain key={city.id} animated={animated} />}
      <div
        className="weather-city-tabs"
        role="tablist"
        aria-label="Forecast city"
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          const index = WEATHER_CITIES.findIndex(
            (candidate) => candidate.id === city.id,
          );
          const next =
            event.key === "ArrowRight"
              ? (index + 1) % WEATHER_CITIES.length
              : event.key === "ArrowLeft"
                ? (index + WEATHER_CITIES.length - 1) % WEATHER_CITIES.length
                : event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? WEATHER_CITIES.length - 1
                    : null;
          if (next === null) return;
          event.preventDefault();
          const selected = WEATHER_CITIES[next];
          setCity(selected);
          const tab = document.getElementById(`weather-city-${selected.id}`);
          tab?.focus({ preventScroll: true });
          tab?.scrollIntoView({ block: "nearest", inline: "nearest" });
        }}
      >
        {WEATHER_CITIES.map((candidate) => (
          <button
            key={candidate.id}
            id={`weather-city-${candidate.id}`}
            className="weather-city-tab"
            type="button"
            role="tab"
            aria-selected={candidate.id === city.id}
            aria-controls="weather-city-panel"
            tabIndex={candidate.id === city.id ? 0 : -1}
            onClick={() => setCity(candidate)}
          >
            {candidate.name}
          </button>
        ))}
      </div>
      <div
        id="weather-city-panel"
        className="weather-local"
        role="tabpanel"
        aria-labelledby={`weather-city-${city.id}`}
        tabIndex={0}
        data-period={solar ? (solar.isDay ? "day" : "night") : "pending"}
        aria-live="polite"
        aria-busy={loading}
      >
        {weather ? (
          <div key={city.id} className="weather-content">
            <section className="weather-now" aria-label="Current conditions">
              {icon(weather.kind, solar?.isDay ?? true)}
              <div>
                <p className="weather-reading">
                  <strong>{Math.round(weather.temperatureC)}°C</strong>
                  <span>{weather.status.toLowerCase()}</span>
                </p>
                <p className="weather-local-time">
                  {time(weather.observedAtMs ?? Date.now())} local ·{" "}
                  {solar
                    ? solar.isDay
                      ? "daylight"
                      : "after dark"
                    : "daylight unavailable"}
                </p>
              </div>
            </section>
            <dl className="weather-measures">
              <div>
                <dt>feels like</dt>
                <dd>{value(weather.feelsLikeC, "°C")}</dd>
              </div>
              <div>
                <dt>humidity</dt>
                <dd>{value(weather.humidityPercent, "%")}</dd>
              </div>
              <div>
                <dt>wind · 10 m</dt>
                <dd>{value(weather.windKmh, " km/h", 1)}</dd>
              </div>
              <div>
                <dt>
                  rain
                  {weather.rainIntervalSeconds
                    ? ` · last ${weather.rainIntervalSeconds / 60} min`
                    : ""}
                </dt>
                <dd>
                  {weather.rainIntervalSeconds
                    ? value(weather.rainIntensity, " mm", 2)
                    : "not available"}
                </dd>
              </div>
            </dl>
            {solar && scene && (
              <div className="weather-solar-scene">
                <div className="weather-scene" aria-hidden="true">
                  <Light
                    key={city.id}
                    scene={
                      raining
                        ? { ...scene, weatherKind: "cloudy", rainIntensity: 0 }
                        : scene
                    }
                    animated={animated}
                    className="weather-scene-canvas"
                  />
                </div>
                <svg
                  className="weather-solar-path"
                  viewBox="0 0 400 60"
                  role="img"
                  aria-label={
                    solar.isDay
                      ? "Sun position between local sunrise and sunset"
                      : "Sun below the local horizon"
                  }
                >
                  <title>{`sunrise ${time(solar.sunriseMs)} · sunset ${time(solar.sunsetMs)} · ${city.name} local time`}</title>
                  <path
                    d="M16 52 Q200 -40 384 52"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="3 5"
                    opacity="0.4"
                  />
                  <path
                    d="M16 52 H384"
                    fill="none"
                    stroke="currentColor"
                    opacity="0.25"
                  />
                  {solar.isDay && (
                    <circle
                      cx={16 + scene.sunProgress * 368}
                      cy={
                        52 - 184 * scene.sunProgress * (1 - scene.sunProgress)
                      }
                      r="6"
                      fill="#e6b85b"
                      stroke="currentColor"
                    />
                  )}
                </svg>
              </div>
            )}
            {solar && (
              <div className="weather-solar" aria-label="Local solar times">
                <span>
                  sunrise{" "}
                  <time dateTime={new Date(solar.sunriseMs).toISOString()}>
                    {time(solar.sunriseMs)}
                  </time>
                </span>
                <span>
                  sunset{" "}
                  <time dateTime={new Date(solar.sunsetMs).toISOString()}>
                    {time(solar.sunsetMs)}
                  </time>
                </span>
              </div>
            )}
            <h3>next {weather.hourly.length} hours</h3>
            {weather.hourly.length ? (
              <div
                className="weather-forecast"
                tabIndex={0}
                role="region"
                aria-label={`${city.name} hourly forecast, scroll for later hours`}
              >
                {weather.hourly.map((hour) => {
                  const isDay = solar
                    ? solar.daylightWindows.some(
                        (window) =>
                          hour.timeMs >= window.sunriseMs &&
                          hour.timeMs < window.sunsetMs,
                      )
                    : true;
                  return (
                    <article
                      className="weather-hour"
                      key={hour.timeMs}
                      aria-label={`${time(hour.timeMs, true)}, ${hour.status.toLowerCase()}`}
                    >
                      <time dateTime={new Date(hour.timeMs).toISOString()}>
                        {time(hour.timeMs, true)}
                      </time>
                      {icon(hour.kind, isDay)}
                      <strong>{value(hour.temperatureC, "°", 1)}</strong>
                      <span>
                        {hour.kind === "unknown" ? "unavailable" : hour.kind}
                      </span>
                      <span>
                        {value(hour.precipitationProbability, "%")} rain
                      </span>
                      <span>{value(hour.precipitationMm, " mm", 2)}</span>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p>hourly forecast not available.</p>
            )}
          </div>
        ) : (
          <p className="weather-empty" role="status">
            {loading
              ? `loading ${city.name} weather and daylight…`
              : `${city.name} weather is unavailable. try refreshing.`}
          </p>
        )}
      </div>
      {result.status === "unavailable" && weather && (
        <p role="status" className="weather-note">
          local daylight unavailable. refresh to retry the solar scene.
        </p>
      )}
      <div className="weather-actions">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            retry();
            if (city.id === "kl") dayTheme.retryWeather();
          }}
        >
          {loading ? "loading…" : "refresh weather"}
        </button>
        <a
          href={`https://open-meteo.com/en/docs#latitude=${city.latitude}&longitude=${city.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          forecast source ↗
        </a>
      </div>
      <p className="weather-note">
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open-Meteo
        </a>{" "}
        model forecast, not a station reading. Icons by{" "}
        <a
          href="https://meteocons.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Meteocons
        </a>
        .
      </p>
    </StatusPreview>
  );
}
