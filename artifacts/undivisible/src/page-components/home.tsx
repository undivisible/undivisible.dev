"use client";

import { useEffect, useState } from "react";

import { Info } from "@/components/Info";
import Ascii from "@/components/Ascii";
import { Light } from "@/components/Light";
import { PrintActions } from "@/components/PrintActions";
import { HomePrintRoot } from "@/components/home/print/HomePrintRoot";
import { formatNowMarkdown } from "@/lib/format-now-markdown";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

export default function Home({
  readme,
  nowMarkdown,
}: {
  readme: ReadmeBundle;
  nowMarkdown: string | null;
}) {
  const { track, colors, ready, lastFmUsername } = useLastFmVisualData();
  const dayTheme = useHongKongDayTheme();
  const [nowMode, setNowMode] = useState(false);

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
        <HomePrintRoot />
      </>
    );
  }

  return (
    <>
      <div
        className="screen-only site-shell relative h-dvh overflow-hidden"
        style={dayTheme.style}
      >
        <PrintActions />
        <Light
          scene={dayTheme.shader}
          className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
        />

        <div className="fixed inset-0 z-0 lg:hidden">
          <Ascii
            colors={colors}
            track={track}
            ready={ready}
            lastFmUsername={lastFmUsername}
          />
        </div>

        <div className="relative z-10 w-full max-w-full lg:hidden">
          <Info
            colors={colors}
            dayTheme={dayTheme}
            readme={readme}
            nowMarkdown={nowMarkdown}
            onOpenNow={() => setNowMode(true)}
          />
        </div>

        <div className="relative z-10 hidden h-dvh overflow-hidden lg:flex lg:w-full lg:max-w-full lg:overflow-x-hidden">
          <div className="relative h-full w-1/2 min-w-0">
            <Info
              colors={colors}
              dayTheme={dayTheme}
              readme={readme}
              nowMarkdown={nowMarkdown}
              onOpenNow={() => setNowMode(true)}
            />
          </div>
          <div className="h-full w-1/2 min-w-0 overflow-x-hidden">
            <Ascii
              colors={colors}
              track={track}
              ready={ready}
              lastFmUsername={lastFmUsername}
            />
          </div>
        </div>
      </div>
      <HomePrintRoot />
    </>
  );
}
