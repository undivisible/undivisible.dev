import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { StatusPreview } from "./StatusPreview";

const time = (milliseconds: number, date = false) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    weekday: date ? "short" : undefined,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(milliseconds);
const value = (number: number | null, unit: string, digits = 0) =>
  number === null ? "not available" : `${number.toFixed(digits)}${unit}`;

export function WeatherPreview({
  dayTheme,
  label,
}: {
  dayTheme: HongKongDayTheme;
  label: string;
}) {
  const weather = dayTheme.weather;
  return (
    <StatusPreview
      id="weather-preview"
      label={label}
      title="Kuala Lumpur weather"
    >
      <div aria-live="polite">
        {dayTheme.weatherStatus === "loading" ? (
          <p role="status">loading the current weather and hourly forecast…</p>
        ) : weather ? (
          <>
            <p className="weather-current">
              <strong>{Math.round(weather.temperatureC)}°C</strong>
              <span>{weather.status.toLowerCase()}</span>
            </p>
            <dl className="weather-stats">
              <div>
                <dt>feels like</dt>
                <dd>{value(weather.feelsLikeC, "°C")}</dd>
              </div>
              <div>
                <dt>humidity</dt>
                <dd>{value(weather.humidityPercent, "%")}</dd>
              </div>
              <div>
                <dt>wind at 10 m</dt>
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
            {weather.hourly.length ? (
              <>
                <h3>
                  next {weather.hourly.length} hours <span>MYT · UTC+8</span>
                </h3>
                <div
                  className="weather-timeline"
                  tabIndex={0}
                  role="region"
                  aria-label="Hourly Kuala Lumpur forecast, scroll horizontally for later hours"
                >
                  <table>
                    <caption className="sr-only">
                      Kuala Lumpur hourly model forecast
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">hour</th>
                        {weather.hourly.map((hour) => (
                          <th scope="col" key={hour.timeMs}>
                            <time
                              dateTime={new Date(hour.timeMs).toISOString()}
                            >
                              {time(hour.timeMs, true)}
                            </time>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="weather-temperatures">
                        <th scope="row">°C</th>
                        {weather.hourly.map((hour) => (
                          <td key={hour.timeMs}>
                            {hour.temperatureC === null
                              ? "—"
                              : hour.temperatureC.toFixed(1)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">sky</th>
                        {weather.hourly.map((hour) => (
                          <td key={hour.timeMs}>
                            {hour.kind === "unknown" ? "—" : hour.kind}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">precip. %</th>
                        {weather.hourly.map((hour) => (
                          <td key={hour.timeMs}>
                            {hour.precipitationProbability === null
                              ? "—"
                              : hour.precipitationProbability}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">mm</th>
                        {weather.hourly.map((hour) => (
                          <td key={hour.timeMs}>
                            {hour.precipitationMm === null
                              ? "—"
                              : hour.precipitationMm.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="weather-note">
                  precipitation totals and chance are for the hour ending at
                  each time. scroll for later hours.
                </p>
              </>
            ) : (
              <p>hourly forecast not available.</p>
            )}
            {weather.observedAtMs !== null && (
              <p className="weather-note">
                modelled for {time(weather.observedAtMs, true)} MYT
              </p>
            )}
          </>
        ) : (
          <p role="status">
            weather is unavailable. retry now, or it will retry automatically.
          </p>
        )}
      </div>
      <div className="weather-actions">
        <button
          type="button"
          onClick={dayTheme.retryWeather}
          disabled={dayTheme.weatherStatus === "loading"}
        >
          {dayTheme.weatherStatus === "loading"
            ? "loading…"
            : "refresh weather"}
        </button>
        <a
          href={dayTheme.weatherHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenWeather ↗
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
        model forecast, not a local station reading.
      </p>
    </StatusPreview>
  );
}
