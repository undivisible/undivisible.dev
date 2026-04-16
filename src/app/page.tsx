"use client";

import { Info } from "@/components/Info";
import BouncingShapeVisualizer from "@/components/BouncingShapeVisualizer";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

export default function Home() {
  const { track, colors, ready } = useLastFmVisualData();

  return (
    <div className="grid min-h-[200dvh] grid-cols-1 bg-black lg:grid-cols-2">
      <div className="relative min-h-[200dvh]">
        <Info colors={colors} />
      </div>
      <div className="relative h-dvh lg:sticky lg:top-0">
        <BouncingShapeVisualizer colors={colors} track={track} ready={ready} />
      </div>
    </div>
  );
}
