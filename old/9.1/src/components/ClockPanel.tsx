"use client";

import { useEffect, useRef, useState } from "react";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import type { NowContent } from "@/lib/parse-now-markdown";

export function ClockPanel({
  dayTheme,
  now,
  nowArticleOpen,
  onToggleNowArticle,
  hydrated,
}: {
  dayTheme: HongKongDayTheme;
  now: NowContent;
  nowArticleOpen: boolean;
  onToggleNowArticle?: () => void;
  hydrated: boolean;
}) {
  const clockRef = useRef<HTMLDivElement>(null);
  const [clockHovered, setClockHovered] = useState(false);

  useEffect(() => {
    const clock = clockRef.current;
    if (!clock) return;
    clock.addEventListener("wheel", dayTheme.onClockWheel, { passive: false });
    return () => clock.removeEventListener("wheel", dayTheme.onClockWheel);
  }, [dayTheme.onClockWheel]);

  const weatherText =
    hydrated && dayTheme ? dayTheme.weatherDisplay : "--°C --";
  const hkgText = hydrated && dayTheme ? dayTheme.hkgTime : "--:--:--";
  const melText = hydrated && dayTheme ? dayTheme.melTime : "--:--:--";
  const localText = hydrated && dayTheme ? dayTheme.localTime : "--:--:--";

  const statusInteractive = Boolean(now.article && onToggleNowArticle);
  const showStatus = Boolean(now.status);
  const statusActive = nowArticleOpen && statusInteractive;

  const statusClass = statusActive
    ? "pointer-events-auto opacity-100 text-white"
    : `normal-case tracking-normal text-[9px] leading-snug sm:text-[10px] lg:transition-opacity lg:duration-300 lg:ease-out ${
        clockHovered || statusActive
          ? "lg:pointer-events-auto lg:opacity-100"
          : "max-lg:pointer-events-auto max-lg:opacity-100 lg:pointer-events-none lg:opacity-0"
      }`;

  return (
    <div
      ref={clockRef}
      data-time-scrubber="true"
      className="w-fit shrink-0 text-[10px] uppercase tracking-[0.18em] [font-family:var(--font-jetbrains-mono),monospace] sm:text-[11px] sm:tracking-[0.22em]"
      style={{ color: "var(--page-text)" }}
      onMouseEnter={() => setClockHovered(true)}
      onMouseLeave={() => {
        setClockHovered(false);
        dayTheme.resetScrub();
      }}
    >
      <div className="mb-2">
        <a
          href={dayTheme.weatherHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 transition-opacity hover:opacity-90"
          style={{ color: "var(--page-text-soft)" }}
        >
          {weatherText}
        </a>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <a
          href={dayTheme.hkgClockHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-wrap items-baseline gap-x-2 no-underline transition-opacity hover:opacity-90"
          style={{ color: "var(--page-text)" }}
        >
          <span
            className="w-[3.2rem] shrink-0"
            style={{ color: "var(--page-text-soft)" }}
          >
            HKG
          </span>
          <span>{hkgText}</span>
        </a>
        {showStatus ? (
          statusInteractive ? (
            <button
              type="button"
              className={`max-w-full cursor-pointer border-none bg-transparent p-0 text-left lg:underline lg:decoration-dotted lg:underline-offset-4 ${statusClass}`}
              style={
                statusActive
                  ? { color: "#ffffff" }
                  : { color: "var(--page-text-muted)" }
              }
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleNowArticle?.();
              }}
            >
              {now.status}
            </button>
          ) : (
            <span
              className={`max-w-full ${statusClass}`}
              style={{ color: "var(--page-text-muted)" }}
            >
              {now.status}
            </span>
          )
        ) : null}
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <a
          href={dayTheme.melClockHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-wrap items-baseline gap-x-2 no-underline transition-opacity hover:opacity-90"
          style={{ color: "var(--page-text)" }}
        >
          <span
            className="w-[3.2rem] shrink-0"
            style={{ color: "var(--page-text-soft)" }}
          >
            MEL
          </span>
          <span>{melText}</span>
        </a>
        <span
          aria-hidden={!clockHovered && !statusActive}
          className={`hidden max-w-[10rem] normal-case tracking-normal text-[9px] leading-snug transition-opacity duration-300 ease-out max-lg:inline-block max-lg:opacity-0 lg:inline-block lg:max-w-none ${
            clockHovered
              ? "lg:opacity-100"
              : "lg:pointer-events-none lg:opacity-0"
          }`}
          style={{ color: "var(--page-text-muted)" }}
        >
          scroll to change time
        </span>
      </div>
      {dayTheme.showLocalTime && (
        <div className="mt-1">
          <a
            href={dayTheme.localClockHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-wrap items-baseline gap-x-2 no-underline transition-opacity hover:opacity-90"
            style={{ color: "var(--page-text)" }}
          >
            <span
              className="w-[3.2rem] shrink-0"
              style={{ color: "var(--page-text-soft)" }}
            >
              {dayTheme.localLabel}
            </span>
            <span>{localText}</span>
          </a>
        </div>
      )}
    </div>
  );
}