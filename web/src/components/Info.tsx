import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "motion/react";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { tidbitExtras } from "@/data/project-descriptions";
import {
  resumeCommunity,
  resumeContact,
  resumeEducation,
  resumeExperience,
  resumeInterests,
  resumeProjectsNotInReadme,
  resumeSkillGroups,
} from "@/data/resume-document";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { pillarKeys } from "@/data/portfolio-featured";
import { TILE_LINK_HOVER } from "@/components/brief/ui/constants";
import { RandomizedText } from "./randomized-text";

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const socials = [
  {
    name: "instagram",
    username: "@undivisible.dev",
    href: "https://instagram.com/undivisible.dev",
  },
  {
    name: "twitter",
    username: "@makethings4ppl",
    href: "https://twitter.com/makethings4ppl",
  },
  {
    name: "email",
    username: "max@undivisible.dev",
    href: "mailto:max@undivisible.dev",
  },
  {
    name: "github",
    username: "undivisible",
    href: "https://github.com/undivisible",
  },
];

const hoverNames = [
  "祁明思",
  "максим картер",
  "チー・ミンスー",
  "مكس الكعطار",
  "מאקסימ קרתר",
];
const thingWords = ["things", "software", "systems", "products", "tools"];

const introText = `my favorite thing is chasing new experiences and sharing them with others. i do that through software, which i've been building since i was 8. i'm drawn to the frontier, i started making money online and playing with crypto at 11, and i was one of the first to try gpt-3 in 2021. since then, i dropped out of high school and founded tsc.hk, where i make the frontier. outside of that, i adore philosophy, cooking, photography, and gym.`;

const languages = ["rust", "typescript", "swift", "python", "go", "v", "zig"];
const transport = [
  "cantonese",
  "english",
  "russian",
  "mandarin",
  "indonesian",
  "japanese",
];

const transportColors: Record<string, string> = {
  cantonese: "#16221B",
  english: "#16221B",
  russian: "#1C2216",
  mandarin: "#221F16",
  indonesian: "#221816",
  japanese: "#221616",
};

export function Info({
  colors,
  dayTheme,
  readme,
  nowMarkdown,
  onOpenNow,
  slice = "all",
}: {
  colors: string[];
  dayTheme: HongKongDayTheme;
  readme: ReadmeBundle;
  nowMarkdown: string | null;
  onOpenNow: () => void;
  slice?: "all" | "intro" | "folio" | "bio";
}) {
  const showIntro = slice === "all" || slice === "intro";
  const showFolio = slice === "all" || slice === "folio";
  const showBio = slice === "all" || slice === "bio";
  const tidbits = useMemo((): Array<{
    name: string;
    href: string;
    desc: string;
    opacity?: 50;
  }> => {
    return [
      ...readme.miniapps.map((p) => ({
        name: p.name,
        href: p.href,
        desc: p.desc,
      })),
      ...tidbitExtras,
    ];
  }, [readme]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [nameHovered, setNameHovered] = useState(false);
  const [displayName, setDisplayName] = useState("max carter");
  const [nameVisible, setNameVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [clockHovered, setClockHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!nameHovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const hideFrame = window.requestAnimationFrame(() =>
        setNameVisible(false),
      );
      const timeout = window.setTimeout(() => {
        setDisplayName("max carter");
        setNameVisible(true);
      }, 380);
      return () => {
        window.cancelAnimationFrame(hideFrame);
        clearTimeout(timeout);
      };
    }

    let index = 0;
    const cycle = () => {
      setNameVisible(false);
      window.setTimeout(() => {
        setDisplayName(hoverNames[index]);
        setNameVisible(true);
        index = (index + 1) % hoverNames.length;
      }, 380);
    };

    cycle();
    intervalRef.current = setInterval(cycle, 2100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [nameHovered]);

  const displayNameStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "inline-block",
      minWidth: "7.5em",
      transition: "opacity 0.5s ease-out",
    }),
    [],
  );

  const pillStyle = useMemo<CSSProperties>(
    () => ({
      background: "color-mix(in srgb, var(--page-surface) 94%, black)",
      color: "var(--page-text)",
    }),
    [],
  );

  const weatherText = hydrated ? dayTheme.weatherDisplay : "--°C --";
  const hkgText = hydrated ? dayTheme.hkgTime : "--:--:--";
  const melText = hydrated ? dayTheme.melTime : "--:--:--";
  const localText = hydrated ? dayTheme.localTime : "--:--:--";

  const extraProjects = useMemo(
    () => resumeProjectsNotInReadme(readme),
    [readme],
  );

  const clockPanel = (
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
      onWheel={(event) => dayTheme.onScrubWheel(event)}
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
        {nowMarkdown ? (
          <button
            type="button"
            className={`cursor-pointer normal-case tracking-normal transition-all duration-300 ease-out max-lg:pointer-events-auto max-lg:opacity-100 max-lg:rounded-md max-lg:border max-lg:border-white/25 max-lg:bg-white/[0.06] max-lg:px-2 max-lg:py-0.5 max-lg:no-underline lg:border-none lg:bg-transparent lg:p-0 lg:underline lg:decoration-dotted lg:underline-offset-4 ${
              clockHovered
                ? "lg:pointer-events-auto lg:opacity-100"
                : "lg:pointer-events-none lg:opacity-0"
            }`}
            style={{ color: "var(--page-text-muted)" }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenNow();
            }}
          >
            now
          </button>
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
          aria-hidden={!clockHovered}
          className={`hidden max-w-[10rem] normal-case tracking-normal text-[9px] leading-snug transition-opacity duration-300 ease-out lg:inline-block lg:max-w-none ${
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

  const socialPills = (
    <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {socials.map((social) => {
        const active = hoveredPill === social.name;
        return (
          <a
            key={social.name}
            href={social.href}
            target={social.href.startsWith("http") ? "_blank" : undefined}
            rel={
              social.href.startsWith("http")
                ? "noopener noreferrer"
                : undefined
            }
            className="relative block h-11 min-h-11 min-w-0 w-full overflow-hidden rounded-full px-2.5 sm:h-12 sm:min-h-12 sm:px-3.5"
            onMouseEnter={() => setHoveredPill(social.name)}
            onMouseLeave={() => setHoveredPill(null)}
          >
            <div
              className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full px-2 sm:px-2.5 ${TILE_LINK_HOVER} hover:brightness-105`}
              style={pillStyle}
            >
              <span
                className="font-mono text-xs leading-none transition-transform duration-300 sm:text-[13px]"
                style={{
                  transform: active ? "translateY(-0.4rem)" : "translateY(0)",
                }}
              >
                {social.name}
              </span>
              <span
                className={`pointer-events-none absolute inset-x-2 bottom-1.5 truncate text-center font-mono text-[9px] leading-tight transition-all duration-300 sm:inset-x-2.5 sm:bottom-2 sm:text-[10px] ${
                  active ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: active ? "translateY(0)" : "translateY(0.4rem)",
                  color: "var(--page-text-muted)",
                }}
              >
                {social.username}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );

  const heroBlock = (
    <div className="w-full">
      <div className="space-y-3">
        <h1 className="font-serif text-lg leading-tight sm:text-xl md:text-2xl">
          <AnimatedText text="hi, i'm" className="inline-block" split="chars" />{" "}
          <span
            className="inline-block"
            style={{
              ...displayNameStyle,
              opacity: nameVisible ? (loaded ? 1 : 0) : 0,
            }}
            onMouseEnter={() => setNameHovered(true)}
            onMouseLeave={() => setNameHovered(false)}
          >
            {displayName}
          </span>
        </h1>
        <p
          className={`text-sm transition-opacity duration-700 sm:text-base ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ color: "var(--page-text-muted)" }}
        >
          <AnimatedText text="i make" className="inline-block" split="chars" />{" "}
          <MorphWord words={thingWords} />{" "}
          <AnimatedText text="for" className="inline-block" split="chars" />{" "}
          <ScatterWord word="people" colors={colors} />
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <AnimatedText text="here's my:" className="text-sm sm:text-base" />
        <div
          className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex w-full items-center gap-2 sm:gap-3">
            <a
              href="https://ring.liampas.ca/left"
              target="_blank"
              rel="noopener"
              className="flex h-11 flex-shrink-0 items-center justify-center px-1 text-base leading-none transition-opacity hover:opacity-80 sm:h-12 sm:text-lg"
              style={{ color: "var(--page-text-muted)" }}
              aria-label="Webring previous"
            >
              ←
            </a>
            <div className="min-w-0 flex-1">{socialPills}</div>
            <a
              href="https://ring.liampas.ca/right"
              target="_blank"
              rel="noopener"
              className="flex h-11 flex-shrink-0 items-center justify-center px-1 text-base leading-none transition-opacity hover:opacity-80 sm:h-12 sm:text-lg"
              style={{ color: "var(--page-text-muted)" }}
              aria-label="Webring next"
            >
              →
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const transportPill = (item: string) => {
    const base = transportColors[item] ?? "#16221B";
    const w = isMobile ? "84px" : "70px";
    return (
      <div
        key={item}
        suppressHydrationWarning
        className="cursor-default transition-[filter] duration-200 ease-out hover:brightness-110"
        style={{
          width: w,
          flexShrink: 0,
          paddingLeft: "6px",
          paddingRight: "6px",
          paddingTop: "6px",
          paddingBottom: "6px",
          overflow: "hidden",
          borderRadius: "30px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "4px",
          display: "inline-flex",
          ...dayTheme.getTransportStyle(base),
        }}
      >
        <div
          className={`flex flex-col justify-center font-sans font-normal ${isMobile ? "text-[10px]" : "text-[11px]"} ${item === "indonesian" || item === "japanese" ? "text-center" : "text-left"}`}
          style={{
            color: "var(--transport-text)",
          }}
        >
          {item}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full" style={{ color: "var(--page-text)" }}>
      {showIntro ? (
      <section
        id="start"
        className="scroll-mt-20 relative flex min-h-[calc(100svh-9.5rem)] snap-start snap-always flex-col sm:min-h-[calc(100svh-10rem)]"
      >
        <div className="relative z-[80] flex min-h-0 w-full max-w-4xl flex-1 flex-col pr-2 pb-6 sm:pb-8 sm:pr-36 lg:pr-44">
          <div className="w-fit shrink-0">{clockPanel}</div>
          <div className="min-h-0 flex-1" aria-hidden />
          <motion.div
            className="w-full shrink-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-48px" }}
            transition={{ duration: 0.65, ease: REVEAL_EASE }}
          >
            {heroBlock}
          </motion.div>
        </div>
      </section>
      ) : null}

      {showFolio ? (
      <section
        id="work"
        className="scroll-mt-24 snap-start snap-normal py-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 lg:max-w-none lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: REVEAL_EASE }}
            className="mb-12"
          >
            <h2 className="font-serif text-[clamp(1.75rem,5vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.03em]">
              work
            </h2>
          </motion.div>
          <UtilitiesBlock readme={readme} excludeKeys={pillarKeys} />
          <div className="mt-16 sm:mt-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: REVEAL_EASE }}
              className="mb-6"
            >
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                miniapps & experiments
              </h3>
            </motion.div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tidbits.map((tidbit, i) => (
                <motion.a
                  key={tidbit.name}
                  href={tidbit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.55,
                    ease: REVEAL_EASE,
                    delay: i * 0.05,
                  }}
                  className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm ${TILE_LINK_HOVER} hover:border-white/[0.1] hover:bg-white/[0.045] ${
                    tidbit.opacity === 50 ? "opacity-50" : ""
                  }`}
                >
                  <div className="text-sm font-medium leading-snug">
                    {tidbit.name}
                  </div>
                  <p
                    className="mt-2 line-clamp-4 text-[11px] leading-relaxed sm:text-xs"
                    style={{ color: "var(--page-text-muted)" }}
                  >
                    {tidbit.desc}
                  </p>
                </motion.a>
              ))}
            </div>
          </div>
          {extraProjects.length > 0 ? (
            <div className="mt-16 sm:mt-24">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: REVEAL_EASE }}
                className="mb-6"
              >
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                  more selected work
                </h3>
              </motion.div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {extraProjects.map((p, i) => (
                  <MainProjectCard
                    key={p.href}
                    title={p.name}
                    description={p.desc}
                    href={p.href}
                    isMobile={isMobile}
                    revealIndex={i}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      ) : null}

      {showBio ? (
      <section
        id="world"
        className="scroll-mt-24 snap-start snap-always py-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 lg:max-w-none lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: REVEAL_EASE }}
            className="mb-12"
          >
            <h2 className="font-serif text-[clamp(1.75rem,5vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.03em]">
              world
            </h2>
          </motion.div>

          <div className="space-y-16 sm:space-y-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: REVEAL_EASE }}
            >
              <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                story
              </h3>
              <RandomizedText
                split="words"
                className="text-sm leading-relaxed sm:text-base"
              >
                {introText}
              </RandomizedText>
            </motion.div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: REVEAL_EASE }}
                className="mb-6"
              >
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                  experience
                </h3>
              </motion.div>
              <div className="space-y-10">
                {resumeExperience.map((job, i) => (
                  <motion.div
                    key={`${job.org}-${job.role}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.55,
                      ease: REVEAL_EASE,
                      delay: i * 0.05,
                    }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-2">
                      <div className="text-base font-medium sm:text-lg">
                        {job.role} · {job.org}
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.14em] text-white/35 font-mono">
                        {job.time}
                      </div>
                    </div>
                    <ul
                      className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed"
                      style={{ color: "var(--page-text-muted)" }}
                    >
                      {job.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: REVEAL_EASE }}
              className="grid gap-12 lg:grid-cols-2 lg:gap-16"
            >
              <div>
                <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                  education
                </h3>
                <ul
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: "var(--page-text-muted)" }}
                >
                  {resumeEducation.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                  community
                </h3>
                <ul
                  className="list-disc space-y-2 pl-5 text-sm leading-relaxed"
                  style={{ color: "var(--page-text-muted)" }}
                >
                  {resumeCommunity.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: REVEAL_EASE }}
            >
              <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {resumeInterests.map((item) => (
                  <span
                    key={item}
                    className="cursor-default rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/55 transition-colors duration-200 ease-out hover:bg-white/[0.1] hover:text-white/75"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: REVEAL_EASE }}
            >
              <h3 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                capabilities
              </h3>
              <div className="space-y-5">
                {resumeSkillGroups.map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[9px] uppercase tracking-[0.14em] text-white/30 font-mono">
                      {label}
                    </div>
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: "var(--page-text-muted)" }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <div className="mb-3 text-[9px] uppercase tracking-[0.14em] text-white/30 font-mono">
                  languages & runtimes
                </div>
                <div className="flex flex-wrap gap-2">
                  {languages.map((item) => (
                    <Badge key={item} label={item} />
                  ))}
                </div>
              </div>
              <div className="mt-10">
                <div className="mb-3 text-[9px] uppercase tracking-[0.14em] text-white/30 font-mono">
                  day-to-day languages
                </div>
                <div className="flex flex-wrap gap-2">
                  {transport.map((item) => transportPill(item))}
                </div>
              </div>
            </motion.div>

            <motion.div
              id="contact"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: REVEAL_EASE }}
              className="scroll-mt-20 snap-start snap-always rounded-2xl border border-white/[0.06] bg-white/[0.04] p-6 backdrop-blur-md sm:p-8"
            >
              <h3 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                contact
              </h3>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {resumeContact
                  .filter(([label]) => label !== "LinkedIn")
                  .map(([label, value]) => {
                  const href =
                    label === "Email"
                      ? `mailto:${value}`
                      : label === "Phone"
                        ? `tel:${value.replace(/\s/g, "")}`
                        : label === "Instagram"
                          ? "https://instagram.com/undivisible.dev"
                          : label === "Twitter"
                            ? "https://twitter.com/makethings4ppl"
                            : label === "GitHub"
                              ? "https://github.com/undivisible"
                              : undefined;
                  return (
                    <div key={label} className="flex flex-col gap-0.5">
                      <dt className="text-[9px] uppercase tracking-[0.12em] text-white/30 font-mono">
                        {label}
                      </dt>
                      <dd>
                        {href ? (
                          <a
                            href={href}
                            className="text-white/85 underline-offset-4 hover:underline"
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={
                              href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                          >
                            {value}
                          </a>
                        ) : (
                          <span style={{ color: "var(--page-text-muted)" }}>
                            {value}
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </motion.div>
          </div>
        </div>
      </section>
      ) : null}
    </div>
  );
}

function AnimatedText({
  text,
  className = "",
  split = "words",
}: {
  text: string;
  className?: string;
  split?: "words" | "chars";
}) {
  return (
    <RandomizedText split={split} className={className}>
      {text}
    </RandomizedText>
  );
}

function MorphWord({ words }: { words: string[] }) {
  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const resetFrame = window.requestAnimationFrame(() => {
        setIndex(0);
        setVisible(true);
      });
      return () => window.cancelAnimationFrame(resetFrame);
    }

    intervalRef.current = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % words.length);
        setVisible(true);
      }, 180);
    }, 900);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hovered, words.length]);

  return (
    <span
      className="inline-block transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0.32,
        color: hovered ? "var(--page-text)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {words[index]}
    </span>
  );
}

function ScatterWord({ word, colors }: { word: string; colors: string[] }) {
  const [hovered, setHovered] = useState(false);
  const transforms = useMemo(
    () =>
      word.split("").map((_, index) => ({
        x: (index % 2 === 0 ? 1 : -1) * (7 + ((index * 5) % 12)),
        y: (index % 3 === 0 ? -1 : 1) * (5 + ((index * 3) % 8)),
        r: (index % 2 === 0 ? 1 : -1) * (7 + index * 2),
        color: colors[index % colors.length] ?? "#ffffff",
      })),
    [word, colors],
  );

  return (
    <span
      className="inline-flex cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {word.split("").map((letter, index) => {
        const transform = transforms[index];
        return (
          <span
            key={`${letter}-${index}`}
            className="relative inline-block overflow-visible px-[0.01em]"
          >
            <span
              className="inline-block transition-all duration-500 ease-out"
              style={{
                transform: hovered
                  ? `translate(${transform.x}px, ${transform.y}px) rotate(${transform.r}deg)`
                  : "translate(0px, 0px) rotate(0deg)",
                color: hovered ? transform.color : "var(--page-text-muted)",
              }}
            >
              {letter}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function UtilitiesBlock({
  readme,
  excludeKeys = [],
}: {
  readme: ReadmeBundle;
  excludeKeys?: readonly string[];
}) {
  const exclude = useMemo(() => new Set(excludeKeys), [excludeKeys]);
  const utilitiesFiltered = readme.utilities.filter((p) => !exclude.has(p.key));

  return (
    <div className="space-y-4">
      <motion.p
        className="text-[11px] uppercase tracking-[0.18em] font-mono text-white/40"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: REVEAL_EASE }}
      >
        libraries & tools
      </motion.p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {utilitiesFiltered.map((product, i) => (
          <motion.a
            key={product.key}
            href={product.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.55,
              ease: REVEAL_EASE,
              delay: i * 0.05,
            }}
            className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-left text-[var(--page-text)] backdrop-blur-sm ${TILE_LINK_HOVER} hover:border-white/[0.1] hover:bg-white/[0.045] sm:p-4`}
          >
            <div className="text-sm font-medium leading-tight">{product.name}</div>
            <p
              className="mt-1 line-clamp-3 text-[11px] leading-relaxed sm:text-xs"
              style={{ color: "var(--page-text-muted)" }}
            >
              {product.desc}
            </p>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

function MainProjectCard({
  title,
  description,
  href,
  isMobile = false,
  revealIndex = 0,
}: {
  title: string;
  description: string;
  href: string;
  isMobile?: boolean;
  revealIndex?: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.55,
        ease: REVEAL_EASE,
        delay: revealIndex * 0.05,
      }}
      className={`group relative flex min-h-[11rem] w-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-[var(--page-text)] backdrop-blur-sm ${TILE_LINK_HOVER} hover:border-white/[0.12] hover:bg-white/[0.055] sm:min-h-[12rem] sm:p-5 ${
        isMobile ? "max-w-full" : ""
      }`}
    >
      <div className="text-lg font-semibold leading-tight tracking-tight sm:text-xl">
        <AnimatedText text={title} className="inline-block" split="words" />
      </div>
      <div
        className="mt-3 flex-1 overflow-y-auto text-xs leading-relaxed sm:text-sm"
        style={{
          color: "var(--page-text-muted)",
          maxHeight: "7.75rem",
        }}
      >
        {description}
      </div>
      <div
        className={`mt-3 text-[10px] uppercase tracking-[0.18em] font-mono transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ color: "var(--page-text-soft)" }}
      >
        open →
      </div>
    </motion.a>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <div
      className="flex-shrink-0 cursor-default transition-[background-color,filter] duration-200 ease-out hover:brightness-110"
      style={{
        width: "84px",
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "6px",
        paddingBottom: "6px",
        background: "color-mix(in srgb, var(--page-surface) 94%, black)",
        overflow: "hidden",
        borderRadius: "30px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "5px",
        display: "inline-flex",
        color: "var(--page-text)",
      }}
    >
      <div className="flex flex-col justify-center font-mono text-[10px] text-inherit">
        {label}
      </div>
    </div>
  );
}
