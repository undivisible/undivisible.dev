"use client";

import { useEffect, useRef } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { formatUtcOffset, type NowLocation } from "@/lib/parse-now-markdown";

function formatForOffset(date: Date, utcOffsetMinutes: number): string {
  const shifted = new Date(date.getTime() + utcOffsetMinutes * 60_000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(
    shifted.getUTCSeconds(),
  )}`;
}

/**
 * Weather and one clock, for wherever I am. Location and UTC offset come from
 * the frontmatter at the top of now.md, so moving is a markdown edit.
 * Scrolling over it still scrubs the time and the sky, as on the live site.
 */
export function LabClock({
  dayTheme,
  location,
  status,
  className = "",
}: {
  dayTheme: HongKongDayTheme;
  location: NowLocation;
  status?: string | null;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.addEventListener("wheel", dayTheme.onClockWheel, { passive: false });
    return () => node.removeEventListener("wheel", dayTheme.onClockWheel);
  }, [dayTheme.onClockWheel]);

  const time = hydrated
    ? formatForOffset(dayTheme.displayedDate, location.utcOffsetMinutes)
    : "--:--:--";
  const weather = hydrated ? dayTheme.weatherDisplay : "--°C --";

  return (
    <div
      ref={ref}
      data-time-scrubber="true"
      className={`lab-clock ${className}`}
      onMouseLeave={dayTheme.resetScrub}
    >
      <a
        className="lab-clock-weather"
        href={dayTheme.weatherHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {weather}
      </a>
      <div className="lab-clock-row">
        <span className="lab-clock-place">{location.label}</span>
        <span className="lab-clock-time" suppressHydrationWarning>
          {time}
        </span>
        <span className="lab-clock-zone">
          {formatUtcOffset(location.utcOffsetMinutes)}
        </span>
      </div>
      {status ? <div className="lab-clock-status">{status}</div> : null}
      <div className="lab-clock-hint">scroll to change time</div>
    </div>
  );
}
