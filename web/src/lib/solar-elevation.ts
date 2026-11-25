import type { WeatherCity } from "./weather-cities";

const DAY_MS = 86_400_000;
const SAMPLE_MS = 600_000;
const RADIANS = Math.PI / 180;
const SUNRISE_ALTITUDE = -0.833;

/**
 * Geometric altitude of the Sun's centre, in degrees (east-positive longitude).
 * Independently expressed NOAA/Meeus Julian-century solar-position equations:
 * https://gml.noaa.gov/grad/solcalc/calcdetails.html (linked calculation sheets).
 * No atmospheric refraction, terrain, observer height or solar-disc correction.
 */
export function solarElevation(
  latitude: number,
  longitude: number,
  timeMs: number,
): number {
  const centuries = (timeMs / DAY_MS + 2440587.5 - 2451545) / 36525;
  const meanLongitude =
    (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
  const meanAnomaly =
    (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * RADIANS;
  const eccentricity =
    0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
  const centre =
    Math.sin(meanAnomaly) *
      (1.914602 - centuries * (0.004817 + 0.000014 * centuries)) +
    Math.sin(2 * meanAnomaly) * (0.019993 - 0.000101 * centuries) +
    Math.sin(3 * meanAnomaly) * 0.000289;
  const omega = (125.04 - 1934.136 * centuries) * RADIANS;
  const apparentLongitude =
    (meanLongitude + centre - 0.00569 - 0.00478 * Math.sin(omega)) * RADIANS;
  const meanObliquity =
    23 +
    (26 +
      (21.448 -
        centuries * (46.815 + centuries * (0.00059 - centuries * 0.001813))) /
        60) /
      60;
  const obliquity = (meanObliquity + 0.00256 * Math.cos(omega)) * RADIANS;
  const declination = Math.asin(
    Math.sin(obliquity) * Math.sin(apparentLongitude),
  );
  const y = Math.tan(obliquity / 2) ** 2;
  const longitudeRadians = meanLongitude * RADIANS;
  const equationOfTime =
    (4 / RADIANS) *
    (y * Math.sin(2 * longitudeRadians) -
      2 * eccentricity * Math.sin(meanAnomaly) +
      4 *
        eccentricity *
        y *
        Math.sin(meanAnomaly) *
        Math.cos(2 * longitudeRadians) -
      0.5 * y * y * Math.sin(4 * longitudeRadians) -
      1.25 * eccentricity * eccentricity * Math.sin(2 * meanAnomaly));
  const utcMinutes = (((timeMs % DAY_MS) + DAY_MS) % DAY_MS) / 60_000;
  const solarMinutes =
    (((utcMinutes + equationOfTime + 4 * longitude) % 1440) + 1440) % 1440;
  const hourAngle = (solarMinutes / 4 - 180) * RADIANS;
  const latitudeRadians = latitude * RADIANS;
  const sineAltitude =
    Math.sin(latitudeRadians) * Math.sin(declination) +
    Math.cos(latitudeRadians) * Math.cos(declination) * Math.cos(hourAngle);
  return Math.asin(Math.max(-1, Math.min(1, sineAltitude))) / RADIANS;
}

/** A complete local civil day, independent of weather observation timestamps. */
export function localSolarDay(
  city: Pick<WeatherCity, "latitude" | "longitude" | "timezone">,
  nowMs: number,
) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: city.timezone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  function civilDate(timeMs: number) {
    const parts = formatter.formatToParts(timeMs);
    function part(name: Intl.DateTimeFormatPartTypes) {
      const value = parts.find((entry) => entry.type === name)?.value;
      if (value === undefined) throw new Error(`Missing local date ${name}`);
      return Number(value);
    }
    return Date.UTC(part("year"), part("month") - 1, part("day"));
  }
  // Find the first instant of each date separately, not midnight + 24 hours.
  // This also handles zones whose DST change skips or repeats local midnight.
  function startOfDate(dateMs: number) {
    let low = dateMs - 36 * 3_600_000;
    let high = dateMs + 36 * 3_600_000;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (civilDate(middle) < dateMs) low = middle;
      else high = middle;
    }
    return high;
  }
  const dateMs = civilDate(nowMs);
  const startMs = startOfDate(dateMs);
  const endMs = startOfDate(dateMs + DAY_MS);
  const point = (timeMs: number) => ({
    timeMs,
    altitude: solarElevation(city.latitude, city.longitude, timeMs),
  });
  const points = [point(startMs)];
  for (let timeMs = startMs + SAMPLE_MS; timeMs < endMs; timeMs += SAMPLE_MS) {
    points.push(point(timeMs));
  }
  points.push(point(endMs));

  let sunriseMs: number | null = null;
  let sunsetMs: number | null = null;
  let previous = points[0];
  for (const next of points.slice(1)) {
    if (previous) {
      const rising =
        previous.altitude < SUNRISE_ALTITUDE &&
        next.altitude >= SUNRISE_ALTITUDE;
      const setting =
        previous.altitude >= SUNRISE_ALTITUDE &&
        next.altitude < SUNRISE_ALTITUDE;
      if (rising || setting) {
        const crossingMs =
          previous.timeMs +
          ((SUNRISE_ALTITUDE - previous.altitude) /
            (next.altitude - previous.altitude)) *
            (next.timeMs - previous.timeMs);
        if (rising && sunriseMs === null) sunriseMs = crossingMs;
        if (setting && sunsetMs === null) sunsetMs = crossingMs;
      }
    }
    previous = next;
  }
  return {
    startMs,
    endMs,
    points,
    current: point(nowMs),
    sunriseMs,
    sunsetMs,
  };
}
