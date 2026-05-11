"use client";

import { Info } from "@/components/Info";
import Ascii from "@/components/Ascii";
import { Light } from "@/components/Light";
import { PrintActions } from "@/components/PrintActions";
import { HomePrintRoot } from "@/components/home/print/HomePrintRoot";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

export default function Home({ readme }: { readme: ReadmeBundle }) {
  const { track, colors, ready, lastFmUsername } = useLastFmVisualData();
  const dayTheme = useHongKongDayTheme();

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
          <Info colors={colors} dayTheme={dayTheme} readme={readme} />
        </div>

        <div className="relative z-10 hidden h-dvh overflow-hidden lg:flex lg:w-full lg:max-w-full lg:overflow-x-hidden">
          <div className="relative h-full w-1/2 min-w-0">
            <Info colors={colors} dayTheme={dayTheme} readme={readme} />
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
