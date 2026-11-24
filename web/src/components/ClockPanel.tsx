"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatTimeForZone,
  isTravelClockZone,
  type HongKongDayTheme,
} from "@/lib/useHongKongDayTheme";
import type { NowContent } from "@/lib/parse-now-markdown";
import { StatusPreview } from "./StatusPreview";
import { WeatherPreview } from "./WeatherPreview";

export function ClockPanel({
  dayTheme,
  now,
  nowArticleOpen,
  onToggleNowArticle,
  hydrated,
  travelClocks = false,
  onTimeHoverChange,
}: {
  dayTheme: HongKongDayTheme;
  now: NowContent;
  nowArticleOpen: boolean;
  onToggleNowArticle?: () => void;
  hydrated: boolean;
  travelClocks?: boolean;
  onTimeHoverChange?: (hovered: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const [clockHovered, setClockHovered] = useState(false);

  useEffect(() => {
    const clock = clockRef.current;
    const panel = panelRef.current;
    if (!clock || !panel) return;
    const enter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      setClockHovered(true);
    };
    const leave = () => {
      setClockHovered(false);
      dayTheme.resetScrub();
    };
    const previewEnter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") onTimeHoverChange?.(true);
    };
    const previewLeave = () => onTimeHoverChange?.(false);
    clock.addEventListener("wheel", dayTheme.onClockWheel, { passive: false });
    clock.addEventListener("pointerenter", enter);
    clock.addEventListener("pointerleave", leave);
    panel.addEventListener("pointerenter", previewEnter);
    panel.addEventListener("pointerleave", previewLeave);
    return () => {
      clock.removeEventListener("wheel", dayTheme.onClockWheel);
      clock.removeEventListener("pointerenter", enter);
      clock.removeEventListener("pointerleave", leave);
      panel.removeEventListener("pointerenter", previewEnter);
      panel.removeEventListener("pointerleave", previewLeave);
    };
  }, [dayTheme.onClockWheel, dayTheme.resetScrub, onTimeHoverChange]);

  const weatherText =
    hydrated && dayTheme ? dayTheme.weatherDisplay : "KUL WEATHER LOADING";
  const hkgText = hydrated && dayTheme ? dayTheme.hkgTime : "--:--:--";
  const melText = hydrated && dayTheme ? dayTheme.melTime : "--:--:--";
  const localZone = hydrated
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";
  const localText = hydrated
    ? travelClocks
      ? formatTimeForZone(dayTheme.displayedDate, localZone)
      : dayTheme.localTime
    : "--:--:--";

  const statusInteractive = Boolean(now.article && onToggleNowArticle);
  const showStatus = Boolean(now.status);
  const statusActive = nowArticleOpen && statusInteractive;
  const translatedStatus = now.status === "格物致知" || now.status === "格致";

  const statusClass = statusActive
    ? "pointer-events-auto opacity-100 text-white"
    : `normal-case tracking-normal text-[9px] leading-snug sm:text-[10px] lg:transition-opacity lg:duration-300 lg:ease-out ${
        clockHovered || statusActive
          ? "lg:pointer-events-auto lg:opacity-100"
          : "max-lg:pointer-events-auto max-lg:opacity-100 lg:pointer-events-none lg:opacity-0"
      }`;

  return (
    <div
      ref={panelRef}
      className="w-fit shrink-0 text-[10px] uppercase tracking-[0.18em] [font-family:var(--font-jetbrains-mono),monospace] sm:text-[11px] sm:tracking-[0.22em]"
      style={{ color: "var(--page-text)" }}
    >
      <div className="mb-2">
        <WeatherPreview dayTheme={dayTheme} label={weatherText} />
      </div>
      <div ref={clockRef} data-time-scrubber="true">
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
              {travelClocks ? "HKG/KUL" : "HKG"}
            </span>
            <span>{hkgText}</span>
          </a>
          {showStatus ? (
            translatedStatus ? (
              <StatusPreview
                id="status-translation"
                title={now.status ?? ""}
                label={now.status ?? ""}
                className={statusClass}
              >
                <p lang="en">Investigate things to gain knowledge.</p>
                <p className="weather-note">
                  {now.status === "格致" ? "格致 is short for 格物致知. " : ""}A
                  classical Chinese idea: understanding grows from studying
                  things closely.
                </p>
                {statusInteractive && (
                  <button type="button" onClick={onToggleNowArticle}>
                    read update
                  </button>
                )}
              </StatusPreview>
            ) : statusInteractive ? (
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
        {travelClocks &&
          [
            {
              label: "NYC",
              zone: "America/New_York",
              href: "https://www.timeanddate.com/worldclock/usa/new-york",
            },
            {
              label: "TYO",
              zone: "Asia/Tokyo",
              href: "https://www.timeanddate.com/worldclock/japan/tokyo",
            },
          ].map(({ label, zone, href }) => (
            <div className="mt-1" key={zone}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-baseline gap-x-2 no-underline transition-opacity hover:opacity-90"
              >
                <span className="w-[3.2rem] shrink-0">{label}</span>
                <span>
                  {hydrated
                    ? formatTimeForZone(dayTheme.displayedDate, zone)
                    : "--:--:--"}
                </span>
              </a>
            </div>
          ))}
        {(travelClocks
          ? hydrated && !isTravelClockZone(localZone)
          : dayTheme.showLocalTime) && (
          <div className="mt-1">
            <a
              href={
                travelClocks
                  ? `https://www.timeanddate.com/worldclock/results.html?query=${encodeURIComponent(localZone)}`
                  : dayTheme.localClockHref
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-wrap items-baseline gap-x-2 no-underline transition-opacity hover:opacity-90"
              style={{ color: "var(--page-text)" }}
            >
              <span
                className="w-[3.2rem] shrink-0"
                style={{ color: "var(--page-text-soft)" }}
              >
                {travelClocks ? "LOCAL" : dayTheme.localLabel}
              </span>
              <span>{localText}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
