"use client";

import { useEffect, useState } from "react";
import Ascii from "@/components/Ascii";
import { Light } from "@/components/Light";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useSiteVisualEffects } from "@/hooks/use-site-visual-effects";

export function AlbumBackground() {
  const day = useHongKongDayTheme();
  const animate = useSiteVisualEffects();
  const [colors, setColors] = useState<string[]>([]);
  useEffect(() => {
    const read = () =>
      setColors(document.documentElement.dataset.albumColors?.split(" ") ?? []);
    read();
    window.addEventListener("site:album-palette", read);
    return () => window.removeEventListener("site:album-palette", read);
  }, []);
  const scene =
    colors.length === 5
      ? {
          ...day.shader,
          beam: colors[1]!,
          beamSecondary: colors[3]!,
          accent: colors[2]!,
        }
      : day.shader;
  return (
    <div className="album-background" aria-hidden>
      <Light scene={scene} animated={animate} className="album-sky" />
      {animate ? (
        <div className="album-ascii">
          <Ascii
            colors={
              colors.length
                ? colors
                : [
                    scene.beam,
                    scene.accent,
                    scene.beamSecondary,
                    scene.base,
                    scene.shadow,
                  ]
            }
            track={null}
            ready={false}
            lastFmUsername="undivisible"
          />
        </div>
      ) : null}
      <div className="album-spectrum" />
      <div className="album-grid" />
    </div>
  );
}
