"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import { Light } from "@/components/Light";
import type { ShaderPalette } from "@/lib/useHongKongDayTheme";
import type { TrackInfo } from "@/lib/useLastFmVisualData";

const Ascii = dynamic(() => import("@/components/Ascii"), { ssr: false });

function colorsEqual(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function shaderEqual(a: ShaderPalette, b: ShaderPalette) {
  return (
    a.base === b.base &&
    a.beam === b.beam &&
    a.beamSecondary === b.beamSecondary &&
    a.shadow === b.shadow &&
    a.accent === b.accent &&
    a.sunProgress === b.sunProgress &&
    a.daylightStrength === b.daylightStrength &&
    a.twilightStrength === b.twilightStrength &&
    a.deepNightStrength === b.deepNightStrength &&
    a.midnightStrength === b.midnightStrength &&
    a.weatherKind === b.weatherKind &&
    a.rainIntensity === b.rainIntensity
  );
}

export const ThemeBackdrop = memo(
  function ThemeBackdrop({
    visualEffects,
    shader,
    colors,
    track,
    ready,
    lastFmUsername,
  }: {
    visualEffects: boolean;
    shader: ShaderPalette;
    colors: string[];
    track: TrackInfo | null;
    ready: boolean;
    lastFmUsername: string;
  }) {
    return (
      <>
        <Light
          scene={shader}
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
      </>
    );
  },
  (prev, next) =>
    prev.visualEffects === next.visualEffects &&
    prev.ready === next.ready &&
    prev.track === next.track &&
    prev.lastFmUsername === next.lastFmUsername &&
    shaderEqual(prev.shader, next.shader) &&
    colorsEqual(prev.colors, next.colors),
);
