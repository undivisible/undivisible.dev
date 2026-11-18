"use client";

import { useEffect, useState } from "react";
import { ClockPanel } from "@/components/ClockPanel";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import type { NowContent } from "@/lib/parse-now-markdown";

export function MainClock({
  dayTheme,
  now,
  nowArticleOpen,
  onToggleNowArticle,
  onTimeHoverChange,
}: {
  dayTheme: HongKongDayTheme;
  now: NowContent;
  nowArticleOpen: boolean;
  onToggleNowArticle?: () => void;
  onTimeHoverChange?: (hovered: boolean) => void;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div
      className="personal-clock"
      aria-label="Time and weather"
      data-time-preview={dayTheme.isScrubbing}
    >
      <ClockPanel
        dayTheme={dayTheme}
        now={now}
        nowArticleOpen={nowArticleOpen}
        onToggleNowArticle={onToggleNowArticle}
        hydrated={hydrated}
        travelClocks
        onTimeHoverChange={onTimeHoverChange}
      />
    </div>
  );
}
