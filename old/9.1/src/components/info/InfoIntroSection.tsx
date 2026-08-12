"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "motion/react";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import type { NowContent } from "@/lib/parse-now-markdown";
import { ClockPanel } from "@/components/ClockPanel";
import { TILE_LINK_HOVER } from "@/components/brief/ui/constants";
import {
  REVEAL_EASE,
  hoverNames,
  thingWords,
} from "@/components/info/constants";
import {
  AnimatedText,
  MorphWord,
  ScatterWord,
} from "@/components/info/hero-effects";

export function InfoIntroSection({
  colors,
  dayTheme,
  now,
  nowArticleOpen,
  onToggleNowArticle,
  socials,
}: {
  colors: string[];
  dayTheme?: HongKongDayTheme;
  now: NowContent;
  nowArticleOpen?: boolean;
  onToggleNowArticle?: () => void;
  socials: Array<{ name: string; href: string; username: string }>;
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [nameHovered, setNameHovered] = useState(false);
  const [displayName, setDisplayName] = useState("max carter");
  const [nameVisible, setNameVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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
        setDisplayName(hoverNames[index]!);
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

  const displayNameStyle = useMemo<CSSProperties>(
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

  const socialPills = (
    <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-3">
      {socials.map((social) => {
        const active = hoveredPill === social.name;
        return (
          <a
            key={social.name}
            href={social.href}
            target={social.href.startsWith("http") ? "_blank" : undefined}
            rel={
              social.href.startsWith("http") ? "noopener noreferrer" : undefined
            }
            className="relative block h-11 min-h-11 min-w-0 w-full rounded-full px-2.5 sm:h-12 sm:min-h-12 sm:px-3.5"
            onMouseEnter={() => setHoveredPill(social.name)}
            onMouseLeave={() => setHoveredPill(null)}
          >
            <div
              className={`relative flex h-full w-full items-center justify-center rounded-full px-2 sm:px-2.5 ${TILE_LINK_HOVER} hover:brightness-105`}
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
                className={`pointer-events-none absolute inset-x-2 bottom-1.5 text-center font-mono text-[9px] leading-tight transition-all duration-300 sm:inset-x-2.5 sm:bottom-2 sm:text-[10px] ${
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

  return (
    <section
      id="start"
      className="scroll-mt-20 relative flex min-h-[calc(100svh-9.5rem)] snap-start snap-always flex-col sm:min-h-[calc(100svh-10rem)]"
    >
      <div className="relative z-[80] flex min-h-0 w-full max-w-5xl flex-1 flex-col pr-2 pb-6 sm:pb-8 sm:pr-36 lg:pr-44">
        {dayTheme ? (
          <ClockPanel
            dayTheme={dayTheme}
            now={now}
            nowArticleOpen={nowArticleOpen ?? false}
            onToggleNowArticle={onToggleNowArticle}
            hydrated={hydrated}
          />
        ) : null}
        <div className="min-h-0 flex-1" aria-hidden />
        <motion.div
          className="w-full shrink-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-48px" }}
          transition={{ duration: 0.65, ease: REVEAL_EASE }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}