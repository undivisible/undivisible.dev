"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ServicesSection } from "@/components/brief/desktop/sections/ServicesSection";
import { Info } from "@/components/Info";
import Ascii from "@/components/Ascii";
import { Light } from "@/components/Light";
import { SiteNav } from "@/components/SiteNav";
import { PortfolioCaseStudies } from "@/components/site/PortfolioCaseStudies";
import { PortfolioPillars } from "@/components/site/PortfolioPillars";
import { formatNowMarkdown } from "@/lib/format-now-markdown";
import { useSiteVisualEffects } from "@/hooks/use-site-visual-effects";
import {
  clearSitePrintTarget,
  printSitePdf,
  type SitePrintTarget,
} from "@/lib/site-print";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

const HomePrintRoot = dynamic(
  () =>
    import("@/components/home/print/HomePrintRoot").then((m) => m.HomePrintRoot),
  { ssr: false },
);
const PrintRoot = dynamic(
  () => import("@/components/brief/print/PrintRoot").then((m) => m.PrintRoot),
  { ssr: false },
);

export default function Home({
  readme,
  nowMarkdown,
  initialHash,
}: {
  readme: ReadmeBundle;
  nowMarkdown: string | null;
  initialHash?: string | null;
}) {
  const { track, colors, ready, lastFmUsername } = useLastFmVisualData();
  const dayTheme = useHongKongDayTheme();
  const visualEffects = useSiteVisualEffects();
  const [nowMode, setNowMode] = useState(false);
  const [printMounted, setPrintMounted] = useState(false);

  useEffect(() => {
    void import("@/components/home/print/HomePrintRoot");
    void import("@/components/brief/print/PrintRoot");
    setPrintMounted(true);
  }, []);

  const runPrint = useCallback(async (target: SitePrintTarget) => {
    if (!printMounted) setPrintMounted(true);
    await printSitePdf(target);
  }, [printMounted]);

  useEffect(() => {
    const onAfterPrint = () => clearSitePrintTarget();
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const printLayers = printMounted ? (
    <>
      <div className="print-only print-layer-resume" aria-hidden>
        <HomePrintRoot />
      </div>
      <div className="print-only print-layer-brief" aria-hidden>
        <PrintRoot />
      </div>
    </>
  ) : null;

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
            animated={visualEffects}
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
        {printLayers}
      </>
    );
  }

  return (
    <>
      <SiteNav
        onPrintResume={() => runPrint("resume")}
        onPrintBrief={() => runPrint("brief")}
      />
      <div
        className="screen-only site-shell relative min-h-dvh sm:min-h-dvh"
        style={dayTheme.style}
      >
        <Light
          scene={dayTheme.shader}
          animated={visualEffects}
          className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        />

        <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
          {visualEffects ? (
            <Ascii
              colors={colors}
              track={track}
              ready={ready}
              lastFmUsername={lastFmUsername}
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-black/[0.58] via-black/[0.5] to-black/[0.62]"
            />
          )}
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
              getTransportStyle={dayTheme.getTransportStyle}
              readme={readme}
              nowMarkdown={nowMarkdown}
              onOpenNow={() => setNowMode(true)}
              slice="folio"
            />
            <Info
              colors={colors}
              getTransportStyle={dayTheme.getTransportStyle}
              readme={readme}
              nowMarkdown={nowMarkdown}
              onOpenNow={() => setNowMode(true)}
              slice="bio"
            />
          </div>
        </div>
      </div>
      {printLayers}
    </>
  );
}
