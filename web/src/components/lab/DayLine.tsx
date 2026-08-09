"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";

const MINUTES_IN_DAY = 1440;

const HK_MINUTE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Hong_Kong",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function hongKongMinute(date: Date): number {
  const [hour = "0", minute = "0"] = HK_MINUTE_FORMAT.format(date).split(":");
  return Number(hour) * 60 + Number(minute);
}

function clockLabel(minute: number): string {
  const wrapped = ((minute % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(
    Math.floor(wrapped % 60),
  ).padStart(2, "0")}`;
}

/**
 * The whole day as one line, sitting under the clock.
 *
 * Drag the sun to move the hour: the sky behind the page, its colours and the
 * shadows under the type all follow, and letting go settles it back to now.
 * It was a panel of its own further down the page; it belongs next to the
 * time it is showing.
 */
export function DayLine({ dayTheme }: { dayTheme: HongKongDayTheme }) {
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [cursor, setCursor] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.addEventListener("wheel", dayTheme.onClockWheel, { passive: false });
    return () => node.removeEventListener("wheel", dayTheme.onClockWheel);
  }, [dayTheme.onClockWheel]);

  const minuteAtPointer = useCallback((clientX: number) => {
    const node = ref.current;
    if (!node) return 0;
    const rect = node.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return ratio * (MINUTES_IN_DAY - 1);
  }, []);

  const minute = hydrated ? hongKongMinute(dayTheme.displayedDate) : 0;
  const sunLeft = (minute / MINUTES_IN_DAY) * 100;
  const moonLeft = (((minute + 720) % MINUTES_IN_DAY) / MINUTES_IN_DAY) * 100;
  const dayFlat = 1 - Math.pow(1 - dayTheme.shader.daylightStrength, 3);

  return (
    <div
      ref={ref}
      className={`day-line ${dayTheme.isScrubbing ? "is-scrubbing" : ""}`}
      role="slider"
      tabIndex={0}
      aria-label="Time of day in Hong Kong"
      aria-valuemin={0}
      aria-valuemax={MINUTES_IN_DAY - 1}
      aria-valuenow={Math.floor(minute)}
      aria-valuetext={`${clockLabel(minute)} in Hong Kong`}
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        dayTheme.scrubToMinute(minuteAtPointer(event.clientX));
      }}
      onPointerMove={(event) => {
        setCursor(minuteAtPointer(event.clientX));
        if (dragging.current) {
          dayTheme.scrubToMinute(minuteAtPointer(event.clientX));
        }
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onMouseLeave={() => {
        dragging.current = false;
        setCursor(null);
        dayTheme.resetScrub();
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 60 : 15;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          dayTheme.scrubToMinute(
            minute + (event.key === "ArrowRight" ? step : -step),
          );
        }
        if (event.key === "Escape") dayTheme.resetScrub();
      }}
    >
      <span className="day-line-track" aria-hidden />
      <span
        className="day-line-sun"
        aria-hidden
        style={{ left: `${sunLeft}%`, opacity: hydrated ? 0.5 + dayFlat * 0.5 : 0 }}
      />
      <span
        className="day-line-moon"
        aria-hidden
        style={{
          left: `${moonLeft}%`,
          opacity: hydrated ? 0.14 + (1 - dayFlat) * 0.5 : 0,
        }}
      />
      {cursor !== null ? (
        <span
          className="day-line-ghost"
          aria-hidden
          style={{ left: `${(cursor / MINUTES_IN_DAY) * 100}%` }}
        >
          {clockLabel(cursor)}
        </span>
      ) : null}
      {/* The hint and the read-out share a line, so only one shows. */}
      {cursor === null ? (
        <span className="day-line-hint" aria-hidden>
          {dayTheme.isScrubbing ? "let go for now" : "drag the sun"}
        </span>
      ) : null}
    </div>
  );
}
