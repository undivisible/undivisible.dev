import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { tidbitExtras } from "@/data/project-descriptions";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { RandomizedText } from "./randomized-text";

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
    name: "linkedin",
    username: "max lee carter",
    href: "https://www.linkedin.com/in/undivisible",
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

let carouselRowSeed = 0;

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
}: {
  colors: string[];
  dayTheme: HongKongDayTheme;
  readme: ReadmeBundle;
}) {
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
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [nameHovered, setNameHovered] = useState(false);
  const [displayName, setDisplayName] = useState("max carter");
  const [nameVisible, setNameVisible] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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
    if (!isMobile) return;

    const node = mobileContainerRef.current;
    if (!node) return;

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0].clientY;
      touchStartX.current = event.touches[0].clientX;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const deltaY = touchStartY.current - event.changedTouches[0].clientY;
      const deltaX = touchStartX.current - event.changedTouches[0].clientX;
      if (Math.abs(deltaX) >= Math.abs(deltaY)) return;
      if (Math.abs(deltaY) > 150) setRevealed(deltaY > 0);
    };

    const onWheel = (event: WheelEvent) => {
      if (
        (event.target as HTMLElement | null)?.closest(
          "[data-carousel-scroll='true']",
        )
      ) {
        return;
      }

      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      if (event.deltaY > 50) setRevealed(true);
      else if (event.deltaY < -50) setRevealed(false);
    };

    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchend", onTouchEnd, { passive: true });
    node.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchend", onTouchEnd);
      node.removeEventListener("wheel", onWheel);
    };
  }, [isMobile]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setLoaded(true));
    const scrollOffsetRef = { current: 0, revealed: false };

    const handleWheel = (event: WheelEvent) => {
      if (
        (event.target as HTMLElement | null)?.closest(
          "[data-time-scrubber='true'], [data-carousel-scroll='true']",
        )
      ) {
        return;
      }

      const isHorizontalScroll =
        Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (isHorizontalScroll) return;

      event.preventDefault();
      scrollOffsetRef.current = Math.max(
        0,
        scrollOffsetRef.current + event.deltaY * 1.5,
      );
      const shouldBeRevealed =
        scrollOffsetRef.current > window.innerHeight * 0.3;
      if (shouldBeRevealed !== scrollOffsetRef.revealed) {
        scrollOffsetRef.revealed = shouldBeRevealed;
        setRevealed(shouldBeRevealed);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("wheel", handleWheel);
    };
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

  const heroStyle = useMemo<React.CSSProperties>(
    () => ({
      opacity: revealed ? 0.72 : 1,
      transition: "opacity 0.5s ease-out",
    }),
    [revealed],
  );

  const lowerStyle = useMemo(() => {
    if (!revealed) {
      return { maxHeight: "0rem", opacity: 0, transform: "translateY(1.5rem)" };
    }
    return { maxHeight: "120rem", opacity: 1, transform: "translateY(0rem)" };
  }, [revealed]);

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

  const clockPanel = (
    <div
      data-time-scrubber="true"
      className={`absolute left-5 top-4 z-20 w-fit text-[10px] uppercase tracking-[0.18em] transition-all duration-500 [font-family:var(--font-jetbrains-mono),monospace] ${
        revealed
          ? "-translate-y-40 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
      style={{ color: "var(--page-text)" }}
      onMouseLeave={dayTheme.resetScrub}
      onWheel={dayTheme.onScrubWheel}
    >
      <div className="mb-2" style={{ color: "var(--page-text-soft)" }}>
        {weatherText}
      </div>
      <div className="grid grid-cols-[3.2rem_auto] items-baseline gap-x-2">
        <span style={{ color: "var(--page-text-soft)" }}>HKG</span>
        <span>{hkgText}</span>
      </div>
      <div className="mt-1 grid grid-cols-[3.2rem_auto] items-baseline gap-x-2">
        <span style={{ color: "var(--page-text-soft)" }}>MEL</span>
        <span>{melText}</span>
      </div>
      {dayTheme.showLocalTime && (
        <div className="mt-1 grid grid-cols-[3.2rem_auto] items-baseline gap-x-2">
          <span style={{ color: "var(--page-text-soft)" }}>
            {dayTheme.localLabel}
          </span>
          <span>{localText}</span>
        </div>
      )}
    </div>
  );

  const socialPills = (
    <CarouselRow bleedOut autoLoop={false} edgeFade>
      {socials.map((social) => {
        const active = hoveredPill === social.name;
        return (
          <a
            key={social.name}
            href={social.href}
            className="relative block h-8 min-w-[3.5rem] sm:min-w-[4rem] md:min-w-[4.5rem] overflow-hidden rounded-full flex-shrink-0"
            onMouseEnter={() => setHoveredPill(social.name)}
            onMouseLeave={() => setHoveredPill(null)}
          >
            <div
              className="relative flex h-full items-center justify-center rounded-full px-2 sm:px-3"
              style={pillStyle}
            >
              <span
                className="text-xs leading-none transition-all duration-300"
                style={{
                  transform: active ? "translateY(-0.35rem)" : "translateY(0)",
                }}
              >
                <AnimatedText
                  text={social.name}
                  className="inline-block"
                  split="chars"
                />
              </span>
              <span
                className="absolute left-1/2 top-1/2 max-w-[calc(100%-1rem)] overflow-hidden text-ellipsis whitespace-nowrap text-center text-[9px] leading-none transition-all duration-300"
                style={{
                  transform: active
                    ? "translate(-50%, 0.15rem)"
                    : "translate(-50%, -50%)",
                  opacity: active ? 1 : 0,
                  filter: active ? "blur(0px)" : "blur(8px)",
                  color: "var(--page-text-muted)",
                }}
              >
                <AnimatedText
                  text={social.username}
                  className="inline-block"
                  split="chars"
                />
              </span>
            </div>
          </a>
        );
      })}
    </CarouselRow>
  );

  const heroBlock = (
    <div
      className="w-full transition-all duration-500 ease-out"
      style={heroStyle}
    >
      <div className="space-y-3">
        <h1 className="text-base leading-tight">
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
          className={`text-xs transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ color: "var(--page-text-muted)" }}
        >
          <AnimatedText text="i make" className="inline-block" split="chars" />{" "}
          <MorphWord words={thingWords} />{" "}
          <AnimatedText text="for" className="inline-block" split="chars" />{" "}
          <ScatterWord word="people" colors={colors} />
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <AnimatedText text="here's my:" className="text-xs" />
        <div
          className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex w-full items-center gap-1.5 sm:gap-2">
            <a
              href="https://ring.liampas.ca/left"
              target="_blank"
              rel="noopener"
              className="flex h-8 flex-shrink-0 items-center justify-center px-1 text-sm leading-none transition-opacity hover:opacity-80"
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
              className="flex h-8 flex-shrink-0 items-center justify-center px-1 text-sm leading-none transition-opacity hover:opacity-80"
              style={{ color: "var(--page-text-muted)" }}
              aria-label="Webring next"
            >
              →
            </a>
          </div>
        </div>
        {!revealed && (
          <AnimatedText
            text={
              isMobile ? "swipe up to learn more" : "scroll to learn about me"
            }
            className="font-mono text-[10px] tracking-[0.08em] motion-safe:animate-bounce"
            split="chars"
          />
        )}
      </div>
    </div>
  );

  const lowerBlock = (
    <div
      className="w-full overflow-visible transition-all duration-500 ease-out"
      style={lowerStyle}
    >
      <div
        className={`space-y-8 pt-0 ${revealed ? "" : "pointer-events-none"}`}
      >
        {revealed ? (
          <RandomizedText
            key="lower-text"
            split="words"
            className="text-[10px] sm:text-xs leading-relaxed"
          >
            {introText}
          </RandomizedText>
        ) : (
          <div className="text-xs leading-relaxed opacity-0">{introText}</div>
        )}

        <UtilitiesBlock isMobile={isMobile} readme={readme} />

        <Section title="the works:">
          {languages.map((item) => (
            <Badge key={item} label={item} />
          ))}
        </Section>

        <Section title="the transport:">
          {transport.map((item) => {
            const base = transportColors[item] ?? "#16221B";
            return (
              <div
                key={item}
                suppressHydrationWarning
                style={{
                  width: "84px",
                  flexShrink: 0,
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  paddingTop: "6px",
                  paddingBottom: "6px",
                  overflow: "hidden",
                  borderRadius: "30px",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  display: "inline-flex",
                  ...dayTheme.getTransportStyle(base),
                }}
              >
                <div
                  style={{
                    justifyContent: "center",
                    display: "flex",
                    flexDirection: "column",
                    color: "var(--transport-text)",
                    fontFamily: "var(--font-young-serif), serif",
                    fontSize: "10px",
                    textAlign:
                      item === "indonesian" || item === "japanese"
                        ? "center"
                        : "left",
                  }}
                >
                  {item}
                </div>
              </div>
            );
          })}
        </Section>

        <Section title="cool tidbits:">
          {tidbits.map((tidbit) => (
            <Card
              key={tidbit.name}
              title={tidbit.name}
              description={tidbit.desc}
              href={tidbit.href}
              dimmed={tidbit.opacity === 50}
              isMobile={isMobile}
            />
          ))}
        </Section>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        ref={mobileContainerRef}
        className="relative h-dvh w-full overflow-x-visible overflow-y-hidden"
        style={{ color: "var(--page-text)" }}
      >
        <div className="sticky top-0 h-dvh overflow-x-visible overflow-y-hidden">
          <div
            className="h-[200dvh] w-full transition-transform duration-700 ease-out"
            style={{
              transform: revealed ? "translateY(-100dvh)" : "translateY(0)",
            }}
          >
            {/* Screen 1 — hero */}
            <section className="relative flex h-dvh w-full items-center px-5 pb-10 pt-24">
              {clockPanel}
              <div className="w-full min-w-0">{heroBlock}</div>
            </section>

            {/* Screen 2 — expanded content */}
            <section className="flex h-dvh w-full items-center px-5">
              <div
                className="flex min-h-dvh w-full items-center overflow-visible transition-all duration-500 ease-out"
                style={lowerStyle}
              >
                <div className="w-full min-w-0 py-4">{lowerBlock}</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-dvh w-full overflow-x-visible overflow-y-hidden"
      style={{ color: "var(--page-text)" }}
    >
      <div className="sticky top-0 h-dvh overflow-x-visible overflow-y-hidden">
        <div
          className="h-[200dvh] w-full transition-transform duration-700 ease-out"
          style={{
            transform: revealed ? "translateY(-100dvh)" : "translateY(0)",
          }}
        >
          {/* Screen 1 — hero */}
          <section className="relative flex h-dvh w-full items-center justify-start px-5 max-lg:pb-10 max-lg:pt-24">
            <div
              data-time-scrubber="true"
              className={`absolute left-5 top-4 z-20 w-fit text-[11px] uppercase tracking-[0.22em] transition-all duration-500 [font-family:var(--font-jetbrains-mono),monospace] sm:left-6 sm:top-6 md:left-8 md:top-8 ${
                revealed
                  ? "-translate-y-40 opacity-0 pointer-events-none lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto"
                  : "translate-y-0 opacity-100"
              }`}
              style={{ color: "var(--page-text)" }}
              onMouseLeave={dayTheme.resetScrub}
              onWheel={dayTheme.onScrubWheel}
            >
              <div className="w-fit">
                <div
                  className="mb-2"
                  style={{ color: "var(--page-text-soft)" }}
                >
                  {weatherText}
                </div>
                <div className="grid grid-cols-[3.6rem_auto] items-baseline gap-x-2">
                  <span style={{ color: "var(--page-text-soft)" }}>HKG</span>
                  <span>{hkgText}</span>
                </div>
                <div className="mt-1 grid grid-cols-[3.6rem_auto] items-baseline gap-x-2">
                  <span style={{ color: "var(--page-text-soft)" }}>MEL</span>
                  <span>{melText}</span>
                </div>
                {dayTheme.showLocalTime && (
                  <div className="mt-1 grid grid-cols-[3.6rem_auto] items-baseline gap-x-2">
                    <span style={{ color: "var(--page-text-soft)" }}>
                      {dayTheme.localLabel}
                    </span>
                    <span>{localText}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full min-w-0">{heroBlock}</div>
          </section>

          {/* Screen 2 — lower content */}
          <section className="flex h-dvh w-full items-center justify-start px-5 overflow-y-auto">
            <div
              className="flex min-h-dvh w-full items-center overflow-visible transition-all duration-500 ease-out"
              style={lowerStyle}
            >
              <div className="w-full min-w-0 py-8">
                <div className="space-y-10">
                  {revealed ? (
                    <RandomizedText
                      key="lower-text"
                      split="words"
                      className="text-xs md:text-sm"
                    >
                      {introText}
                    </RandomizedText>
                  ) : (
                    <div className="text-xs md:text-sm leading-relaxed opacity-0">
                      {introText}
                    </div>
                  )}

                  <UtilitiesBlock isMobile={isMobile} readme={readme} />

                  <Section title="the works:">
                    {languages.map((item) => (
                      <Badge key={item} label={item} />
                    ))}
                  </Section>

                  <Section title="the transport:">
                    {transport.map((item) => {
                      const base = transportColors[item] ?? "#16221B";
                      return (
                        <div
                          key={item}
                          suppressHydrationWarning
                          style={{
                            width: "70px",
                            flexShrink: 0,
                            paddingLeft: "6px",
                            paddingRight: "6px",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            overflow: "hidden",
                            borderRadius: "30px",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "3px",
                            display: "inline-flex",
                            ...dayTheme.getTransportStyle(base),
                          }}
                        >
                          <div
                            style={{
                              justifyContent: "center",
                              display: "flex",
                              flexDirection: "column",
                              color: "var(--transport-text)",
                              fontFamily: "var(--font-young-serif), serif",
                              fontSize: "11px",
                              fontWeight: 400,
                              textAlign:
                                item === "indonesian" || item === "japanese"
                                  ? "center"
                                  : "left",
                            }}
                          >
                            {item}
                          </div>
                        </div>
                      );
                    })}
                  </Section>

                  <Section title="cool tidbits:">
                    {tidbits.map((tidbit) => (
                      <Card
                        key={tidbit.name}
                        title={tidbit.name}
                        description={tidbit.desc}
                        href={tidbit.href}
                        dimmed={tidbit.opacity === 50}
                      />
                    ))}
                  </Section>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
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
  isMobile,
  readme,
}: {
  isMobile: boolean;
  readme: ReadmeBundle;
}) {
  const hasMain =
    readme.mainProjects.length > 0 || readme.mainHeroQuote.length > 0;

  const utilitiesSection = (
    <div className="space-y-2">
      <AnimatedText
        text="i make utilities that feel inevitable:"
        className="text-xs"
      />
      <CarouselRow bleedOut edgeFade>
        {readme.utilities.map((product) => (
          <Card
            key={product.key}
            title={product.name}
            description={product.desc}
            href={product.href}
            isMobile={isMobile}
          />
        ))}
      </CarouselRow>
    </div>
  );

  if (!hasMain) {
    return <div className="space-y-8">{utilitiesSection}</div>;
  }

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-2xl border border-solid p-4 sm:p-6"
        style={{
          borderColor: "color-mix(in srgb, var(--page-text) 14%, transparent)",
          backgroundColor:
            "color-mix(in srgb, var(--page-surface) 88%, black 6%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full opacity-[0.07]"
          style={{ background: "var(--page-text)" }}
        />
        <div className="relative">
          <div className="mb-4">
            <AnimatedText
              text="main projects"
              className="text-[10px] uppercase tracking-[0.22em] sm:text-xs"
              split="chars"
            />
          </div>
          {readme.mainHeroQuote ? (
            <blockquote
              className="mb-5 max-w-3xl border-l-2 pl-3 text-[11px] leading-relaxed sm:text-xs [font-family:var(--font-jetbrains-mono),monospace]"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--page-text) 28%, transparent)",
                color: "var(--page-text-muted)",
              }}
            >
              {readme.mainHeroQuote}
            </blockquote>
          ) : null}
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {readme.mainProjects.map((p) => (
              <MainProjectCard
                key={p.key}
                title={p.name}
                description={p.desc}
                href={p.href}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      </section>
      {utilitiesSection}
    </div>
  );
}

function MainProjectCard({
  title,
  description,
  href,
  isMobile = false,
}: {
  title: string;
  description: string;
  href: string;
  isMobile?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex min-h-[11rem] w-full flex-col rounded-xl border border-solid p-4 transition-colors sm:min-h-[12rem] sm:p-5 ${
        isMobile ? "max-w-full" : ""
      }`}
      style={{
        borderColor: "color-mix(in srgb, var(--page-text) 12%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--page-surface) 94%, black)",
        color: "var(--page-text)",
      }}
      onMouseEnter={(event) => {
        if (!isMobile) {
          event.currentTarget.style.backgroundColor =
            "color-mix(in srgb, var(--page-surface) 90%, var(--page-text) 4%)";
          event.currentTarget.style.borderColor =
            "color-mix(in srgb, var(--page-text) 22%, transparent)";
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor =
          "color-mix(in srgb, var(--page-surface) 94%, black)";
        event.currentTarget.style.borderColor =
          "color-mix(in srgb, var(--page-text) 12%, transparent)";
      }}
    >
      <span
        className="text-[9px] uppercase tracking-[0.22em] [font-family:var(--font-jetbrains-mono),monospace]"
        style={{ color: "var(--page-text-soft)" }}
      >
        flagship
      </span>
      <div className="mt-1 text-lg font-semibold leading-tight tracking-tight sm:text-xl">
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
        className={`mt-3 text-[10px] uppercase tracking-[0.18em] [font-family:var(--font-jetbrains-mono),monospace] transition-opacity ${
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ color: "var(--page-text-soft)" }}
      >
        open →
      </div>
    </a>
  );
}

function CarouselRow({
  children,
  bleedOut = false,
  autoLoop = false,
  edgeFade = true,
}: {
  children: React.ReactNode;
  bleedOut?: boolean;
  autoLoop?: boolean;
  edgeFade?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const pointerActiveRef = useRef(false);
  const hoveredRef = useRef(false);
  const hoverPauseUntilRef = useRef(0);
  const visibleRef = useRef(false);
  const startDelayUntilRef = useRef(0);
  const [canLoop, setCanLoop] = useState(false);
  const rowMotion = useMemo(() => {
    const index = carouselRowSeed;
    carouselRowSeed += 1;
    return {
      delay: (index % 5) * 320,
      speed: 24 + (index % 4) * 4,
    };
  }, []);

  const [edgeMask, setEdgeMask] = useState({ la: 1, ra: 1 });

  const syncEdgeMask = useCallback(() => {
    const el = viewportRef.current;
    if (!el || autoLoop) return;
    const max = el.scrollWidth - el.clientWidth;
    const fadePx = 48;
    if (max <= 1) {
      setEdgeMask((prev) =>
        prev.la === 1 && prev.ra === 1 ? prev : { la: 1, ra: 1 },
      );
      return;
    }
    const sl = el.scrollLeft;
    const la = Math.max(0, 1 - Math.min(1, sl / fadePx));
    const ra = Math.max(0, 1 - Math.min(1, (max - sl) / fadePx));
    setEdgeMask((prev) =>
      prev.la === la && prev.ra === ra ? prev : { la, ra },
    );
  }, [autoLoop]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const track = trackRef.current;
    if (!viewport || !content || !track) return;

    const applyOffset = (value: number) => {
      const loopWidth = loopWidthRef.current;
      const normalized =
        loopWidth > 0 ? ((value % loopWidth) + loopWidth) % loopWidth : 0;
      offsetRef.current = normalized;
      track.style.transform = `translate3d(${-normalized}px, 0, 0)`;
    };

    const measure = () => {
      const next = content.nextElementSibling as HTMLElement | null;
      const loopWidth = next
        ? next.offsetLeft - content.offsetLeft
        : content.scrollWidth;
      loopWidthRef.current = Math.max(0, loopWidth);
      setCanLoop(autoLoop && loopWidth > 1);
      applyOffset(offsetRef.current);
      syncEdgeMask();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(content);

    const scrollMask = () => syncEdgeMask();
    if (edgeFade && !autoLoop) {
      viewport.addEventListener("scroll", scrollMask, { passive: true });
      syncEdgeMask();
    }

    return () => {
      ro.disconnect();
      if (edgeFade && !autoLoop) {
        viewport.removeEventListener("scroll", scrollMask);
      }
    };
  }, [autoLoop, syncEdgeMask, edgeFade]);

  useEffect(() => {
    if (!autoLoop) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = visibleRef.current;
        visibleRef.current = entry.isIntersecting;
        if (!wasVisible && entry.isIntersecting) {
          startDelayUntilRef.current = performance.now() + rowMotion.delay;
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(viewport);
    return () => observer.disconnect();
  }, [autoLoop, rowMotion.delay]);

  useEffect(() => {
    if (!autoLoop) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || !canLoop) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    let frame = 0;
    let last = performance.now();

    const applyOffset = (value: number) => {
      const loopWidth = loopWidthRef.current;
      if (loopWidth <= 0) return;
      const normalized = ((value % loopWidth) + loopWidth) % loopWidth;
      offsetRef.current = normalized;
      track.style.transform = `translate3d(${-normalized}px, 0, 0)`;
    };

    const tick = (now: number) => {
      const delta = Math.min(now - last, 80);
      last = now;

      if (
        !document.hidden &&
        visibleRef.current &&
        !viewport.matches(":hover") &&
        !hoveredRef.current &&
        now >= hoverPauseUntilRef.current &&
        !pointerActiveRef.current &&
        now >= startDelayUntilRef.current
      ) {
        applyOffset(offsetRef.current + (delta / 1000) * rowMotion.speed);
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [autoLoop, canLoop, rowMotion.speed]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let isDown = false;
    let isDragging = false;
    let startX = 0;
    let startOffset = 0;
    let suppressNextClick = false;
    let startTime = 0;
    let activePointerId: number | null = null;

    const cleanupWindowListeners = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
    };

    const applyOffset = (value: number) => {
      const loopWidth = loopWidthRef.current;
      if (loopWidth <= 0) return;
      const normalized = ((value % loopWidth) + loopWidth) % loopWidth;
      offsetRef.current = normalized;
      track.style.transform = `translate3d(${-normalized}px, 0, 0)`;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!autoLoop) return;
      if (event.button !== 0) return;
      pointerActiveRef.current = true;
      isDown = true;
      isDragging = false;
      startX = event.clientX;
      startOffset = offsetRef.current;
      startTime = Date.now();
      activePointerId = event.pointerId;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDown || event.pointerId !== activePointerId) return;
      const deltaX = event.clientX - startX;
      const absDelta = Math.abs(deltaX);
      if (!isDragging) {
        if (absDelta > 20) {
          isDragging = true;
          applyOffset(startOffset - deltaX);
        }
      } else {
        applyOffset(startOffset - deltaX);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!isDown || event.pointerId !== activePointerId) return;
      isDown = false;
      pointerActiveRef.current = false;
      activePointerId = null;
      cleanupWindowListeners();
      if (isDragging && Date.now() - startTime > 120) {
        suppressNextClick = true;
      }
      isDragging = false;
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (!isDown || event.pointerId !== activePointerId) return;
      isDown = false;
      pointerActiveRef.current = false;
      activePointerId = null;
      cleanupWindowListeners();
      isDragging = false;
    };

    const onClickCapture = (event: MouseEvent) => {
      if (suppressNextClick) {
        suppressNextClick = false;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onPointerEnter = () => {
      hoveredRef.current = true;
      hoverPauseUntilRef.current = Number.POSITIVE_INFINITY;
    };

    const onPointerLeave = () => {
      hoveredRef.current = false;
      hoverPauseUntilRef.current = performance.now() + 400;
      pointerActiveRef.current = false;
    };

    const onMouseMove = () => {
      hoveredRef.current = true;
      hoverPauseUntilRef.current = performance.now() + 1200;
    };

    const onMouseLeave = () => {
      hoveredRef.current = false;
      hoverPauseUntilRef.current = performance.now() + 400;
    };

    const onWheel = (event: WheelEvent) => {
      if (!autoLoop || loopWidthRef.current <= 0) return;
      hoveredRef.current = true;
      hoverPauseUntilRef.current = performance.now() + 1200;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (Math.abs(delta) < 0.5) return;
      event.preventDefault();
      applyOffset(offsetRef.current + delta);
    };

    viewport.addEventListener("pointerenter", onPointerEnter);
    viewport.addEventListener("pointerleave", onPointerLeave);
    viewport.addEventListener("mousemove", onMouseMove);
    viewport.addEventListener("mouseleave", onMouseLeave);
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("click", onClickCapture, true);
    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      viewport.removeEventListener("pointerenter", onPointerEnter);
      viewport.removeEventListener("pointerleave", onPointerLeave);
      viewport.removeEventListener("mousemove", onMouseMove);
      viewport.removeEventListener("mouseleave", onMouseLeave);
      viewport.removeEventListener("pointerdown", onPointerDown);
      cleanupWindowListeners();
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [autoLoop]);

  const edgeFadeStyle: CSSProperties | undefined =
    edgeFade && !autoLoop
      ? {
          WebkitMaskImage: `linear-gradient(to right, rgba(0,0,0,${edgeMask.la}) 0px, #000 2rem, #000 calc(100% - 2.5rem), rgba(0,0,0,${edgeMask.ra}) 100%)`,
          maskImage: `linear-gradient(to right, rgba(0,0,0,${edgeMask.la}) 0px, #000 2rem, #000 calc(100% - 2.5rem), rgba(0,0,0,${edgeMask.ra}) 100%)`,
        }
      : undefined;

  return (
    <div
      className={`relative w-full overflow-y-visible ${autoLoop ? "overflow-x-hidden" : "overflow-x-visible"} ${bleedOut ? "-mx-5 w-[calc(100%+2.5rem)]" : ""} ${edgeFade && autoLoop ? "carousel-mask" : ""}`}
      style={edgeFadeStyle}
    >
      <div
        ref={viewportRef}
        data-carousel-scroll="true"
        style={{
          overflowX: autoLoop ? "hidden" : "auto",
          overflowY: "hidden",
          ...(autoLoop
            ? { touchAction: "none" as const }
            : {
                WebkitOverflowScrolling: "touch",
              } satisfies Pick<CSSProperties, "WebkitOverflowScrolling">),
          overscrollBehaviorX: autoLoop ? undefined : "contain",
          overscrollBehaviorY: "contain",
          userSelect: "none",
        }}
        className="cursor-grab py-2 [scrollbar-width:none] active:cursor-grabbing [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          ref={trackRef}
          className={`inline-flex w-max flex-nowrap gap-2 will-change-transform sm:gap-1.5 md:gap-1 ${bleedOut ? "pl-5" : ""}`}
        >
          <div
            ref={contentRef}
            className="inline-flex flex-nowrap gap-2 sm:gap-1.5 md:gap-1"
          >
            {children}
          </div>
          {autoLoop &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                aria-hidden="true"
                inert={true}
                className="inline-flex flex-nowrap gap-2 sm:gap-1.5 md:gap-1"
              >
                {children}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <AnimatedText text={title} className="text-xs" />
      <CarouselRow bleedOut>{children}</CarouselRow>
    </div>
  );
}

function Card({
  title,
  description,
  href,
  dimmed = false,
  isMobile = false,
}: {
  title: string;
  description: string;
  href: string;
  dimmed?: boolean;
  isMobile?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`relative z-0 flex-shrink-0 rounded-lg p-2 ${
        isMobile ? "min-w-[9rem] max-w-[9rem]" : "min-w-[8rem] max-w-[8rem]"
      } ${dimmed ? "opacity-50" : "opacity-100"}`}
      style={{
        backgroundColor: "color-mix(in srgb, var(--page-surface) 94%, black)",
        color: "var(--page-text)",
        transition: "background-color 180ms ease-out",
      }}
      onMouseEnter={(event) => {
        if (!isMobile) {
          event.currentTarget.style.backgroundColor =
            "color-mix(in srgb, var(--page-surface) 90%, var(--page-text) 4%)";
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor =
          "color-mix(in srgb, var(--page-surface) 94%, black)";
      }}
    >
      <AnimatedText text={title} className="text-xs" />
      <div
        className="mt-1 text-[9px] leading-relaxed"
        style={{ color: "var(--page-text-muted)" }}
      >
        <AnimatedText text={description} />
      </div>
    </a>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <div
      className="flex-shrink-0"
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
      <div
        style={{
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          color: "inherit",
          fontSize: "10px",
          fontFamily: "var(--font-young-serif), serif",
        }}
      >
        {label}
      </div>
    </div>
  );
}
