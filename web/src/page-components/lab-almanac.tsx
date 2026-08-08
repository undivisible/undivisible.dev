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
  EARLY_FACTS,
  IDENTITY,
  LAB_LINKS,
  OMI_ROLE,
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

/**
 * The site as a daily almanac: sun, weather, what's playing, what shipped,
 * where I am, where I've been. Everything is visible without hovering, and
 * the sun that colours the sky also casts the shadows on the page — scrub
 * the clock and watch them swing.
 */
export default function LabAlmanac() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const hydrated = useHydrated();
  const { track, colors, ready } = useLastFmVisualData();

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
  const projectTotal = categories.reduce(
    (count, category) => count + category.items.length,
    0,
  );

  // ── the sun does the lighting ────────────────────────────────────
  // Shadow direction follows the sun across the day: morning sun throws
  // shadows left, evening sun throws them right, noon pulls them short.
  // At night they fade to almost nothing. Scrubbing time sweeps them live.
  const sun = dayTheme.shader.sunProgress;
  const day = dayTheme.shader.daylightStrength;
  const dayFlat = 1 - Math.pow(1 - day, 3);
  const shadowStyle = {
    "--sun-x": `${((sun - 0.5) * -44).toFixed(1)}px`,
    "--sun-y": `${(6 + (1 - dayFlat) * 12).toFixed(1)}px`,
    "--shade-a": (0.06 + dayFlat * 0.5).toFixed(3),
    "--ink-a": (0.1 + dayFlat * 0.55).toFixed(3),
  } as CSSProperties;

  const minute = hydrated ? hongKongMinute(dayTheme.displayedDate) : 0;
  const sunLeft = (minute / MINUTES_IN_DAY) * 100;
  const moonLeft = (((minute + 720) % MINUTES_IN_DAY) / MINUTES_IN_DAY) * 100;

  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.addEventListener("wheel", dayTheme.onClockWheel, { passive: false });
    return () => strip.removeEventListener("wheel", dayTheme.onClockWheel);
  }, [dayTheme.onClockWheel]);

  const activity = GITHUB_ACTIVITY;
  const paletteDots = ready && track ? colors.slice(0, 5) : [];

  return (
    <div className="lab-root lab-almanac" style={shadowStyle}>
      <LabBackground dayTheme={dayTheme} />

      <main className="lab-alm-frame">
        {/* ── masthead ── */}
        <header className="lab-alm-mast">
          <LabClock
            dayTheme={dayTheme}
            location={now.location}
            status={now.status}
          />
          <div className="lab-alm-mast-mid">
            <p className="lab-alm-word">almanac</p>
            <p className="lab-alm-date" suppressHydrationWarning>
              {hydrated
                ? new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Asia/Hong_Kong",
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(dayTheme.displayedDate)
                : " "}
            </p>
          </div>
          <div className="lab-alm-mast-right">
            <p className="lab-alm-name">
              {IDENTITY.name}
              <br />
              <span>{IDENTITY.hanzi}</span>
            </p>
            {track ? (
              <a
                className="lab-alm-playing"
                href={track.trackUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="lab-alm-playing-dots" aria-hidden>
                  {paletteDots.map((color, index) => (
                    <i key={index} style={{ background: color }} />
                  ))}
                </span>
                {track.isNowPlaying ? "playing" : "last played"} · {track.track}{" "}
                — {track.artist}
              </a>
            ) : (
              <p className="lab-alm-playing lab-alm-playing-idle">
                the field behind this page is whatever i'm listening to
              </p>
            )}
          </div>
        </header>

        {/* ── ephemeris: the day, with the sun on it ── */}
        <div
          ref={stripRef}
          className="lab-alm-ephemeris"
          data-time-scrubber="true"
          onMouseLeave={dayTheme.resetScrub}
          aria-label="Time of day in Hong Kong — scroll to scrub"
        >
          <div className="lab-alm-eph-ticks" aria-hidden>
            {Array.from({ length: 24 }, (_, index) => (
              <i
                key={index}
                data-major={index % 6 === 0 ? "true" : undefined}
              />
            ))}
          </div>
          <span
            className="lab-alm-sun"
            aria-hidden
            style={{
              left: `${sunLeft}%`,
              bottom: `${18 + dayFlat * 46}%`,
              opacity: hydrated ? 0.35 + dayFlat * 0.65 : 0,
            }}
          />
          <span
            className="lab-alm-moon"
            aria-hidden
            style={{
              left: `${moonLeft}%`,
              opacity: hydrated ? 0.2 + (1 - dayFlat) * 0.6 : 0,
            }}
          />
          <div className="lab-alm-eph-labels" aria-hidden>
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>24</span>
          </div>
          <p className="lab-alm-eph-hint">
            scroll here to move the sun — the sky and the shadows follow
          </p>
        </div>

        {/* ── hero ── */}
        <section className="lab-alm-hero">
          <h1 className="lab-alm-tagline">
            <GhostTagline block suffixClassName="lab-alm-suffix" />
          </h1>
          <p className="lab-alm-sub">
            {IDENTITY.role} at {IDENTITY.org} — {OMI_ROLE.line}
          </p>
        </section>

        {/* ── the log: real numbers, real PR titles ── */}
        <section className="lab-alm-panel lab-alm-log">
          <h2 className="lab-alm-h">
            log <span>· {activity.repo}</span>
          </h2>
          <div className="lab-alm-stats">
            <div>
              <b>{activity.total.pullRequests}</b>
              <span>pull requests since jul 20</span>
            </div>
            <div>
              <b>{activity.total.merged}</b>
              <span>merged</span>
            </div>
            <div>
              <b>{activity.total.commits}</b>
              <span>commits on main</span>
            </div>
            <div>
              <b>{activity.thisMonth.pullRequests}</b>
              <span>opened this month</span>
            </div>
          </div>
          <ol className="lab-alm-prs">
            {activity.recentMerged.map((pr) => (
              <li key={pr.number}>
                <a
                  href={`https://github.com/${activity.repo}/pull/${pr.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="lab-alm-pr-date">
                    {pr.mergedAt.slice(5)}
                  </span>
                  <span className="lab-alm-pr-title">{pr.title}</span>
                  <span className="lab-alm-pr-num">#{pr.number}</span>
                </a>
              </li>
            ))}
          </ol>
          <a
            className="lab-alm-more"
            href={activity.allPrsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            all {activity.total.pullRequests} →
          </a>
        </section>

        {/* ── works: every project, sorted by what it is ── */}
        <section className="lab-alm-panel">
          <h2 className="lab-alm-h">
            works <span>· {projectTotal} projects, sorted automatically</span>
          </h2>
          <div className="lab-alm-works">
            {categories.map((category) => (
              <div className="lab-alm-cat" key={category.key}>
                <h3>{category.label}</h3>
                <p className="lab-alm-cat-blurb">{category.blurb}</p>
                <p className="lab-alm-cat-names">
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
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── route ── */}
        <section className="lab-alm-panel">
          <h2 className="lab-alm-h">
            route{" "}
            <span>
              · {PLACES.filter((place) => !place.next).length} countries,{" "}
              {COUNTRIES_IN_A_YEAR} of them in one year at sixteen
            </span>
          </h2>
          <ol className="lab-alm-route">
            {PLACES.map((place) => (
              <li
                key={place.code}
                data-run={place.run ? "true" : undefined}
                data-next={place.next ? "true" : undefined}
              >
                <span className="lab-alm-route-code">{place.code}</span>
                <span className="lab-alm-route-name">{place.name}</span>
                <span className="lab-alm-route-note">{place.note}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── early years ── */}
        <section className="lab-alm-panel">
          <h2 className="lab-alm-h">before seventeen</h2>
          <div className="lab-alm-early">
            {EARLY_FACTS.map((fact) => (
              <div key={fact.title}>
                <h3>{fact.title}</h3>
                <p className="lab-alm-early-meta">{fact.meta}</p>
                <p className="lab-alm-early-detail">{fact.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── foot ── */}
        <footer className="lab-alm-foot">
          <nav className="lab-alm-links">
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
          <p className="lab-alm-built">
            built with{" "}
            <a
              href="https://github.com/tschk/crepuscularity"
              target="_blank"
              rel="noopener noreferrer"
            >
              crepuscularity
            </a>{" "}
            +{" "}
            <a
              href="https://github.com/tschk/moonshine"
              target="_blank"
              rel="noopener noreferrer"
            >
              moonshine
            </a>{" "}
            · <Link href="/">current site</Link> · 格物致知
          </p>
        </footer>
      </main>
    </div>
  );
}
