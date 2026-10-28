"use client";

import { useEffect, useRef, useState } from "react";
import { useSkyContrast } from "@/hooks/use-sky-contrast";
import Ascii from "@/components/Ascii";
import { Light } from "@/components/Light";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";

const DEFAULT_COLORS = ["#ffffff", "#cccccc", "#999999", "#666666", "#333333"];

export function AlbumBackground({
  dayTheme: day,
  fontsReady,
  visualEffects,
}: {
  dayTheme: HongKongDayTheme;
  fontsReady: boolean;
  visualEffects: boolean;
}) {
  const animateWeather =
    visualEffects ||
    day.shader.weatherKind === "rain" ||
    day.shader.weatherKind === "storm";
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const skyBaseRef = useRef(day.shader.base);
  skyBaseRef.current = day.shader.base;

  useSkyContrast({ backgroundRef, skyBaseRef });

  useEffect(() => {
    const read = () => {
      const next = document.documentElement.dataset.albumColors?.split(" ");
      if (
        next?.length === 5 &&
        next.every((color) => /^#[0-9a-f]{6}$/i.test(color))
      ) {
        setColors(next);
      }
    };
    read();
    window.addEventListener("site:album-palette", read);
    return () => {
      window.removeEventListener("site:album-palette", read);
    };
  }, []);

  return (
    <div ref={backgroundRef} className="album-background" aria-hidden>
      <Light
        scene={day.shader}
        animated={animateWeather}
        className="album-sky"
      />
      <div className="album-ascii">
        {visualEffects ? (
          <Ascii colors={colors} track={null} ready={fontsReady} />
        ) : null}
      </div>
    </div>
  );
}
