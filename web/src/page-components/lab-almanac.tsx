"use client";

import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
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

const numberFormat = new Intl.NumberFormat("en-US");

/** Footnote marks for the route line, in order of appearance. */
const MARKS = ["¹", "²", "³"] as const;

/**
 * Bare typography on the sky. One display moment (the tagline), one thin
 * line where the sun lives, then four sparse rows separated by a lot of
 * nothing. No panels, no cards, no hover — hairlines and type.
 */
export default function LabAlmanac() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const hydrated = useHydrated();
  const { track } = useLastFmVisualData();

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

  // The sun does the lighting: shadow direction and depth follow it across
  // the day and vanish at night. Scrubbing the sun line sweeps them live.
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

  const lineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    line.addEventListener("wheel", dayTheme.onClockWheel, { passive: false });
    return () => line.removeEventListener("wheel", dayTheme.onClockWheel);
  }, [dayTheme.onClockWheel]);

  const { account, thisMonth, recentMerged } = GITHUB_ACTIVITY;
  const lastMerged = recentMerged[0];

  // Route as one line; only three notes earn a footnote.
  const footnoted = PLACES.filter(
    (place) => place.code === "HKG" || place.code === "USA" || place.next,
  );

  return (
    <div className="lab-root lab-min" style={shadowStyle}>
      <LabBackground dayTheme={dayTheme} />

      <main className="min-frame">
        <header className="min-top">
          <LabClock
            dayTheme={dayTheme}
            location={now.location}
            status={now.status}
          />
          <p className="min-name">
            {IDENTITY.name} · {IDENTITY.hanzi}
          </p>
        </header>

        {/* ── hero: the tagline and nothing else ── */}
        <section className="min-hero">
          <h1 className="min-tagline">
            <GhostTagline block suffixClassName="min-suffix" />
          </h1>
          <p className="min-role">
            {IDENTITY.role}, {IDENTITY.org}.
          </p>
        </section>

        {/* ── the sun, on one line ── */}
        <div
          ref={lineRef}
          className="min-sunline"
          data-time-scrubber="true"
          onMouseLeave={dayTheme.resetScrub}
          aria-label="Time of day in Hong Kong — scroll to scrub"
        >
          <span
            className="min-sun"
            aria-hidden
            style={{
              left: `${sunLeft}%`,
              opacity: hydrated ? 0.35 + dayFlat * 0.65 : 0,
            }}
          />
          <span
            className="min-moon"
            aria-hidden
            style={{
              left: `${moonLeft}%`,
              opacity: hydrated ? 0.15 + (1 - dayFlat) * 0.5 : 0,
            }}
          />
          <span className="min-sunline-hint">scroll — the sky follows</span>
        </div>

        {/* ── 2026, in numbers ── */}
        <section className="min-row">
          <h2 className="min-label">2026</h2>
          <div className="min-body">
            <div className="min-figures">
              <div>
                <b>{numberFormat.format(account.pullRequestsThisYear)}</b>
                <span>pull requests</span>
              </div>
              <div>
                <b>{numberFormat.format(account.merged)}</b>
                <span>merged</span>
              </div>
              <div>
                <b>{numberFormat.format(account.commitsThisYear)}</b>
                <span>commits</span>
              </div>
              <div>
                <b>{account.repos}</b>
                <span>repositories</span>
              </div>
            </div>
            <p className="min-note">
              lately{" "}
              <a
                href={GITHUB_ACTIVITY.allPrsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {GITHUB_ACTIVITY.repo}
              </a>
              {" — "}
              {thisMonth.pullRequests} pull requests this month. last merged:{" "}
              {lastMerged ? (
                <a
                  href={`https://github.com/${GITHUB_ACTIVITY.repo}/pull/${lastMerged.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {lastMerged.title}
                </a>
              ) : null}
            </p>
          </div>
        </section>

        {/* ── works: an index, not a catalogue ── */}
        <section className="min-row">
          <h2 className="min-label">works</h2>
          <div className="min-body">
            <dl className="min-index">
              {categories.map((category) => (
                <div key={category.key}>
                  <dt>{category.label}</dt>
                  <dd>
                    {category.items.map((project, index) => (
                      <span key={project.name}>
                        {index > 0 ? " · " : null}
                        {project.href && project.href !== "#" ? (
                          <a
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {project.name}
                          </a>
                        ) : (
                          project.name
                        )}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── route: one line, three footnotes ── */}
        <section className="min-row">
          <h2 className="min-label">route</h2>
          <div className="min-body">
            <p className="min-route">
              {PLACES.map((place, index) => {
                const markIndex = footnoted.indexOf(place);
                return (
                  <span key={place.code}>
                    {index > 0 ? <i className="min-route-arrow"> → </i> : null}
                    <span
                      className="min-route-code"
                      data-run={place.run ? "true" : undefined}
                      data-next={place.next ? "true" : undefined}
                    >
                      {place.code}
                      {markIndex >= 0 ? <sup>{MARKS[markIndex]}</sup> : null}
                    </span>
                  </span>
                );
              })}
            </p>
            <p className="min-note">
              {COUNTRIES_IN_A_YEAR} of these in one year, at sixteen, alone.
              <br />¹ first, and family &nbsp; ² secondary inspection, two hours
              — they didn't believe my age &nbsp; ³ booked
            </p>
          </div>
        </section>

        {/* ── before seventeen ── */}
        <section className="min-row">
          <h2 className="min-label">before 17</h2>
          <div className="min-body">
            <p className="min-lines">
              a full-time job paying 100k+ a year — someone else had to sign it.
              <br />
              first computer at six. first software at eight.
              <br />
              left school at seventeen. founded{" "}
              <a
                href="https://tsc.hk"
                target="_blank"
                rel="noopener noreferrer"
              >
                tsc.hk
              </a>{" "}
              — still open.
            </p>
          </div>
        </section>

        {/* ── foot ── */}
        <footer className="min-foot">
          <nav className="min-links">
            <a href={WEBRING.prev} target="_blank" rel="noopener">
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
              >
                {link.name}
              </a>
            ))}
            <a href={WEBRING.next} target="_blank" rel="noopener">
              →
            </a>
          </nav>
          <p className="min-colophon">
            {track ? (
              <a
                href={track.trackUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                ♪ {track.track} — {track.artist}
              </a>
            ) : (
              <span>
                the field behind this page is whatever i'm listening to
              </span>
            )}
            {" · "}
            <Link href="/">current site</Link>
            {" · 格物致知"}
          </p>
        </footer>
      </main>
    </div>
  );
}
