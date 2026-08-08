"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { LabSwitch } from "@/components/lab/LabSwitch";
import { Ref } from "@/components/lab/Ref";
import { copyForHour, IDENTITY, LAB_LINKS, OMI } from "@/data/lab-facts";
import { useHydrated } from "@/hooks/use-hydrated";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

const MINUTES_IN_DAY = 1440;

const TABS = ["now", "work", "before 17", "links"] as const;
type Tab = (typeof TABS)[number];

type Gauge = { label: string; value: string; fill: number; ref?: string };

const GAUGES: Record<Tab, Gauge[]> = {
  now: [
    { label: "pull requests", value: String(OMI.pullRequests), fill: 1 },
    { label: "merged", value: String(OMI.merged), fill: 0.42 },
    { label: "commits", value: String(OMI.commits), fill: 0.78 },
    { label: "countries · one year", value: "7", fill: 1 },
    { label: "at seventeen", value: "100k+", fill: 1 },
    { label: "shipping since", value: "age 8", fill: 1 },
  ],
  work: [
    {
      label: "inauguration · compiler",
      value: "40 langs",
      fill: 1,
      ref: "inauguration",
    },
    {
      label: "space · operating system",
      value: "no POSIX",
      fill: 0.6,
      ref: "space",
    },
    {
      label: "crepuscularity · framework",
      value: "6 targets",
      fill: 1,
      ref: "crepuscularity",
    },
    {
      label: "rv8 · browser engine",
      value: "servo + v8",
      fill: 0.5,
      ref: "rv8",
    },
    {
      label: "alpenglow · linux",
      value: "diskless",
      fill: 0.7,
      ref: "alpenglow",
    },
    { label: "crate downloads", value: "24k+", fill: 1 },
  ],
  "before 17": [
    { label: "first computer", value: "age 6", fill: 0.35 },
    { label: "first software", value: "age 8", fill: 0.47 },
    { label: "exploit labs", value: "age 10", fill: 0.59 },
    { label: "countries, alone", value: "7", fill: 1 },
    { label: "six figures", value: "age 16", fill: 0.94 },
    { label: "left school", value: "age 17", fill: 1 },
  ],
  links: LAB_LINKS.map((link) => ({
    label: link.name,
    value: link.handle,
    fill: 1,
  })),
};

/**
 * C · Signal. The time scrubber is the site rather than a garnish: drag the
 * band and the sky moves, and so does the sentence, because the page says what
 * I am doing at that hour. Nothing scrolls; the panels swap in place.
 */
export default function LabSignal() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const [tab, setTab] = useState<Tab>("now");
  const [minute, setMinute] = useState<number | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  const hydrated = useHydrated();
  const liveMinute =
    ((dayTheme.displayedDate.getTime() +
      now.location.utcOffsetMinutes * 60_000) /
      60_000) %
    MINUTES_IN_DAY;
  const shown = minute ?? liveMinute;
  const hour = Math.floor(shown / 60);
  const clock = hydrated
    ? `${String(hour).padStart(2, "0")}:${String(Math.floor(shown % 60)).padStart(2, "0")}`
    : "--:--";

  const fromPointer = useCallback((clientX: number) => {
    const band = bandRef.current;
    if (!band) return;
    const rect = band.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    setMinute(ratio * (MINUTES_IN_DAY - 1));
  }, []);

  const dragging = useRef(false);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (dragging.current) fromPointer(event.clientX);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [fromPointer]);

  return (
    <div className="lab-root lab-signal" style={dayTheme.style}>
      <LabBackground dayTheme={dayTheme} />

      <main className="lab-signal-main">
        <header className="lab-signal-top">
          <LabClock
            dayTheme={dayTheme}
            location={now.location}
            status={now.status}
          />
          <p className="lab-signal-id">
            <b>
              {IDENTITY.name} · {IDENTITY.hanzi}
            </b>
            <br />
            {IDENTITY.role} · <Ref slug="omi">{IDENTITY.org}</Ref>
          </p>
        </header>

        <div className="lab-signal-mid">
          <p className="lab-signal-hour">
            {clock}
            <small>{now.location.label}</small>
          </p>
          <p className="lab-signal-line">
            {hydrated ? copyForHour(hour) : "\u00a0"}
          </p>
          <p className="lab-signal-tag">
            <GhostTagline suffixClassName="lab-signal-suffix" />
          </p>
        </div>

        <div
          ref={bandRef}
          className="lab-band"
          role="slider"
          tabIndex={0}
          aria-label="Hour of day"
          aria-valuemin={0}
          aria-valuemax={MINUTES_IN_DAY - 1}
          aria-valuenow={Math.floor(shown)}
          aria-valuetext={`${clock} in ${now.location.label}`}
          onPointerDown={(event) => {
            dragging.current = true;
            fromPointer(event.clientX);
          }}
          onDoubleClick={() => setMinute(null)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 60 : 15;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              const delta = event.key === "ArrowRight" ? step : -step;
              setMinute(
                (((shown + delta) % MINUTES_IN_DAY) + MINUTES_IN_DAY) %
                  MINUTES_IN_DAY,
              );
            }
            if (event.key === "Escape") setMinute(null);
          }}
        >
          <div className="lab-band-ticks" aria-hidden>
            {Array.from({ length: 24 }, (_, index) => (
              <i
                key={index}
                data-major={index % 6 === 0 ? "true" : undefined}
              />
            ))}
          </div>
          <div
            className="lab-band-head"
            style={{
              left: `${(hydrated ? shown / MINUTES_IN_DAY : 0) * 100}%`,
            }}
            aria-hidden
          />
          <div className="lab-band-labels" aria-hidden>
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>24</span>
          </div>
        </div>
        <p className="lab-band-note">
          drag · the sky and the sentence follow
          {minute === null ? "" : " · double-click for live"}
        </p>

        <div className="lab-gauges">
          {GAUGES[tab].map((gauge) => (
            <div className="lab-gauge" key={gauge.label}>
              <p className="lab-gauge-key">
                {gauge.ref ? (
                  <Ref slug={gauge.ref}>{gauge.label}</Ref>
                ) : (
                  gauge.label
                )}
              </p>
              <p className="lab-gauge-value">{gauge.value}</p>
              <span className="lab-gauge-bar">
                <i style={{ width: `${gauge.fill * 100}%` }} />
              </span>
            </div>
          ))}
        </div>

        <div className="lab-signal-tabs" role="tablist">
          {TABS.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </main>

      <LabSwitch current="signal" />
    </div>
  );
}
