"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { LinkPills } from "@/components/lab/LinkPills";
import { LocalIntelligence } from "@/components/lab/LocalIntelligence";
import { Milestones } from "@/components/lab/Milestones";
import { NameCycle } from "@/components/lab/NameCycle";
import { Odometer } from "@/components/lab/Odometer";
import { RandomizedText } from "@/components/lab/RandomizedText";
import { REVEAL_EASE } from "@/components/info/constants";
import { GITHUB_ACTIVITY } from "@/data/github-activity";
import {
  COUNTRIES,
  COUNTRIES_IN_A_YEAR,
  HEADLINE_WORKS,
  IDENTITY,
  LAB_LINKS,
  OMI_ROLE,
  STOPS_THIS_YEAR,
  TSCHK,
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
import { useTimeArrival } from "@/hooks/use-time-arrival";
import { organiseProjects } from "@/lib/organise-projects";
import { fetchResumeMarkdownCached } from "@/lib/remote-markdown";
import { clearSitePrintTarget, printSitePdf } from "@/lib/site-print";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

const HomePrintRoot = dynamic(
  () =>
    import("@/components/home/print/HomePrintRoot").then((m) => m.HomePrintRoot),
  { ssr: false },
);

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

function dayOfYear(): number {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 1);
  return Math.max(1, Math.floor((now.getTime() - start) / 86_400_000) + 1);
}

/** The reveal the live site uses on every section. */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: REVEAL_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The redesign, in the site's existing language: light display type, mono
 * eyebrows, hairlines and glass at the weights the live site already uses,
 * and scroll reveals on the same easing. The first screen keeps its best
 * habit — clock at the top, content at the bottom, sky owning the middle.
 */
export default function LabAlmanac() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const hydrated = useHydrated();
  const { track } = useLastFmVisualData();
  const github = useLiveGithub();
  // The sky opens on the visitor's hour and travels to his.
  const arrivingFrom = useTimeArrival(dayTheme);
  const [suffix, setSuffix] = useState("asian");
  // Give the live numbers a moment to land before the footer line is written
  // about them — but never wait on a request that may not come back.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSettled(true), 2500);
    return () => clearTimeout(id);
  }, []);

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

  // The sun lights the page — a cast here, not a stamp.
  const sun = dayTheme.shader.sunProgress;
  const day = dayTheme.shader.daylightStrength;
  const dayFlat = 1 - Math.pow(1 - day, 3);
  const shadowStyle = {
    "--sun-x": `${((sun - 0.5) * -34).toFixed(1)}px`,
    "--sun-y": `${(6 + (1 - dayFlat) * 10).toFixed(1)}px`,
    "--ink-a": (0.06 + dayFlat * 0.34).toFixed(3),
  } as CSSProperties;

  const minute = hydrated ? hongKongMinute(dayTheme.displayedDate) : 0;
  const sunLeft = (minute / MINUTES_IN_DAY) * 100;
  const moonLeft = (((minute + 720) % MINUTES_IN_DAY) / MINUTES_IN_DAY) * 100;

  // ── the day dial ──
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

  // ── one glass tooltip, fed by data-tip ──
  const [tip, setTip] = useState<string | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const onTipMove = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    const target = (event.target as HTMLElement).closest?.("[data-tip]");
    const text = target?.getAttribute("data-tip") || null;
    setTip(text);
    const node = tipRef.current;
    if (node && text) {
      const flip = event.clientX > window.innerWidth - 340;
      node.style.transform = `translate(${event.clientX + (flip ? -18 : 18)}px, ${
        event.clientY + 20
      }px) translateX(${flip ? "-100%" : "0"})`;
    }
  }, []);

  // ── the resume, printed from the same layer the live site uses ──
  const [printMounted, setPrintMounted] = useState(false);
  useEffect(() => {
    void import("@/components/home/print/HomePrintRoot");
    setPrintMounted(true);
    const onAfterPrint = () => clearSitePrintTarget();
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const printResume = useCallback(async () => {
    await fetchResumeMarkdownCached({ forceRefresh: true }).catch(() => null);
    setPrintMounted(true);
    await printSitePdf("resume");
  }, []);

  const doy = dayOfYear();
  const perDay = Math.round(github.commitsThisYear / doy);
  const perWeek = Math.round((github.prsThisYear / doy) * 7);

  const figures = [
    {
      value: numberFormat.format(github.prsThisYear),
      label: "pull requests",
      detail: `≈ ${perWeek} a week`,
    },
    {
      value: numberFormat.format(github.merged),
      label: "merged",
      detail: `${numberFormat.format(github.mergedElsewhere)} by someone else`,
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

  const moment = {
    clock: clockLabel(minute),
    place: now.location.label,
    weather: hydrated ? dayTheme.weatherDisplay : "clear",
    track: track ? `${track.track} by ${track.artist}` : null,
    prsThisYear: github.prsThisYear,
    commitsThisYear: github.commitsThisYear,
    mergedElsewhere: github.mergedElsewhere,
    suffix,
  };

  return (
    <div
      className="lab-root lab-min"
      style={shadowStyle}
      onMouseMove={onTipMove}
      onMouseLeave={() => setTip(null)}
    >
      <LabBackground dayTheme={dayTheme} />

      {printMounted ? (
        <div className="print-only print-layer-resume" aria-hidden>
          <HomePrintRoot />
        </div>
      ) : null}

      <div ref={tipRef} className={`min-tip ${tip ? "is-on" : ""}`} aria-hidden>
        {tip}
      </div>

      <main className="min-frame">
        {/* ── screen one: clock up top, content at the bottom, sky between ── */}
        <header className="min-top">
          <LabClock
            dayTheme={dayTheme}
            location={arrivingFrom ?? now.location}
            timeOffsetMinutes={now.location.utcOffsetMinutes}
            status={arrivingFrom ? null : now.status}
            arriving={Boolean(arrivingFrom)}
          />
          <div>
            <p className="min-meta">undivisible.dev</p>
            {track ? (
              <a
                className="min-playing"
                href={track.trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-tip={
                  track.isNowPlaying
                    ? "playing now — the field behind this page takes its colours from the cover"
                    : "last played — the field behind this page takes its colours from the cover"
                }
              >
                ♪ {track.track} — {track.artist}
              </a>
            ) : null}
          </div>
        </header>

        <section className="min-hero">
          <Reveal>
            <h1 className="min-name-hero">
              <NameCycle />
            </h1>
            <p className="min-tagline">
              <GhostTagline
                suffixClassName="min-suffix"
                onSuffixChange={setSuffix}
              />
            </p>
            <p className="min-role">
              <RandomizedText delay={0.55}>
                {`${IDENTITY.role} at ${IDENTITY.org}.`}
              </RandomizedText>{" "}
              <span className="min-role-what" data-tip={OMI_ROLE.line}>
                {IDENTITY.product}
              </span>
              .
            </p>

            <LinkPills github={github} onResume={printResume} />
          </Reveal>
        </section>

        {/* ── the day ── */}
        <Reveal className="min-dial-wrap">
          <div className="min-dial-head">
            <h2 className="min-label">the day, in hong kong</h2>
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
            <RandomizedText inView>
              drag the sun to move the hour. the sky behind this page, its
              colours and the shadows under the type all follow it — let go and
              it settles back to now.
            </RandomizedText>
          </p>
        </Reveal>

        {/* ── 2026 ── */}
        <section className="min-row">
          <Reveal>
            <h2 className="min-label">
              <i className="min-idx">01</i>2026
              {github.live ? (
                <i
                  className="min-live"
                  data-tip="these come from the github api on every load and refresh while the tab is open"
                />
              ) : null}
            </h2>
          </Reveal>
          <div className="min-body">
            <Reveal>
              <div className="min-figures">
                {figures.map((figure) => (
                  <div className="min-figure" key={figure.label} tabIndex={0}>
                    <b>
                      <Odometer value={figure.value} />
                    </b>
                    <span className="min-figure-label">
                      <span>{figure.label}</span>
                      <span className="min-figure-detail">{figure.detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <ul className="min-merged">
                {github.recent.slice(0, 4).map((pr) => (
                  <li key={pr.url}>
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-tip={`merged into ${pr.repo}`}
                    >
                      <time>{pr.mergedAt.slice(5)}</time>
                      <span>{pr.title}</span>
                      <i className="min-merged-repo">
                        {pr.repo.split("/")[1] ?? pr.repo}
                      </i>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="min-note">
                {github.omiThisMonth} pull requests on{" "}
                <a
                  href={GITHUB_ACTIVITY.allPrsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {GITHUB_ACTIVITY.repo}
                </a>{" "}
                this month.
                <br />
                {numberFormat.format(github.closedUnmerged)} were closed without
                merging — <em>i</em> closed nearly all of those. superseded,
                rebased away, or a better idea turned up. they are not
                rejections.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── headline works ── */}
        <section className="min-row">
          <Reveal>
            <h2 className="min-label">
              <i className="min-idx">02</i>headline works
            </h2>
          </Reveal>
          <div className="min-body">
            <ol className="min-works">
              {HEADLINE_WORKS.map((work, index) => (
                <Reveal key={work.name} delay={index * 0.04}>
                  <li className="min-work">
                    <a
                      className="min-work-link"
                      href={work.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="min-work-head">
                        <b>{work.name}</b>
                        <i>{work.what}</i>
                      </span>
                      <span className="min-work-line">
                        <RandomizedText inView>{work.line}</RandomizedText>
                      </span>
                      <span className="min-work-stat">{work.stat}</span>
                    </a>
                  </li>
                </Reveal>
              ))}
            </ol>
            <Reveal>
              <p className="min-note">
                all of it under{" "}
                <a
                  href={TSCHK.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tip={TSCHK.blurb}
                >
                  {TSCHK.name}
                </a>
                , {TSCHK.full}.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── the rest of it ── */}
        <section className="min-row">
          <Reveal>
            <h2 className="min-label">
              <i className="min-idx">03</i>everything else
            </h2>
          </Reveal>
          <div className="min-body">
            <Reveal>
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
            </Reveal>
          </div>
        </section>

        {/* ── route ── */}
        <section className="min-row">
          <Reveal>
            <h2 className="min-label">
              <i className="min-idx">04</i>this year
            </h2>
          </Reveal>
          <div className="min-body">
            <Reveal>
              <p className="min-route">
                {STOPS_THIS_YEAR.map((stop, index) => (
                  <span key={stop.code}>
                    {index > 0 ? <i className="min-route-arrow"> → </i> : null}
                    <span
                      className="min-route-code"
                      data-next={stop.next ? "true" : undefined}
                      data-tip={
                        stop.note ? `${stop.city} — ${stop.note}` : stop.city
                      }
                    >
                      {stop.code}
                    </span>
                  </span>
                ))}
              </p>
              <p className="min-note">
                {COUNTRIES_IN_A_YEAR} countries inside one year, at seventeen —{" "}
                <span data-tip={COUNTRIES.join(" · ")}>
                  {COUNTRIES.length} of them so far
                </span>
                . the last one is booked.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── before 17 ── */}
        <section className="min-row">
          <Reveal>
            <h2 className="min-label">
              <i className="min-idx">05</i>before 17
            </h2>
          </Reveal>
          <div className="min-body">
            <Reveal>
              <Milestones />
            </Reveal>
          </div>
        </section>

        <footer className="min-foot">
          <Reveal>
            <LocalIntelligence
              facts={moment}
              ready={hydrated && (github.live || settled)}
            />
          </Reveal>
          <nav className="min-links">
            <a
              href={WEBRING.prev}
              target="_blank"
              rel="noopener"
              data-tip="webring"
            >
              ←
            </a>
            {LAB_LINKS.map((link) =>
              link.name === "resume" ? (
                <button key={link.name} type="button" onClick={printResume}>
                  resume
                </button>
              ) : (
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
              ),
            )}
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
            built with crepuscularity + moonshine ·{" "}
            <Link href="/">current site</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
