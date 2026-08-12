"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Info } from "@/components/Info";
import { formatNowMarkdown } from "@/lib/format-now-markdown";
import Ascii from "@/components/Ascii";
import { Light } from "@/components/Light";
import { SiteNav } from "@/components/SiteNav";
import { useNowMarkdown, useRemoteReadme } from "@/hooks/use-remote-content";
import { useSiteVisualEffects } from "@/hooks/use-site-visual-effects";
import {
  clearSitePrintTarget,
  printSitePdf,
  type SitePrintTarget,
} from "@/lib/site-print";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";
import { fetchResumeMarkdownCached } from "@/lib/remote-markdown";

const HomePrintRoot = dynamic(
  () =>
    import("@/components/home/print/HomePrintRoot").then(
      (m) => m.HomePrintRoot,
    ),
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
  const animateWeather =
    visualEffects ||
    dayTheme.shader.weatherKind === "rain" ||
    dayTheme.shader.weatherKind === "storm";
  const now = useNowMarkdown();
  const { readme: activeReadme, refreshReadme } = useRemoteReadme(readme);
  const [nowArticleOpen, setNowArticleOpen] = useState(false);
  const [printMounted, setPrintMounted] = useState(false);

  const toggleNowArticle = useCallback(() => {
    if (!now.article) return;
    setNowArticleOpen((open) => !open);
  }, [now.article]);

  useEffect(() => {
    void import("@/components/home/print/HomePrintRoot");
    setPrintMounted(true);
  }, []);

  const runPrint = useCallback(
    async (target: SitePrintTarget) => {
      // For resume print, force refresh to get latest content
      if (target === "resume") {
        await Promise.all([
          fetchResumeMarkdownCached({ forceRefresh: true }),
          refreshReadme({ forceRefresh: true }),
        ]);
      }
      if (!printMounted) setPrintMounted(true);
      await printSitePdf(target);
    },
    [printMounted, refreshReadme],
  );

  useEffect(() => {
    const onAfterPrint = () => clearSitePrintTarget();
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const printLayers = printMounted ? (
    <>
      <div className="print-only print-layer-resume" aria-hidden>
        <HomePrintRoot readme={activeReadme} />
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
    if (!nowArticleOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNowArticleOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nowArticleOpen]);

  useEffect(() => {
    if (!now.article) setNowArticleOpen(false);
  }, [now.article]);

  const mainColumn =
    nowArticleOpen && now.article ? (
      <article
        className="relative z-10 mx-auto max-w-lg px-5 pb-24 pt-6 text-sm leading-relaxed [font-family:var(--font-jetbrains-mono),monospace] sm:px-8 lg:px-10"
        style={{ color: "var(--page-text)" }}
      >
        {formatNowMarkdown(now.article)}
      </article>
    ) : (
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-24 pt-5 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
        <div className="min-w-0 space-y-0">
          <Info
            colors={colors}
            dayTheme={dayTheme}
            readme={activeReadme}
            now={now}
            nowArticleOpen={nowArticleOpen}
            onToggleNowArticle={toggleNowArticle}
            slice="intro"
          />
          <Info
            getTransportStyle={dayTheme.getTransportStyle}
            readme={activeReadme}
            now={now}
            slice="folio"
          />
          <Info
            getTransportStyle={dayTheme.getTransportStyle}
            readme={activeReadme}
            now={now}
            slice="bio"
          />
        </div>
      </div>
    );

  return (
    <>
      {!nowArticleOpen ? (
        <SiteNav onPrintResume={() => runPrint("resume")} />
      ) : null}
      <div
        className="screen-only site-shell relative min-h-dvh sm:min-h-dvh"
        style={dayTheme.style}
      >
        <Light
          scene={dayTheme.shader}
          animated={animateWeather}
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

        {mainColumn}
      </div>
      {printLayers}
    </>
  );
}