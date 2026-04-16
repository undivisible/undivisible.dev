"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RandomizedText } from "./randomized-text";

const socials = [
  { name: "instagram", username: "@undivisible.dev", href: "https://instagram.com/undivisible.dev" },
  { name: "twitter", username: "@makethings4ppl", href: "https://twitter.com/makethings4ppl" },
  { name: "email", username: "max@undivisible.dev", href: "mailto:max@undivisible.dev" },
  { name: "github", username: "undivisible", href: "https://github.com/undivisible" },
];

const hoverNames = ["祁明思", "максим картер", "チー・ミンスー", "مكس الكعطار", "מאקסימ קרתר"];
const thingWords = ["things", "software", "systems", "products", "tools"];

const introText = `my favorite thing is chasing new experiences and sharing them with others. i do that through software, which i've been building since i was 8. i'm drawn to the frontier, i started making money online and playing with crypto at 11, and i was one of the first to try gpt-3 in 2021. since then, i dropped out of high school and founded tsc.hk, where i make the frontier. outside of that, i adore philosophy, cooking, photography, and gym.`;

const products = [
  { name: "crepuscularity", desc: "code web, get native, on every device + web.", href: "https://crepuscularity.undivisible.dev" },
  { name: "crepus lite", desc: "native ui for any electron project or website", href: "https://github.com/semitechnological/crepuscularity-lite" },
  { name: "equilibrium", desc: "FFI for C compiling langs, or Swift in 2 lines.", href: "https://github.com/semitechnological/equilibrium" },
  { name: "wax", desc: "brew but 20x faster, with support for scoop + winget.", href: "https://github.com/semitechnological/wax" },
  { name: "otto", desc: "ai powered ottocomplete everywhere on your mac.", href: "https://github.com/semitechnological/otto" },
  { name: "tile", desc: "canvas, mosaic and tiling window management.", href: "https://github.com/semitechnological/tile" },
];

const languages = ["rust", "typescript", "python", "go", "v", "zig"];
const transport = ["cantonese", "english", "russian", "mandarin", "indonesian", "japanese"];

const tidbits = [
  { name: "unthinkmail", desc: "mcp your imap supported email", href: "https://unthinkmail.undivisible.dev" },
  { name: "drift", desc: "the macos screensaver as a wallpaper on every device", href: "https://github.com/undivisible/drift-wallpaper" },
  { name: "bublik", desc: "frequency terrain noise generator", href: "https://bublik.undivisible.dev" },
  { name: "alphabets", desc: "learn unicode-supported alphabets.", href: "https://alphabets.undivisible.dev" },
  { name: "anywhere", desc: "web extension for online ai to code inline interactions", href: "https://github.com/undivisible/anywhere" },
  { name: "poke around", desc: "let poke around your computer", href: "https://github.com/undivisible/poke-around" },
  { name: "unthinkclaw", desc: "openclaw but tiny, with agent swarms and online saas.", href: "https://github.com/undivisible/unthinkclaw" },
  { name: "standpoint", desc: "the opinion based platform with tierlists and polls", href: "https://github.com/undivisible/standpoint", opacity: 50 },
  { name: "infrastruct", desc: "comparative jurisprudence platform for major religions", href: "https://github.com/undivisible/infrastruct", opacity: 50 },
  { name: "akh", desc: "software uniplatform for when i was muslim", href: "https://github.com/undivisible/akh", opacity: 50 },
];

interface InfoProps {
  colors: string[];
  revealed?: boolean;
  setRevealed?: (revealed: boolean) => void;
}

export function Info({ colors, revealed: revealedProp = false, setRevealed: setRevealedProp }: InfoProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [nameHovered, setNameHovered] = useState(false);
  const [displayName, setDisplayName] = useState("max carter");
  const [nameVisible, setNameVisible] = useState(true);
  const [revealed, setRevealed] = useState(revealedProp);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setRevealed(revealedProp);
  }, [revealedProp]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setLoaded(true));

    const scrollOffsetRef = { current: 0, revealed: false };

    const handleWheel = (e: WheelEvent) => {
      const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!isHorizontalScroll) {
        e.preventDefault();
        scrollOffsetRef.current = Math.max(0, scrollOffsetRef.current + e.deltaY * 1.5);
        const shouldBeRevealed = scrollOffsetRef.current > window.innerHeight * 0.3;
        if (shouldBeRevealed !== scrollOffsetRef.revealed) {
          scrollOffsetRef.revealed = shouldBeRevealed;
          setRevealed(shouldBeRevealed);
          setRevealedProp?.(shouldBeRevealed);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [setRevealedProp]);

  useEffect(() => {
    if (!nameHovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setNameVisible(false);
      const timeout = window.setTimeout(() => {
        setDisplayName("max carter");
        setNameVisible(true);
      }, 380);
      return () => clearTimeout(timeout);
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

  const heroStyle = useMemo(() => {
    return {
      opacity: revealed ? 0 : 1,
      transform: revealed ? "translateY(-110vh)" : "translateY(0)",
      transition: "opacity 0.5s ease-out, transform 0.6s ease-out",
    };
  }, [revealed]);

  const lowerStyle = useMemo(() => {
    if (!revealed) {
      return { maxHeight: "0rem", opacity: 0, transform: "translateY(1.5rem)" };
    }

    return { maxHeight: "120rem", opacity: 1, transform: "translateY(0rem)" };
  }, [revealed]);

  if (isMobile) {
    return (
      <div className="relative h-dvh w-full overflow-y-hidden text-white">
        <div className="sticky top-0 h-dvh overflow-y-hidden">
          <div
            className="h-[200dvh] w-full transition-transform duration-700 ease-out"
            style={{ transform: revealed ? "translateY(-100dvh)" : "translateY(0)" }}
          >
            <section className="flex h-dvh w-full items-center">
              <div className="w-full min-w-0 max-w-full">
                <div className="transition-all duration-500 ease-out" style={heroStyle}>
                  <div className="space-y-3 px-4">
                    <h1 className="break-words text-2xl leading-tight">
                      <AnimatedText text="hi, i'm" className="inline-block" split="chars" />{" "}
                      <span
                        className="inline-block transition-opacity duration-500"
                        style={{ opacity: nameVisible ? (loaded ? 1 : 0) : 0 }}
                        onMouseEnter={() => setNameHovered(true)}
                        onMouseLeave={() => setNameHovered(false)}
                      >
                        {displayName}
                      </span>
                    </h1>
                    <p className={`max-w-full break-words text-sm text-white/82 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
                      <AnimatedText text="i make" className="inline-block" split="chars" />{" "}
                      <MorphWord words={thingWords} />{" "}
                      <AnimatedText text="for" className="inline-block" split="chars" />{" "}
                      <ScatterWord word="people" colors={colors} />
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="px-4"><AnimatedText text="here's my:" className="text-base text-white/58" /></div>
                    <div className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
                      <CarouselRow>
                      {socials.map((social) => {
                        const active = hoveredPill === social.name;

                        const pillClass = "h-10 min-w-[5rem]";
                        const textClass = "text-sm";

                        return (
                          <a
                            key={social.name}
                            href={social.href}
                            className={`relative block overflow-hidden rounded-full ${pillClass}`}
                            onMouseEnter={() => setHoveredPill(social.name)}
                            onMouseLeave={() => setHoveredPill(null)}
                          >
                            <div className={`relative flex h-full items-center justify-center rounded-full bg-white/10 px-2`}>
                              <span
                                className={`text-center leading-none transition-all duration-300 ${textClass}`}
                                style={{ transform: active ? "translateY(-0.48rem)" : "translateY(0)" }}
                              >
                                <AnimatedText text={social.name} className="inline-block" split="chars" />
                              </span>
                              <span
                                className={`absolute left-1/2 top-1/2 max-w-[calc(100%-1rem)] overflow-hidden text-ellipsis whitespace-nowrap text-center leading-none text-white/72 transition-all duration-300 text-[9px]`}
                                style={{
                                  transform: active ? "translate(-50%, 0.62rem)" : "translate(-50%, -50%)",
                                  opacity: active ? 1 : 0,
                                  filter: active ? "blur(0px)" : "blur(8px)",
                                }}
                              >
                                <AnimatedText text={social.username} className="inline-block" split="chars" />
                              </span>
                            </div>
                          </a>
                        );
                      })}
                      </CarouselRow>
                    </div>

                    {!revealed && (
                      <div className="px-4">
                        <AnimatedText
                          text="swipe up to learn more"
                          className="font-mono text-[10px] tracking-[0.08em] text-white/36 motion-safe:animate-bounce"
                          split="chars"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="flex h-dvh w-full items-center">
              <div className="w-full min-w-0 max-w-full">
                <div className="flex min-h-dvh w-full items-center overflow-y-hidden transition-all duration-500 ease-out" style={lowerStyle}>
                  <div className="space-y-6 pt-0">
                    {revealed ? (
                      <div className="px-4">
                        <RandomizedText key="lower-text" split="words" className="break-words text-sm leading-relaxed text-white">
                          {introText}
                        </RandomizedText>
                      </div>
                    ) : (
                      <div className="px-4 break-words text-sm leading-relaxed text-white opacity-0">{introText}</div>
                    )}

                    <Section title="i make utilities that feel inevitable:" isMobile={true}>
                      {products.map((product) => (
                        <Card key={product.name} title={product.name} description={product.desc} href={product.href} isMobile={true} />
                      ))}
                    </Section>

                    <Section title="the works:" isMobile={true}>
                      {languages.map((item) => (
                        <Badge key={item} label={item} isMobile={true} />
                      ))}
                    </Section>

                    <Section title="the transport:" isMobile={true}>
                      {transport.map((item) => {
                        const bgColors: Record<string, string> = {
                          cantonese: "#16221B",
                          english: "#16221B",
                          russian: "#1C2216",
                          mandarin: "#221F16",
                          indonesian: "#221816",
                          japanese: "#221616",
                        };
                        const bg = bgColors[item] ?? "#16221B";
                        return (
                          <div
                            key={item}
                            style={{
                              width: 84,
                              paddingLeft: 8,
                              paddingRight: 8,
                              paddingTop: 6,
                              paddingBottom: 6,
                              background: bg,
                              overflow: "hidden",
                              borderRadius: 30,
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: 5,
                              display: "inline-flex",
                            }}
                          >
                            <div
                              style={{
                                justifyContent: "center",
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                                fontSize: 12,
                                fontFamily: "Young Serif",
                                fontWeight: 400,
                                wordWrap: "break-word",
                                textAlign: item === "indonesian" || item === "japanese" ? "center" : "left",
                              }}
                            >
                              {item}
                            </div>
                          </div>
                        );
                      })}
                    </Section>

                    <Section title="cool tidbits:" isMobile={true}>
                      {tidbits.map((tidbit) => (
                        <Card
                          key={tidbit.name}
                          title={tidbit.name}
                          description={tidbit.desc}
                          href={tidbit.href}
                          dimmed={tidbit.opacity === 50}
                          isMobile={true}
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
    <div className="min-h-[210dvh] bg-transparent px-4 md:px-8 pb-12 md:pb-24 text-white w-full max-w-full overflow-x-hidden">
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center lg:justify-start overflow-hidden">
        <div className="flex h-full w-full min-w-0 max-w-full flex-col justify-center items-center lg:items-start lg:max-w-[42rem] lg:mx-0">
          <div className="transition-all duration-500 ease-out" style={heroStyle}>
            <div className="space-y-3 max-w-full">
              <h1 className="max-w-full break-words text-2xl leading-tight md:text-5xl">
                <AnimatedText text="hi, i'm" className="inline-block" split="chars" />{" "}
                <span
                  className="inline-block transition-opacity duration-500"
                  style={{ opacity: nameVisible ? (loaded ? 1 : 0) : 0 }}
                  onMouseEnter={() => setNameHovered(true)}
                  onMouseLeave={() => setNameHovered(false)}
                >
                  {displayName}
                </span>
              </h1>
              <p className={`max-w-full break-words text-sm md:text-2xl text-white/82 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
                <AnimatedText text="i make" className="inline-block" split="chars" />{" "}
                <MorphWord words={thingWords} />{" "}
                <AnimatedText text="for" className="inline-block" split="chars" />{" "}
                <ScatterWord word="people" colors={colors} />
              </p>
            </div>

            <div className="mt-8 space-y-4 max-w-full">
              <AnimatedText text="here's my:" className="text-base md:text-lg text-white/58" />
              <div className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
                <CarouselRow>
                {socials.map((social) => {
                  const active = hoveredPill === social.name;

                  const pillClass = isMobile 
                    ? "h-10 min-w-[5rem]" 
                    : "h-[4.5rem] min-w-[8.75rem]";
                  const textClass = isMobile ? "text-sm" : "text-lg";

                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`relative block overflow-hidden rounded-full ${pillClass}`}
                      onMouseEnter={() => setHoveredPill(social.name)}
                      onMouseLeave={() => setHoveredPill(null)}
                    >
                      <div className={`relative flex h-full items-center justify-center rounded-full ${isMobile ? "bg-white/10" : "bg-[#191919]"} ${isMobile ? "px-2" : "px-4"}`}>
                        <span
                          className={`text-center leading-none transition-all duration-300 ${textClass}`}
                          style={{ transform: active ? "translateY(-0.48rem)" : "translateY(0)" }}
                        >
                          <AnimatedText text={social.name} className="inline-block" split="chars" />
                        </span>
                        <span
                          className={`absolute left-1/2 top-1/2 max-w-[calc(100%-1rem)] overflow-hidden text-ellipsis whitespace-nowrap text-center leading-none text-white/72 transition-all duration-300 ${isMobile ? "text-[9px]" : "text-[11px]"}`}
                          style={{
                            transform: active ? "translate(-50%, 0.62rem)" : "translate(-50%, -50%)",
                            opacity: active ? 1 : 0,
                            filter: active ? "blur(0px)" : "blur(8px)",
                          }}
                        >
                          <AnimatedText text={social.username} className="inline-block" split="chars" />
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
                    className="font-mono text-[10px] md:text-[11px] tracking-[0.08em] text-white/36 motion-safe:animate-bounce"
                    split="chars"
                  />
              )}
            </div>
          </div>

          <div className="mt-8 flex min-h-[calc(100vh-16rem)] w-full items-center overflow-hidden transition-all duration-500 ease-out max-w-full" style={lowerStyle}>
            <div className="space-y-6 pt-0 max-w-full">
              {revealed ? (
                <RandomizedText key="lower-text" split="words" className="max-w-full break-words text-sm md:text-xl leading-relaxed text-white">
                  {introText}
                </RandomizedText>
              ) : (
                <div className="max-w-full break-words text-sm md:text-xl leading-relaxed text-white opacity-0">{introText}</div>
              )}

              <Section title="i make utilities that feel inevitable:" isMobile={isMobile}>
                {products.map((product) => (
                  <Card key={product.name} title={product.name} description={product.desc} href={product.href} isMobile={isMobile} />
                ))}
              </Section>

              <Section title="the works:" isMobile={isMobile}>
                {languages.map((item) => (
                  <Badge key={item} label={item} isMobile={isMobile} />
                ))}
              </Section>

              <Section title="the transport:" isMobile={isMobile}>
                {transport.map((item) => {
                  const bgColors: Record<string, string> = {
                    cantonese: "#16221B",
                    english: "#16221B",
                    russian: "#1C2216",
                    mandarin: "#221F16",
                    indonesian: "#221816",
                    japanese: "#221616",
                  };
                  const bg = bgColors[item] ?? "#16221B";
                  const isItemMobile = isMobile;
                  return (
                    <div
                      key={item}
                      style={{
                        width: isItemMobile ? 84 : 130,
                        paddingLeft: isItemMobile ? 8 : 15,
                        paddingRight: isItemMobile ? 8 : 15,
                        paddingTop: isItemMobile ? 6 : 10,
                        paddingBottom: isItemMobile ? 6 : 10,
                        background: bg,
                        overflow: "hidden",
                        borderRadius: 30,
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 5,
                        display: "inline-flex",
                      }}
                    >
                      <div
                        style={{
                          justifyContent: "center",
                          display: "flex",
                          flexDirection: "column",
                          color: "white",
                          fontSize: isItemMobile ? 12 : 20,
                          fontFamily: "Young Serif",
                          fontWeight: 400,
                          wordWrap: "break-word",
                          textAlign: item === "indonesian" || item === "japanese" ? "center" : "left",
                        }}
                      >
                        {item}
                      </div>
                    </div>
                  );
                })}
              </Section>

              <Section title="cool tidbits:" isMobile={isMobile}>
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
      setIndex(0);
      setVisible(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
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
      className="inline-block text-white transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0.32 }}
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
    <span className="inline-flex cursor-default" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {word.split("").map((letter, index) => {
        const transform = transforms[index];
        return (
          <span key={`${letter}-${index}`} className="relative inline-block overflow-visible px-[0.01em]">
            <span
              className="inline-block transition-all duration-500 ease-out"
              style={{
                transform: hovered
                  ? `translate(${transform.x}px, ${transform.y}px) rotate(${transform.r}deg)`
                  : "translate(0px, 0px) rotate(0deg)",
                color: hovered ? transform.color : "rgba(255,255,255,0.92)",
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

function CarouselRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const max = node.scrollWidth - node.clientWidth;
      setShowLeft(node.scrollLeft > 1);
      setShowRight(max - node.scrollLeft > 1);
    };

    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full max-w-full">
      <div ref={ref} className="overflow-x-auto overflow-y-hidden pb-2 pr-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max flex-nowrap gap-2">{children}</div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent to-transparent transition-opacity duration-200 lg:from-black lg:to-transparent"
        style={{ opacity: showLeft ? 1 : 0 }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-transparent to-transparent transition-opacity duration-200 lg:from-black lg:to-transparent"
        style={{ opacity: showRight ? 1 : 0 }}
      />
    </div>
  );
}

function Section({ title, children, isMobile = false }: { title: string; children: React.ReactNode; isMobile?: boolean }) {
  return (
    <div className="space-y-4">
      <div className={isMobile ? "px-4" : ""}>
        <AnimatedText text={title} className={isMobile ? "text-sm text-white" : "text-xl text-white"} />
      </div>
      <CarouselRow>{children}</CarouselRow>
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
      className={`${isMobile ? "min-w-[9rem] max-w-[9rem] rounded-xl p-2 bg-white/10" : "min-w-[13rem] max-w-[13rem] rounded-2xl bg-[#191919] p-3"} transition-colors duration-200 hover:bg-white/20 ${dimmed ? "opacity-50" : "opacity-100"}`}
    >
      <AnimatedText text={title} className={isMobile ? "text-sm text-white" : "text-xl text-white"} />
      <div className={isMobile ? "mt-1 text-[8px] leading-relaxed text-white/70" : "mt-2 text-xs leading-relaxed text-white/70"}>
        <AnimatedText text={description} />
      </div>
    </a>
  );
}

function Badge({ label, isMobile = false }: { label: string; isMobile?: boolean }) {
  const width = isMobile ? 68 : 130;
  const padding = isMobile ? 8 : 15;
  const fontSize = isMobile ? 11 : 20;
  
  return (
    <div
      style={{
        width,
        paddingLeft: padding,
        paddingRight: padding,
        paddingTop: isMobile ? 6 : 10,
        paddingBottom: isMobile ? 6 : 10,
        background: isMobile ? "rgba(255,255,255,0.1)" : "#191919",
        overflow: "hidden",
        borderRadius: 30,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
        display: "inline-flex",
      }}
    >
      <div
        style={{
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          color: "white",
          fontSize,
          fontFamily: "Young Serif",
          fontWeight: 400,
          wordWrap: "break-word",
        }}
      >
        {label}
      </div>
    </div>
  );
}
