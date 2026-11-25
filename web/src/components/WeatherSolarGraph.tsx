import { useEffect, useId, useState } from "react";
import { localSolarDay } from "@/lib/solar-elevation";
import type { WeatherCity } from "@/lib/weather-cities";
import "@/styles/weather-solar-graph.css";

function lightColor(altitude: number) {
  const phases = [
    [-90, "#536796"],
    [-18, "#718dca"],
    [-12, "#95b9ee"],
    [-6, "#d0e5ff"],
    [0, "#ffc3ad"],
    [6, "#ffdc9c"],
    [90, "#ffed9e"],
  ] as const;
  for (let i = 1; i < phases.length; i++) {
    const a = phases[i - 1]!;
    const b = phases[i]!;
    if (altitude <= b[0]) {
      const fraction = Math.max(0, (altitude - a[0]) / (b[0] - a[0]));
      const channels = [1, 3, 5].map((offset) => {
        const from = parseInt(a[1].slice(offset, offset + 2), 16);
        const to = parseInt(b[1].slice(offset, offset + 2), 16);
        return Math.round(from + (to - from) * fraction);
      });
      return `rgb(${channels.join(" ")})`;
    }
  }
  return "#ffed9e";
}

export function WeatherSolarGraph({
  city,
  formatTime,
}: {
  city: WeatherCity;
  formatTime: (ms: number) => string;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const day = localSolarDay(city, now);
  const id = useId();
  const x = (time: number) =>
    12 + ((time - day.startMs) / (day.endMs - day.startMs)) * 376;
  const y = (altitude: number) => 75 - altitude * 0.7;
  const curve = day.points
    .map(
      (point, i) => `${i ? "L" : "M"}${x(point.timeMs)} ${y(point.altitude)}`,
    )
    .join(" ");
  const altitude = day.current.altitude;
  const currentColor = lightColor(altitude);
  return (
    <div className="weather-solar-graph">
      <div className="weather-solar-state">
        <span>sun elevation</span>
        <span>
          {formatTime(now)} · {altitude.toFixed(1)}°
        </span>
      </div>
      <svg
        className="weather-solar-diagram"
        viewBox="0 0 400 164"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Full local day solar elevation. Current sun ${Math.abs(altitude).toFixed(1)} degrees ${altitude >= 0 ? "above" : "below"} horizon at ${formatTime(now)}.`}
      >
        <title>Solar elevation over today’s complete local day</title>
        <defs>
          <linearGradient id={`${id}-light`}>
            {day.points.map((point) => (
              <stop
                key={point.timeMs}
                offset={
                  (point.timeMs - day.startMs) / (day.endMs - day.startMs)
                }
                stopColor={lightColor(point.altitude)}
              />
            ))}
          </linearGradient>
        </defs>
        <path
          className="weather-solar-fill"
          d={`${curve} L388 75 L12 75 Z`}
          fill={`url(#${id}-light)`}
        />
        <path className="weather-solar-horizon" d="M12 75 H388" />
        <text x="14" y="70" className="weather-solar-axis">
          0° horizon
        </text>
        <path
          className="weather-solar-glow"
          d={curve}
          stroke={`url(#${id}-light)`}
        />
        <path
          className="weather-solar-daylight"
          d={curve}
          stroke={`url(#${id}-light)`}
        />
        <path className="weather-solar-now-line" d={`M${x(now)} 12 V138`} />
        <g className="weather-solar-marker" data-current-altitude={altitude}>
          <path d={`M${x(now)} ${y(altitude)} h0.001`} />
          <path
            d={`M${x(now)} ${y(altitude)} h0.001`}
            style={{ stroke: currentColor }}
          />
        </g>
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <text
            key={fraction}
            className="weather-solar-axis"
            x={12 + 376 * fraction}
            y="158"
            textAnchor={
              fraction === 0 ? "start" : fraction === 1 ? "end" : "middle"
            }
          >
            {fraction === 1
              ? "24"
              : new Intl.DateTimeFormat("en-GB", {
                  timeZone: city.timezone,
                  hour: "2-digit",
                  hourCycle: "h23",
                }).format(day.startMs + (day.endMs - day.startMs) * fraction)}
          </text>
        ))}
      </svg>
      <div className="weather-solar-times">
        {(
          [
            ["sunrise", day.sunriseMs],
            ["sunset", day.sunsetMs],
          ] as const
        ).map(([label, time]) => (
          <span key={label}>
            {label}{" "}
            {time === null ? (
              "—"
            ) : (
              <time dateTime={new Date(time).toISOString()}>
                {formatTime(time)}
              </time>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
