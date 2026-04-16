"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "@/components/Info";
import BouncingShapeVisualizer from "@/components/BouncingShapeVisualizer";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

export default function Home() {
  const { track, colors, ready } = useLastFmVisualData();
  const [revealed, setRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        setRevealed(deltaY > 0);
      }
    };

    const el = containerRef.current;
    if (!el) return;
    
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black">
      <div className="fixed inset-0 z-0 lg:hidden">
        <BouncingShapeVisualizer colors={colors} track={track} ready={ready} />
      </div>
      <div className="fixed inset-0 z-0 bg-black/70 lg:hidden pointer-events-none" />

      <div className="relative z-10 w-full px-4 lg:hidden">
        <Info colors={colors} revealed={revealed} setRevealed={setRevealed} />
      </div>
      
      <div className="hidden lg:flex lg:h-screen lg:w-full">
        <div className="h-full w-1/2 min-w-0">
          <Info colors={colors} revealed={revealed} setRevealed={setRevealed} />
        </div>
        <div className="h-full w-1/2 min-w-0">
          <BouncingShapeVisualizer colors={colors} track={track} ready={ready} />
        </div>
      </div>
    </div>
  );
}
