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

export function Info({ colors }: { colors: string[] }) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [nameHovered, setNameHovered] = useState(false);
  const [displayName, setDisplayName] = useState("max carter");
  const [nameVisible, setNameVisible] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setLoaded(true));

    const scrollOffsetRef = { current: 0, revealed: false };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollOffsetRef.current = Math.max(0, scrollOffsetRef.current + e.deltaY * 1.5);
      const shouldBeRevealed = scrollOffsetRef.current > window.innerHeight * 0.3;
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
      opacity: revealed ? 0.7 : 1,
      transition: "opacity 0.5s ease-out",
    };
  }, [revealed]);

  const lowerStyle = useMemo(() => {
    if (!revealed) {
      return { maxHeight: "0rem", opacity: 0, transform: "translateY(1.5rem)" };
    }

    return { maxHeight: "120rem", opacity: 1, transform: "translateY(0rem)" };
  }, [revealed]);

  return (
    <div className="min-h-[210dvh] bg-black px-8 pb-24 text-white">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="flex h-full w-full max-w-[42rem] flex-col justify-center">
          <div className="transition-all duration-500 ease-out" style={heroStyle}>
            <div className="space-y-3">
              <h1 className="text-4xl leading-tight md:text-5xl">
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
              <p className={`text-2xl text-white/82 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
                <AnimatedText text="i make" className="inline-block" split="chars" />{" "}
                <MorphWord words={thingWords} />{" "}
                <AnimatedText text="for" className="inline-block" split="chars" />{" "}
                <ScatterWord word="people" colors={colors} />
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <AnimatedText text="here's my:" className="text-lg text-white/58" />
              <div className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
                <CarouselRow>
                {socials.map((social) => {
                  const active = hoveredPill === social.name;

                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="relative block h-[4.5rem] min-w-[8.75rem] overflow-hidden rounded-full"
                      onMouseEnter={() => setHoveredPill(social.name)}
                      onMouseLeave={() => setHoveredPill(null)}
                    >
                      <div className="relative flex h-full items-center justify-center rounded-full bg-[#191919] px-4">
                        <span
                          className="text-center text-lg leading-none transition-all duration-300"
                          style={{ transform: active ? "translateY(-0.48rem)" : "translateY(0)" }}
                        >
                          <AnimatedText text={social.name} className="inline-block" split="chars" />
                        </span>
                        <span
                          className="absolute left-1/2 top-1/2 max-w-[calc(100%-1rem)] overflow-hidden text-ellipsis whitespace-nowrap text-center text-[11px] leading-none text-white/72 transition-all duration-300"
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
                  className="font-mono text-[11px] tracking-[0.08em] text-white/36 motion-safe:animate-bounce"
                  split="chars"
                />
              )}
            </div>
          </div>

          <div className="mt-8 overflow-hidden transition-all duration-500 ease-out" style={lowerStyle}>
            <div className="space-y-8 pt-0">
              {revealed ? (
                <RandomizedText key="lower-text" split="words" className="text-xl leading-relaxed text-white">
                  {introText}
                </RandomizedText>
              ) : (
                <div className="text-xl leading-relaxed text-white opacity-0">{introText}</div>
              )}

              <Section title="i make utilities that feel inevitable:">
                {products.map((product) => (
                  <Card key={product.name} title={product.name} description={product.desc} href={product.href} />
                ))}
              </Section>

              <Section title="the works:">
                {languages.map((item) => (
                  <Badge key={item} label={item} />
                ))}
              </Section>

              <Section title="the transport:">
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
                        width: 130,
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingTop: 10,
                        paddingBottom: 10,
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
                          fontSize: 20,
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
    <div className="relative">
      <div ref={ref} className="overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max flex-nowrap gap-2">{children}</div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent transition-opacity duration-200"
        style={{ opacity: showLeft ? 1 : 0 }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-black to-transparent transition-opacity duration-200"
        style={{ opacity: showRight ? 1 : 0 }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <AnimatedText text={title} className="text-xl text-white" />
      <CarouselRow>{children}</CarouselRow>
    </div>
  );
}

function Card({
  title,
  description,
  href,
  dimmed = false,
}: {
  title: string;
  description: string;
  href: string;
  dimmed?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`min-w-[13rem] max-w-[13rem] rounded-2xl bg-[#191919] p-3 transition-colors duration-200 hover:bg-[#232323] ${dimmed ? "opacity-50" : "opacity-100"}`}
    >
      <AnimatedText text={title} className="text-xl text-white" />
      <div className="mt-2 text-xs leading-relaxed text-white/70">
        <AnimatedText text={description} />
      </div>
    </a>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <div
      style={{
        width: 130,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        background: "#191919",
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
          fontSize: 20,
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
