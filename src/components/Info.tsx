"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
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
    href: "https://www.linkedin.com/in/maxleecarter",
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

const products = [
  {
    name: "crepuscularity",
    desc: "code web, get native, on every device + web.",
    href: "https://crepuscularity.undivisible.dev",
  },
  {
    name: "aurorality",
    desc: "code web, get swiftui. rusty logic and batteries included.",
    href: "https://github.com/semitechnological/aurorality",
  },
  {
    name: "crepus/aurora lite",
    desc: "native ui for any electron project or website.",
    href: "https://github.com/semitechnological/crepuscularity",
  },
  {
    name: "equilibrium",
    desc: "FFI for C compiling langs, or Swift in 2 lines.",
    href: "https://github.com/semitechnological/equilibrium",
  },
  {
    name: "wax",
    desc: "brew but up to 20x faster + system package management.",
    href: "https://github.com/semitechnological/wax",
  },
  {
    name: "rs_ai",
    desc: "unified rust ai sdk with local and online providers.",
    href: "https://github.com/undivisible/rs_ai",
  },
  {
    name: "soliloquy",
    desc: "an ultralight ultrafast web native operating system.",
    href: "#",
  },
  {
    name: "otto",
    desc: "ai powered ottocomplete everywhere on your mac.",
    href: "https://github.com/semitechnological/otto",
  },
  {
    name: "tile",
    desc: "canvas, mosaic and tiling window management.",
    href: "https://github.com/semitechnological/tile",
  },
  {
    name: "rover",
    desc: "all in one blazingly fast execution agent for mac.",
    href: "https://github.com/semitechnological/tile",
  },
  { name: "atmosphere", desc: "ecosystem every device.", href: "#" },
  {
    name: "experiences",
    desc: "making the spatial web accessible.",
    href: "#",
  },
];

const languages = ["rust", "typescript", "swift", "python", "go", "v", "zig"];
const transport = [
  "cantonese",
  "english",
  "russian",
  "mandarin",
  "indonesian",
  "japanese",
];

const tidbits = [
  {
    name: "unthinkmail",
    desc: "mcp your imap supported email",
    href: "https://unthinkmail.undivisible.dev",
  },
  {
    name: "drift",
    desc: "the macos screensaver as a wallpaper on every device",
    href: "https://github.com/undivisible/drift-wallpaper",
  },
  {
    name: "unelaborate",
    desc: "swiftui minecraft launcher + modrinth mod loading in client",
    href: "https://github.com/undivisible/drift-wallpaper",
  },
  {
    name: "bublik",
    desc: "frequency terrain noise generator",
    href: "https://bublik.undivisible.dev",
  },
  {
    name: "alphabets",
    desc: "learn unicode-supported alphabets.",
    href: "https://alphabets.undivisible.dev",
  },
  {
    name: "notes",
    desc: "a minimal markdown text editor in the web.",
    href: "https://notes.undivisible.dev",
  },
  {
    name: "anywhere",
    desc: "web extension for online ai to code inline interactions",
    href: "https://github.com/undivisible/anywhere",
  },
  {
    name: "poke around",
    desc: "let poke around your computer with openclaw tools.",
    href: "https://github.com/undivisible/poke-around",
  },
  {
    name: "unthinkclaw",
    desc: "openclaw but tiny, with agent swarms and online saas.",
    href: "https://github.com/undivisible/unthinkclaw",
  },
  {
    name: "standpoint",
    desc: "the opinion based platform with tierlists and polls",
    href: "https://github.com/undivisible/standpoint",
    opacity: 50,
  },
  {
    name: "infrastruct",
    desc: "comparative jurisprudence platform for major religions",
    href: "https://github.com/undivisible/infrastruct",
    opacity: 50,
  },
  {
    name: "akh",
    desc: "software uniplatform for when i was muslim",
    href: "https://github.com/undivisible/akh",
    opacity: 50,
  },
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
}: {
  colors: string[];
  dayTheme: HongKongDayTheme;
}) {
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
    if (!isMobile) {
      return;
    }

    const node = mobileContainerRef.current;
    if (!node) {
      return;
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0].clientY;
      touchStartX.current = event.touches[0].clientX;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const deltaY = touchStartY.current - event.changedTouches[0].clientY;
      const deltaX = touchStartX.current - event.changedTouches[0].clientX;
      // Let horizontal swipes pass through for carousel scrolling
      if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        return;
      }

      if (Math.abs(deltaY) > 150) {
        setRevealed(deltaY > 0);
      }
    };

    const onWheel = (event: WheelEvent) => {
      // Let horizontal wheels pass through for carousel scrolling
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
        return;
      }

      if (event.deltaY > 50) {
        setRevealed(true);
      } else if (event.deltaY < -50) {
        setRevealed(false);
      }
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
          "[data-time-scrubber='true']",
        )
      ) {
        event.preventDefault();
        return;
      }

      const isHorizontalScroll =
        Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (isHorizontalScroll) {
        // Let horizontal wheels control carousel natively
        return;
      }

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

  if (isMobile) {
    return (
      <div
        ref={mobileContainerRef}
        className="relative mx-4 h-dvh w-[calc(100%-2rem)] overflow-hidden"
        style={{ color: "var(--page-text)" }}
      >
        <div className="sticky top-0 h-dvh overflow-hidden">
          <div
            className={`h-[200dvh] w-full transition-transform duration-700 ease-out ${revealed ? "pointer-events-auto" : ""}`}
            style={{
              transform: revealed ? "translateY(-100dvh)" : "translateY(0)",
            }}
          >
            <section className="relative flex h-dvh w-full items-center">
              <div
                data-time-scrubber="true"
                className={`absolute top-4 z-20 w-fit font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-500 ${revealed ? "-translate-y-40 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
                style={{ color: "var(--page-text)" }}
                onMouseLeave={dayTheme.resetScrub}
                onWheel={dayTheme.onScrubWheel}
              >
                <div
                  className="mb-2"
                  style={{ color: "var(--page-text-soft)" }}
                >
                  {weatherText}
                </div>
                <div className="grid grid-cols-[3.1rem_auto] items-baseline gap-x-2">
                  <span style={{ color: "var(--page-text-soft)" }}>HKG</span>
                  <span>{hkgText}</span>
                </div>
                <div className="mt-1 grid grid-cols-[3.1rem_auto] items-baseline gap-x-2">
                  <span style={{ color: "var(--page-text-soft)" }}>MEL</span>
                  <span>{melText}</span>
                </div>
                {dayTheme.showLocalTime && (
                  <div className="mt-1 grid grid-cols-[3.1rem_auto] items-baseline gap-x-2">
                    <span style={{ color: "var(--page-text-soft)" }}>
                      {dayTheme.localLabel}
                    </span>
                    <span>{localText}</span>
                  </div>
                )}
              </div>

              <div className="w-full min-w-0 max-w-full">
                <div className="space-y-3">
                  <h1 className="max-w-full break-words text-base leading-tight">
                    <AnimatedText
                      text="hi, i'm"
                      className="inline-block"
                      split="chars"
                    />{" "}
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
                    className={`max-w-full break-words text-xs transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
                    style={{ color: "var(--page-text-muted)" }}
                  >
                    <AnimatedText
                      text="i make"
                      className="inline-block"
                      split="chars"
                    />{" "}
                    <MorphWord words={thingWords} />{" "}
                    <AnimatedText
                      text="for"
                      className="inline-block"
                      split="chars"
                    />{" "}
                    <ScatterWord word="people" colors={colors} />
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <AnimatedText text="here's my:" className="text-xs" />
                  <div
                    className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
                  >
                    <CarouselRow bleedOut>
                      {socials.map((social) => {
                        const active = hoveredPill === social.name;
                        return (
                          <a
                            key={social.name}
                            href={social.href}
                            className="relative block h-8 min-w-[4.5rem] overflow-hidden rounded-full"
                            onMouseEnter={() => setHoveredPill(social.name)}
                            onMouseLeave={() => setHoveredPill(null)}
                          >
                            <div
                              className="relative flex h-full items-center justify-center rounded-full px-2"
                              style={pillStyle}
                            >
                              <span
                                className="text-xs leading-none transition-all duration-300"
                                style={{
                                  transform: active
                                    ? "translateY(-0.48rem)"
                                    : "translateY(0)",
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
                                    ? "translate(-50%, 0.62rem)"
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
                  </div>

                  {!revealed && (
                    <AnimatedText
                      text="swipe up to learn more"
                      className="font-mono text-[10px] tracking-[0.08em] motion-safe:animate-bounce"
                      split="chars"
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="flex h-dvh w-full items-center">
              <div className="w-full min-w-0 max-w-full">
                <div
                  className="flex min-h-dvh w-full items-center overflow-y-hidden transition-all duration-500 ease-out"
                  style={lowerStyle}
                >
                  <div className="w-full min-w-0 space-y-6 pt-0">
                    {revealed ? (
                      <RandomizedText
                        key="lower-text"
                        split="words"
                        className="max-w-full break-words text-sm leading-relaxed"
                      >
                        {introText}
                      </RandomizedText>
                    ) : (
                      <div className="max-w-full break-words text-xs leading-relaxed opacity-0">
                        {introText}
                      </div>
                    )}

                    <Section
                      title="i make utilities that feel inevitable:"
                      isMobile
                    >
                      {products.map((product) => (
                        <Card
                          key={product.name}
                          title={product.name}
                          description={product.desc}
                          href={product.href}
                          isMobile
                        />
                      ))}
                    </Section>

                    <Section title="the works:" isMobile>
                      {languages.map((item) => (
                        <Badge key={item} label={item} isMobile />
                      ))}
                    </Section>

                    <Section title="the transport:" isMobile>
                      {transport.map((item) => {
                        const base = transportColors[item] ?? "#16221B";
                        return (
                          <div
                            key={item}
                            suppressHydrationWarning
                            style={{
                              width: "84px",
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
                                fontSize: "12px",
                                fontFamily: "Young Serif",
                                fontWeight: 400,
                                wordWrap: "break-word",
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

                    <Section title="cool tidbits:" isMobile>
                      {tidbits.map((tidbit) => (
                        <Card
                          key={tidbit.name}
                          title={tidbit.name}
                          description={tidbit.desc}
                          href={tidbit.href}
                          dimmed={tidbit.opacity === 50}
                          isMobile
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

  return (
    <div
      className="relative h-dvh w-full max-w-full overflow-hidden bg-transparent"
      style={{ color: "var(--page-text)" }}
    >
      <div className="sticky top-0 mx-3 sm:mx-4 md:mx-6 lg:mx-8 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] flex h-dvh min-w-0 items-center justify-start overflow-y-hidden sm:overflow-y-auto">
        <div className="flex h-full w-full min-w-0 max-w-full flex-col items-start justify-start sm:justify-center">
          <div
            data-time-scrubber="true"
            className={`absolute top-4 z-20 w-fit font-mono text-[11px] uppercase tracking-[0.22em] transition-all duration-500 md:top-8 md:text-[12px] ${revealed ? "-translate-y-40 opacity-0 pointer-events-none lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto" : "translate-y-0 opacity-100"}`}
            style={{ color: "var(--page-text)" }}
            onMouseLeave={dayTheme.resetScrub}
            onWheel={dayTheme.onScrubWheel}
          >
            <div className="w-fit">
              <div className="mb-2" style={{ color: "var(--page-text-soft)" }}>
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

          <div
            className="transition-all duration-500 ease-out"
            style={heroStyle}
          >
            <div className="space-y-3">
              <h1 className="max-w-full break-words text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                <AnimatedText
                  text="hi, i'm"
                  className="inline-block"
                  split="chars"
                />{" "}
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
                className="max-w-full break-words text-[11px] sm:text-xs md:text-sm lg:text-sm"
                style={{ color: "var(--page-text-muted)", opacity: 1 }}
              >
                <AnimatedText
                  text="i make"
                  className="inline-block"
                  split="chars"
                />{" "}
                <MorphWord words={thingWords} />{" "}
                <AnimatedText
                  text="for"
                  className="inline-block"
                  split="chars"
                />{" "}
                <ScatterWord word="people" colors={colors} />
              </p>
            </div>

            <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-6 space-y-3 sm:space-y-4">
              <AnimatedText text="here's my:" className="text-[11px] sm:text-xs" />
              <div
                className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
              >
                <CarouselRow>
                  {socials.map((social) => {
                    const active = hoveredPill === social.name;

                    return (
<a
                         key={social.name}
                         href={social.href}
                         className="relative block h-5 sm:h-6 md:h-7 lg:h-8 xl:h-[3.25rem] min-w-[3.5rem] sm:min-w-[4rem] md:min-w-[4.5rem] lg:min-w-[5rem] xl:min-w-[6rem] overflow-hidden rounded-full"
                         onMouseEnter={() => setHoveredPill(social.name)}
                         onMouseLeave={() => setHoveredPill(null)}
                       >
                         <div
                           className="relative flex h-full items-center justify-center rounded-full px-1 sm:px-1.5 md:px-2"
                           style={pillStyle}
                         >
                           <span
                             className="text-center text-[9px] sm:text-[10px] md:text-xs lg:text-sm leading-none transition-all duration-300"
                             style={{
                              transform: active
                                ? "translateY(-0.48rem)"
                                : "translateY(0)",
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
                                ? "translate(-50%, 0.62rem)"
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
              </div>

              {!revealed && (
                <AnimatedText
                  text="scroll to learn about me"
                  className="font-mono text-[9px] tracking-[0.08em] motion-safe:animate-bounce"
                  split="chars"
                />
              )}
            </div>
          </div>

          <div
            className="mt-8 w-full max-w-full overflow-visible transition-all duration-500 ease-out"
            style={lowerStyle}
          >
            <div
              className={`space-y-12 pt-0 max-w-full ${revealed ? "" : "pointer-events-none"}`}
            >
              {revealed ? (
                <RandomizedText
                  key="lower-text"
                  split="words"
                  className="text-xs md:text-base"
                >
                  {introText}
                </RandomizedText>
              ) : (
                <div className="text-xs md:text-sm leading-relaxed opacity-0">
                  {introText}
                </div>
              )}

              <Section title="i make utilities that feel inevitable:">
                {products.map((product) => (
                  <Card
                    key={product.name}
                    title={product.name}
                    description={product.desc}
                    href={product.href}
                  />
                ))}
              </Section>

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
                        width: "100px",
                        paddingLeft: "12px",
                        paddingRight: "12px",
                        paddingTop: "8px",
                        paddingBottom: "8px",
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
                          fontSize: "14px",
                          fontFamily: "Young Serif",
                          fontWeight: 400,
                          wordWrap: "break-word",
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

function CarouselRow({
  children,
  bleedOut = false,
}: {
  children: React.ReactNode;
  bleedOut?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let isDown = false;
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let suppressNextClick = false;
    let startTime = 0;
    let activePointerId: number | null = null;

    const cleanupWindowListeners = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      isDown = true;
      isDragging = false;
      startX = event.clientX;
      startScrollLeft = node.scrollLeft;
      startTime = Date.now();
      activePointerId = event.pointerId;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDown || event.pointerId !== activePointerId) return;
      const deltaX = event.clientX - startX;
      const absDelta = Math.abs(deltaX);
      if (!isDragging) {
        if (absDelta > 20) {
          isDragging = true;
          node.scrollLeft = startScrollLeft - deltaX;
        }
      } else {
        node.scrollLeft = startScrollLeft - deltaX;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!isDown || event.pointerId !== activePointerId) return;
      isDown = false;
      activePointerId = null;
      cleanupWindowListeners();
      if (isDragging && Date.now() - startTime > 120) {
        suppressNextClick = true;
      }
      isDragging = false;
    };

    const onClickCapture = (event: MouseEvent) => {
      if (suppressNextClick) {
        suppressNextClick = false;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("click", onClickCapture, true);

    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      cleanupWindowListeners();
      node.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <div
      className={`relative max-w-full overflow-visible ${bleedOut ? "-mx-4 w-[calc(100%+2rem)]" : "w-full"}`}
    >
      <div
        ref={ref}
        data-carousel-scroll="true"
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
          userSelect: "none",
        }}
        className={`cursor-grab active:cursor-grabbing pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${bleedOut ? "px-4" : ""}`}
      >
        <div
          className={`inline-flex w-max flex-nowrap gap-2 ${bleedOut ? "min-w-[calc(100%+2rem)]" : "min-w-full"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  isMobile = false,
}: {
  title: string;
  children: React.ReactNode;
  isMobile?: boolean;
}) {
  return (
    <div className="space-y-4">
      <AnimatedText text={title} className={isMobile ? "text-sm" : "text-xl"} />
      <CarouselRow bleedOut={isMobile}>{children}</CarouselRow>
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
      className={`${
        isMobile
          ? "min-w-[9rem] max-w-[9rem] rounded-lg p-2"
          : "min-w-[7rem] sm:min-w-[8rem] md:min-w-[9rem] lg:min-w-[10rem] xl:min-w-[13rem] max-w-[7rem] sm:max-w-[8rem] md:max-w-[9rem] lg:max-w-[10rem] xl:max-w-[13rem] rounded-lg p-1.5 sm:p-2 md:p-2.5 lg:p-3 xl:p-4"
      } transition-colors duration-200 ${dimmed ? "opacity-50" : "opacity-100"}`}
      style={{
        background: "color-mix(in srgb, var(--page-surface) 94%, black)",
        color: "var(--page-text)",
      }}
    >
      <AnimatedText
        text={title}
        className={isMobile ? "text-sm" : "text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg"}
      />
      <div
        className={
          isMobile
            ? "mt-1 text-[9px] leading-relaxed"
            : "mt-0.5 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs leading-relaxed"
        }
        style={{ color: "var(--page-text-muted)" }}
      >
        <AnimatedText text={description} />
      </div>
    </a>
  );
}

function Badge({
  label,
  isMobile = false,
}: {
  label: string;
  isMobile?: boolean;
}) {
return (
    <div
      style={{
        width: isMobile ? "58px" : "45px",
        paddingLeft: isMobile ? "6px" : "5px",
        paddingRight: isMobile ? "6px" : "5px",
        paddingTop: isMobile ? "5px" : "4px",
        paddingBottom: isMobile ? "5px" : "4px",
        background: "color-mix(in srgb, var(--page-surface) 94%, black)",
        overflow: "hidden",
        borderRadius: "30px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "4px",
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
          fontSize: isMobile ? "10px" : "9px",
          fontFamily: "Young Serif",
        }}
      >
        {label}
      </div>
    </div>
  );
}
