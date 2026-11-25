import type { CitySolar } from "@/lib/weather-cities";

export function WeatherSolarGraph({
  solar,
  progress,
  formatTime,
}: {
  solar: CitySolar;
  progress: number;
  formatTime: (ms: number) => string;
}) {
  const sunrise = formatTime(solar.sunriseMs);
  const sunset = formatTime(solar.sunsetMs);
  const position = {
    x: 24 + progress * 352,
    y: 70 - 216 * progress * (1 - progress),
  };
  const state = solar.isDay ? "sun above horizon" : "night · sun below horizon";

  return (
    <div className="weather-solar-graph">
      <span className="weather-solar-state">{state}</span>
      <svg
        className="weather-solar-diagram"
        viewBox="0 0 400 88"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Local daylight: sunrise ${sunrise}, sunset ${sunset}. ${
          solar.isDay
            ? `Sun above the horizon, ${Math.round(progress * 100)}% through today's daylight.`
            : "Night: sun below the horizon; no current sun position is plotted."
        }`}
      >
        <title>Today’s local sunrise, sunset and daylight position</title>
        <path className="weather-solar-daylight" d="M24 70 Q200 -38 376 70" />
        <path className="weather-solar-horizon" d="M12 70 H388" />
        <path className="weather-solar-endpoints" d="M24 66 V74 M376 66 V74" />
        {solar.isDay && (
          <g className="weather-solar-marker">
            <path d={`M${position.x} ${position.y} h0.001`} />
            <path d={`M${position.x} ${position.y} h0.001`} />
          </g>
        )}
      </svg>
      <div className="weather-solar-times">
        <span className="weather-solar-time">
          <span>sunrise</span>
          <time dateTime={new Date(solar.sunriseMs).toISOString()}>
            {sunrise}
          </time>
        </span>
        <span className="weather-solar-time">
          <span>sunset</span>
          <time dateTime={new Date(solar.sunsetMs).toISOString()}>
            {sunset}
          </time>
        </span>
      </div>
    </div>
  );
}
