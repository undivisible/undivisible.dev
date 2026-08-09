"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { hoverNames } from "@/components/info/constants";
import { GITHUB_ACTIVITY } from "@/data/github-activity";
import {
  COUNTRIES_IN_A_YEAR,
  IDENTITY,
  LAB_LINKS,
  PLACES,
  WEBRING,
} from "@/data/lab-facts";
import {
  librariesFromReadme,
  mainProjectsFromReadme,
  miniappsFromReadme,
  utilitiesFromReadme,
} from "@/data/readme-projects.generated";
import { useHydrated } from "@/hooks/use-hydrated";
import { useLiveGithub } from "@/hooks/use-live-github";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { organiseProjects } from "@/lib/organise-projects";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

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

const numberFormat = new Intl.NumberFormat("en-US");

/** Footnote marks for the route line, in order of appearance. */
const MARKS = ["¹", "²", "³"] as const;

/** Day of year, for the per-day and per-week hover readings. */
function dayOfYear(): number {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 1);
  return Math.max(1, Math.floor((now.getTime() - start) / 86_400_000) + 1);
}

/**
 * Bare typography on the sky, now with the interactions where the eye lands:
 * the name cycles aliases under the cursor, the day dial explains itself and
 * drags, the figures carry a second reading on hover, and one cursor-tooltip
 * serves project blurbs, route stories and link handles.
 */
export default function LabAlmanac() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const hydrated = useHydrated();
  const { track } = useLastFmVisualData();
  const github = useLiveGithub();

  const categories = useMemo(
    () =>
      organiseProjects([
        ...mainProjectsFromReadme,
        ...utilitiesFromReadme,
        ...miniappsFromReadme,
        ...librariesFromReadme,
      ]),
    [],
  );

  // ── the sun does the lighting ──────────────────────────────────
  const sun = dayTheme.shader.sunProgress;
  const day = dayTheme.shader.daylightStrength;
  const dayFlat = 1 - Math.pow(1 - day, 3);
  const shadowStyle = {
    "--sun-x": `${((sun - 0.5) * -40).toFixed(1)}px`,
    "--sun-y": `${(5 + (1 - dayFlat) * 10).toFixed(1)}px`,
    "--ink-a": (0.08 + dayFlat * 0.5).toFixed(3),
  } as CSSProperties;

  const minute = hydrated ? hongKongMinute(dayTheme.displayedDate) : 0;
  const sunLeft = (minute / MINUTES_IN_DAY) * 100;
  const moonLeft = (((minute + 720) % MINUTES_IN_DAY) / MINUTES_IN_DAY) * 100;

  // ── the day dial: wheel, drag, and a cursor time readout ───────
  const dialRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [dialCursor, setDialCursor] = useState<number | null>(null);

  useEffect(() => {
    const dial = dialRef.current;
    if (!dial) return;
    dial.addEventListener("wheel", dayTheme.onClockWheel, { passive: false });
    return () => dial.removeEventListener("wheel", dayTheme.onClockWheel);
  }, [dayTheme.onClockWheel]);

  const minuteAtPointer = useCallback((clientX: number) => {
    const dial = dialRef.current;
    if (!dial) return 0;
    const rect = dial.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return ratio * (MINUTES_IN_DAY - 1);
  }, []);

  // ── the name cycles aliases under the cursor, like the live site ──
  const [alias, setAlias] = useState<string | null>(null);
  const [aliasVisible, setAliasVisible] = useState(true);
  const aliasTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAliases = useCallback(() => {
    if (aliasTimer.current) return;
    let index = 0;
    const swap = () => {
      setAliasVisible(false);
      setTimeout(() => {
        setAlias(hoverNames[index % hoverNames.length] ?? null);
        setAliasVisible(true);
        index += 1;
      }, 220);
    };
    swap();
    aliasTimer.current = setInterval(swap, 1600);
  }, []);

  const stopAliases = useCallback(() => {
    if (aliasTimer.current) {
      clearInterval(aliasTimer.current);
      aliasTimer.current = null;
    }
    setAliasVisible(false);
    setTimeout(() => {
      setAlias(null);
      setAliasVisible(true);
    }, 220);
  }, []);

  useEffect(
    () => () => {
      if (aliasTimer.current) clearInterval(aliasTimer.current);
    },
    [],
  );

  // ── one tooltip that follows the cursor, fed by data-tip ───────
  const [tip, setTip] = useState<string | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const onTipMove = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    const target = (event.target as HTMLElement).closest?.("[data-tip]");
    const text = target?.getAttribute("data-tip") || null;
    setTip(text);
    const node = tipRef.current;
    if (node && text) {
      const flip = event.clientX > window.innerWidth - 360;
      node.style.transform = `translate(${event.clientX + (flip ? -16 : 16)}px, ${
        event.clientY + 18
      }px) translateX(${flip ? "-100%" : "0"})`;
    }
  }, []);

  const doy = dayOfYear();
  const perDay = Math.round(github.commitsThisYear / doy);
  const perWeek = Math.round((github.prsThisYear / doy) * 7);
  const mergedShare =
    github.prsTotal > 0
      ? Math.round((github.merged / github.prsTotal) * 100)
      : null;

  const figures: Array<{
    value: string;
    label: string;
    detail: string;
  }> = [
    {
      value: numberFormat.format(github.prsThisYear),
      label: "pull requests",
      detail: `≈ ${perWeek} a week`,
    },
    {
      value: numberFormat.format(github.merged),
      label: "merged",
      detail:
        mergedShare === null ? "all time" : `${mergedShare}% of all of them`,
    },
    {
      value: numberFormat.format(github.commitsThisYear),
      label: "commits",
      detail: `≈ ${perDay} a day`,
    },
    {
      value: String(github.repos),
      label: "repositories",
      detail: "69 mine · 22 tsc.hk",
    },
  ];

  // Route as one line; only three notes earn a footnote.
  const footnoted = PLACES.filter(
    (place) => place.code === "HKG" || place.code === "USA" || place.next,
  );

  return (
    <div
      className="lab-root lab-min"
      style={shadowStyle}
      onMouseMove={onTipMove}
      onMouseLeave={() => setTip(null)}
    >
      <LabBackground dayTheme={dayTheme} />

      <div ref={tipRef} className={`min-tip ${tip ? "is-on" : ""}`} aria-hidden>
        {tip}
      </div>

      <main className="min-frame">
        <header className="min-top">
          <LabClock
            dayTheme={dayTheme}
            location={now.location}
            status={now.status}
          />
          <p className="min-meta">
            22.3193°N 114.1694°E
            <br />
            undivisible.dev · 格物致知
          </p>
          {track ? (
            <a
              className="min-playing"
              href={track.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-tip={
                track.isNowPlaying
                  ? "playing now, via last.fm"
                  : "last played, via last.fm"
              }
            >
              ♪ {track.track} — {track.artist}
            </a>
          ) : null}
        </header>

        {/* ── hero ── */}
        <section className="min-hero">
          <h1
            className="min-name-hero"
            onMouseEnter={startAliases}
            onMouseLeave={stopAliases}
          >
            <span
              className="min-name-word"
              style={{ opacity: aliasVisible ? 1 : 0 }}
            >
              {alias ?? IDENTITY.name}
            </span>{" "}
            <span className="min-hanzi">{IDENTITY.hanzi}</span>
          </h1>
          <p className="min-tagline">
            <GhostTagline suffixClassName="min-suffix" />
          </p>
          <p className="min-role">
            {IDENTITY.role} at {IDENTITY.org}.
          </p>
        </section>

        {/* ── the day dial ── */}
        <section className="min-dial-wrap">
          <div className="min-dial-head">
            <h2 className="min-label">
              <i className="min-idx">00</i> time control — hong kong
            </h2>
            <span className="min-dial-time" suppressHydrationWarning>
              {hydrated ? clockLabel(minute) : "--:--"}
              {dayTheme.isScrubbing ? " · scrubbed" : ""}
            </span>
          </div>
          <div
            ref={dialRef}
            className="min-dial"
            role="slider"
            tabIndex={0}
            aria-label="Time of day in Hong Kong"
            aria-valuemin={0}
            aria-valuemax={MINUTES_IN_DAY - 1}
            aria-valuenow={Math.floor(minute)}
            aria-valuetext={`${clockLabel(minute)} in Hong Kong`}
            onPointerDown={(event) => {
              draggingRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              dayTheme.scrubToMinute(minuteAtPointer(event.clientX));
            }}
            onPointerMove={(event) => {
              setDialCursor(minuteAtPointer(event.clientX));
              if (draggingRef.current) {
                dayTheme.scrubToMinute(minuteAtPointer(event.clientX));
              }
            }}
            onPointerUp={() => {
              draggingRef.current = false;
            }}
            onMouseLeave={() => {
              draggingRef.current = false;
              setDialCursor(null);
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
            <div className="min-dial-track" aria-hidden />
            <div className="min-dial-hours" aria-hidden>
              {Array.from({ length: 25 }, (_, index) => (
                <i
                  key={index}
                  data-major={index % 6 === 0 ? "true" : undefined}
                />
              ))}
            </div>
            <div className="min-dial-labels" aria-hidden>
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>24</span>
            </div>
            {dialCursor !== null ? (
              <span
                className="min-dial-ghost"
                aria-hidden
                style={{ left: `${(dialCursor / MINUTES_IN_DAY) * 100}%` }}
              >
                {clockLabel(dialCursor)}
              </span>
            ) : null}
            <span
              className="min-needle"
              aria-hidden
              style={{ left: `${sunLeft}%`, opacity: hydrated ? 1 : 0 }}
            />
            <span
              className="min-sun"
              aria-hidden
              style={{
                left: `${sunLeft}%`,
                opacity: hydrated ? 0.4 + dayFlat * 0.6 : 0,
              }}
            />
            <span
              className="min-moon"
              aria-hidden
              style={{
                left: `${moonLeft}%`,
                opacity: hydrated ? 0.15 + (1 - dayFlat) * 0.55 : 0,
              }}
            />
          </div>
          <p className="min-dial-cap">
            drag the sun. the sky, the colours and the shadows follow it; let go
            and it comes back to now.
          </p>
        </section>

        {/* ── 2026, live from the github api ── */}
        <section className="min-row">
          <h2 className="min-label">
            <i className="min-idx">01</i> 2026
            {github.live ? <i className="min-live" title="live" /> : null}
          </h2>
          <div className="min-body">
            <div className="min-figures">
              {figures.map((figure) => (
                <div className="min-figure" key={figure.label} tabIndex={0}>
                  <b>{figure.value}</b>
                  <span className="min-figure-label">
                    <span>{figure.label}</span>
                    <span className="min-figure-detail">{figure.detail}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="min-note">
              {github.omiThisMonth} prs on{" "}
              <a
                href={GITHUB_ACTIVITY.allPrsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {GITHUB_ACTIVITY.repo}
              </a>{" "}
              this month
              {github.lastMerged ? (
                <>
                  {" "}
                  · last merged:{" "}
                  <a
                    href={github.lastMerged.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {github.lastMerged.title}
                  </a>
                </>
              ) : null}
            </p>
          </div>
        </section>

        {/* ── works: hover a name for what it is ── */}
        <section className="min-row">
          <h2 className="min-label">
            <i className="min-idx">02</i> works
          </h2>
          <div className="min-body">
            <dl className="min-index">
              {categories.map((category) => (
                <div key={category.key}>
                  <dt data-tip={category.blurb}>{category.label}</dt>
                  <dd>
                    {category.items.map((project, index) => (
                      <span key={project.name}>
                        {index > 0 ? " · " : null}
                        {project.href && project.href !== "#" ? (
                          <a
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-tip={project.desc || undefined}
                          >
                            {project.name}
                          </a>
                        ) : (
                          <span data-tip={project.desc || undefined}>
                            {project.name}
                          </span>
                        )}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── route ── */}
        <section className="min-row">
          <h2 className="min-label">
            <i className="min-idx">03</i> route
          </h2>
          <div className="min-body">
            <p className="min-route">
              {PLACES.map((place, index) => {
                const markIndex = footnoted.indexOf(place);
                const tipText = place.note
                  ? `${place.name} — ${place.note}`
                  : place.name;
                return (
                  <span key={place.code}>
                    {index > 0 ? <i className="min-route-arrow"> → </i> : null}
                    <span
                      className="min-route-code"
                      data-run={place.run ? "true" : undefined}
                      data-next={place.next ? "true" : undefined}
                      data-tip={tipText}
                    >
                      {place.code}
                      {markIndex >= 0 ? <sup>{MARKS[markIndex]}</sup> : null}
                    </span>
                  </span>
                );
              })}
            </p>
            <p className="min-note">
              {COUNTRIES_IN_A_YEAR} of these in one year, at sixteen.
              <br />¹ first &nbsp; ² two hours in secondary inspection &nbsp; ³
              next
            </p>
          </div>
        </section>

        {/* ── before seventeen ── */}
        <section className="min-row">
          <h2 className="min-label">
            <i className="min-idx">04</i> before 17
          </h2>
          <div className="min-body">
            <p className="min-lines">
              a full-time job paying 100k+ a year.
              <br />
              first computer at six. first software at eight.
              <br />
              left school at seventeen. founded{" "}
              <a
                href="https://tsc.hk"
                target="_blank"
                rel="noopener noreferrer"
                data-tip="the semitechnological company — 22 repos: a compiler, two operating systems, a browser engine, a linux distro, two web frameworks"
              >
                tsc.hk
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── ticker: the last merged, on a loop ── */}
        <div className="min-ticker" aria-hidden>
          <div className="min-ticker-track">
            {[
              ...GITHUB_ACTIVITY.recentMerged,
              ...GITHUB_ACTIVITY.recentMerged,
            ].map((pr, index) => (
              <span key={`${pr.number}-${index}`}>
                merged {pr.mergedAt.slice(5)} · {pr.title}
                <b> #{pr.number} /// </b>
              </span>
            ))}
          </div>
        </div>

        {/* ── foot ── */}
        <footer className="min-foot">
          <nav className="min-links">
            <a
              href={WEBRING.prev}
              target="_blank"
              rel="noopener"
              data-tip="webring"
            >
              ←
            </a>
            {LAB_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                data-tip={link.handle}
              >
                {link.name}
              </a>
            ))}
            <a
              href={WEBRING.next}
              target="_blank"
              rel="noopener"
              data-tip="webring"
            >
              →
            </a>
          </nav>
          <p className="min-colophon">
            <Link href="/">current site</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
