"use client";

import {
  conditionFromCode,
  glyphFromCode,
  type Forecast,
} from "@/hooks/use-weather-forecast";

/**
 * The full day, under the one weather line. A temperature curve across the
 * next twelve hours, drawn as a polyline so the shape of the day is the thing
 * you read first, with rain probability as bars underneath it.
 */
export function WeatherPanel({
  forecast,
  settled = true,
  failed = false,
}: {
  forecast: Forecast | null;
  settled?: boolean;
  failed?: boolean;
}) {
  if (!forecast || forecast.hours.length < 2) {
    return (
      <div className="wx-panel">
        <p className="wx-loading">
          {failed || settled
            ? "open-meteo didn't answer. the temperature above is still real."
            : "reading the sky…"}
        </p>
      </div>
    );
  }

  const temps = forecast.hours.map((hour) => hour.temperatureC);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = Math.max(1, max - min);
  const width = 100;
  const height = 28;
  const step = width / (forecast.hours.length - 1);

  const points = temps
    .map((temp, index) => {
      const x = index * step;
      const y = height - ((temp - min) / span) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="wx-panel">
      <div className="wx-head">
        <span className="wx-now">{Math.round(forecast.temperatureC)}°</span>
        <span className="wx-head-copy">
          <b>{conditionFromCode(forecast.code)}</b>
          <i>feels {Math.round(forecast.feelsLikeC)}°</i>
        </span>
        <span className="wx-range">
          <span>↑ {Math.round(forecast.highC)}°</span>
          <span>↓ {Math.round(forecast.lowC)}°</span>
        </span>
      </div>

      <div className="wx-chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <polyline points={points} />
        </svg>
        <div className="wx-bars" aria-hidden>
          {forecast.hours.map((hour, index) => (
            <i
              key={`${hour.hour}-${index}`}
              style={{ height: `${Math.max(2, hour.rainChance * 0.16)}px` }}
              data-wet={hour.rainChance >= 30 ? "true" : undefined}
            />
          ))}
        </div>
      </div>

      <ol className="wx-hours">
        {forecast.hours.map((hour, index) => (
          <li key={`${hour.hour}-${index}`} data-now={hour.isNow || undefined}>
            <span className="wx-hour-t">{Math.round(hour.temperatureC)}°</span>
            <span className="wx-hour-g">{glyphFromCode(hour.code)}</span>
            <span className="wx-hour-h">{hour.isNow ? "now" : hour.hour}</span>
          </li>
        ))}
      </ol>

      <div className="wx-foot">
        <span>humidity {Math.round(forecast.humidity)}%</span>
        <span>wind {Math.round(forecast.windKph)} km/h</span>
        <span>
          ↑ {forecast.sunrise} ↓ {forecast.sunset}
        </span>
      </div>
    </div>
  );
}
