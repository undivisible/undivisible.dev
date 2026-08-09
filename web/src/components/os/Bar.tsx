"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useWeatherForecast } from "@/hooks/use-weather-forecast";
import { OS_APPS, type OsApp } from "@/lib/os/apps";
import type { OsState, OsWindow } from "@/lib/os/use-os-state";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";

type Result = {
  key: string;
  title: string;
  subtitle: string;
  run: () => void;
};

const HK_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Hong_Kong",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const HK_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Hong_Kong",
  weekday: "short",
  day: "2-digit",
  month: "short",
});

function fuzzy(needle: string, haystack: string): boolean {
  let i = 0;
  const lower = haystack.toLowerCase();
  for (const ch of needle.toLowerCase()) {
    i = lower.indexOf(ch, i);
    if (i === -1) return false;
    i += 1;
  }
  return true;
}

/** `bc` at home. Good enough for the launcher's calculator line. */
function calculate(expr: string): string | null {
  if (!/^[\d\s+\-*/().%^]+$/.test(expr) || !/\d/.test(expr)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const value = new Function(`"use strict";return (${expr.replace(/\^/g, "**")})`)();
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return String(Math.round(value * 1e9) / 1e9);
  } catch {
    return null;
  }
}

/**
 * The bar. On the real alpenglowed this is the whole desktop: status pills
 * on top, one `> ` prompt underneath that is launcher, calculator and shell
 * at once. Super+Space (or ctrl/cmd+k, or `/`) summons it; Esc dismisses.
 */
export function Bar({
  os,
  dayTheme,
  onTerminalCommand,
}: {
  os: OsState;
  dayTheme: HongKongDayTheme;
  onTerminalCommand: (line: string) => void;
}) {
  const hydrated = useHydrated();
  const weather = useWeatherForecast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [battery, setBattery] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // The battery pill is real where the API is (chromium), absent elsewhere.
    type BatteryManager = { level: number; addEventListener: (t: string, f: () => void) => void };
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    void nav.getBattery?.().then((manager) => {
      const update = () => setBattery(Math.round(manager.level * 100));
      update();
      manager.addEventListener("levelchange", update);
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const inField = /input|textarea|select/i.test(
        (event.target as HTMLElement)?.tagName ?? "",
      );
      if (
        (event.key === " " && event.metaKey) ||
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !inField)
      ) {
        event.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo<Result[]>(() => {
    const trimmed = query.trim();
    const out: Result[] = [];

    const math = calculate(trimmed);
    if (math !== null)
      out.push({
        key: "calc",
        title: `= ${math}`,
        subtitle: "calculator",
        run: () => {},
      });

    if (trimmed.startsWith(">")) {
      const line = trimmed.slice(1).trim();
      out.push({
        key: "shell",
        title: line ? `run ${line}` : "run …",
        subtitle: "alpenglow sh",
        run: () => {
          os.open("terminal");
          if (line) onTerminalCommand(line);
        },
      });
      return out;
    }

    // Apps and desktop actions rank together: an exact or prefix hit on the
    // title beats a scattered fuzzy hit, so "tile" finds the mode toggle
    // before it finds "timeline" hiding inside before-17's keywords.
    type Candidate = Result & { haystacks: string[] };
    const candidates: Candidate[] = [
      ...OS_APPS.map((app: OsApp) => ({
        key: app.id,
        title: app.title,
        subtitle: app.subtitle,
        haystacks: [app.title, app.subtitle, ...(app.keywords ?? [])],
        run: () => os.open(app.id),
      })),
      {
        key: "mode",
        title: `${os.mode === "floating" ? "tile" : "float"} the windows`,
        subtitle: "window mode",
        haystacks: ["tile", "float", "mode", "windows"],
        run: os.cycleMode,
      },
      {
        key: "close-all",
        title: "close everything",
        subtitle: "window manager",
        haystacks: ["close", "quit"],
        run: os.closeAll,
      },
    ];
    const score = (candidate: Candidate): number => {
      if (!trimmed) return 2;
      const needle = trimmed.toLowerCase();
      if (candidate.haystacks.some((hay) => hay.toLowerCase().startsWith(needle)))
        return 0;
      if (
        candidate.haystacks.some((hay) =>
          hay.toLowerCase().split(/\s+/).some((word) => word.startsWith(needle)),
        )
      )
        return 1;
      return 2;
    };
    out.push(
      ...candidates
        .filter(
          (candidate) =>
            !trimmed ||
            candidate.haystacks.some((hay) => fuzzy(trimmed, hay)),
        )
        .sort((a, b) => score(a) - score(b))
        .slice(0, 10)
        .map(({ haystacks: _hay, ...result }) => result),
    );
    return out;
  }, [query, os, onTerminalCommand]);

  useEffect(() => setSelected(0), [query]);

  const minimized = os.windows.filter((win: OsWindow) => win.minimized);

  return (
    <div className={`os-bar ${open ? "is-open" : ""}`}>
      <div className="os-pills">
        <span className="os-pill">
          {hydrated ? HK_TIME.format(now) : "--:--:--"}
          <i>hkg</i>
        </span>
        <span className="os-pill os-pill-date">
          {hydrated ? HK_DATE.format(now).toLowerCase() : "--"}
        </span>
        <span className="os-pill">
          {hydrated ? dayTheme.weatherDisplay.toLowerCase() : "--"}
        </span>
        {weather.forecast ? (
          <span className="os-pill os-pill-wx">
            ↑{Math.round(weather.forecast.highC)}° ↓
            {Math.round(weather.forecast.lowC)}°
          </span>
        ) : null}
        {battery !== null ? (
          <span className="os-pill">
            bat {battery}%<i>{battery > 20 ? "" : "!"}</i>
          </span>
        ) : null}
        <span className="os-pill os-pill-mode">
          <button type="button" onClick={os.cycleMode} title="cycle window mode">
            {os.mode}
          </button>
        </span>
        {minimized.map((win: OsWindow) => (
          <span key={win.key} className="os-pill os-pill-min">
            <button type="button" onClick={() => os.focus(win.key)}>
              {win.app.title}
            </button>
          </span>
        ))}
      </div>

      <div className="os-prompt-row">
        <button
          type="button"
          className="os-prompt"
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <b>&gt;</b>
          {open ? (
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSelected((index) => Math.min(index + 1, results.length - 1));
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setSelected((index) => Math.max(index - 1, 0));
                }
                if (event.key === "Enter") {
                  results[selected]?.run();
                  setQuery("");
                  setOpen(false);
                }
              }}
              placeholder="type to launch · maths to calculate · > for the shell"
              aria-label="launcher"
              spellCheck={false}
            />
          ) : (
            <span className="os-prompt-hint">
              super+space · ctrl+k · or just press /
            </span>
          )}
        </button>
      </div>

      {open ? (
        <div className="os-results" role="listbox">
          {results.map((result, index) => (
            <button
              key={result.key}
              type="button"
              role="option"
              aria-selected={index === selected}
              data-on={index === selected || undefined}
              onMouseEnter={() => setSelected(index)}
              onClick={() => {
                result.run();
                setQuery("");
                setOpen(false);
              }}
            >
              <b>&gt;</b>
              <span>{result.title}</span>
              <i>{result.subtitle}</i>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
