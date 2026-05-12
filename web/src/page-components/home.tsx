"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { PrintRoot } from "@/components/brief/print/PrintRoot";
import { ServicesSection } from "@/components/brief/desktop/sections/ServicesSection";
import { Info } from "@/components/Info";
import Ascii from "@/components/Ascii";
import { Light } from "@/components/Light";
import { SiteNav } from "@/components/SiteNav";
import { PortfolioCaseStudies } from "@/components/site/PortfolioCaseStudies";
import { PortfolioPillars } from "@/components/site/PortfolioPillars";
import { HomePrintRoot } from "@/components/home/print/HomePrintRoot";
import { formatNowMarkdown } from "@/lib/format-now-markdown";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

export default function Home({
  readme,
  nowMarkdown,
  initialHash,
  printLayout = "resume",
}: {
  readme: ReadmeBundle;
  nowMarkdown: string | null;
  initialHash?: string | null;
  printLayout?: "resume" | "brief";
}) {
  const { track, colors, ready, lastFmUsername } = useLastFmVisualData();
  const dayTheme = useHongKongDayTheme();
  const [nowMode, setNowMode] = useState(false);

  useLayoutEffect(() => {
    document.documentElement.classList.add("snap-home");
    return () => {
      document.documentElement.classList.remove("snap-home");
    };
  }, []);

  useLayoutEffect(() => {
    if (!initialHash) return;
    const el = document.getElementById(initialHash);
    if (!el) return;
    el.scrollIntoView({ block: "start", behavior: "auto" });
  }, [initialHash]);

  useEffect(() => {
    if (!nowMode) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNowMode(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nowMode]);

  if (nowMode && nowMarkdown) {
    return (
      <>
        <div
          className="screen-only fixed inset-0 z-[200] h-dvh overflow-auto"
          style={dayTheme.style}
        >
          <Light
            scene={dayTheme.shader}
            className="pointer-events-none fixed inset-0 z-0 h-full w-full"
          />
          <button
            type="button"
            className="absolute left-4 top-4 z-20 cursor-pointer border-none bg-transparent p-0 text-[10px] uppercase tracking-[0.22em] underline underline-offset-4"
            style={{ color: "var(--page-text-muted)" }}
            onClick={() => setNowMode(false)}
          >
            back
          </button>
          <article
            className="relative z-10 mx-auto max-w-lg px-6 pb-16 pt-20 text-sm leading-relaxed [font-family:var(--font-jetbrains-mono),monospace]"
            style={{ color: "var(--page-text)" }}
          >
            {formatNowMarkdown(nowMarkdown)}
          </article>
        </div>
        {printLayout === "resume" ? <HomePrintRoot /> : <PrintRoot />}
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <div
        className="screen-only site-shell relative min-h-dvh sm:min-h-dvh"
        style={dayTheme.style}
      >
        <Light
          scene={dayTheme.shader}
          className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        />

        <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
          <Ascii
            colors={colors}
            track={track}
            ready={ready}
            lastFmUsername={lastFmUsername}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-24 pt-5 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
          <div className="min-w-0 space-y-0">
            <Info
              colors={colors}
              dayTheme={dayTheme}
              readme={readme}
              nowMarkdown={nowMarkdown}
              onOpenNow={() => setNowMode(true)}
              slice="intro"
            />
            <ServicesSection embedded />
            <PortfolioCaseStudies />
            <PortfolioPillars readme={readme} />
            <Info
              colors={colors}
              dayTheme={dayTheme}
              readme={readme}
              nowMarkdown={nowMarkdown}
              onOpenNow={() => setNowMode(true)}
              slice="folio"
            />
            <Info
              colors={colors}
              dayTheme={dayTheme}
              readme={readme}
              nowMarkdown={nowMarkdown}
              onOpenNow={() => setNowMode(true)}
              slice="bio"
            />
          </div>
        </div>
      </div>
      {printLayout === "resume" ? <HomePrintRoot /> : <PrintRoot />}
    </>
  );
}
