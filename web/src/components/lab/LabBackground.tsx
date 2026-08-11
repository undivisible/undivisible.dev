"use client";

import { useMemo } from "react";
import Ascii from "@/components/Ascii";
import { LabAurora } from "@/components/lab/LabAurora";
import { Light } from "@/components/Light";
import { useSiteVisualEffects } from "@/hooks/use-site-visual-effects";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

/**
 * The part of the site that stays the same in every layout study: the sky
 * shader keyed to the time of day and the weather, with the Last.fm ASCII
 * field over it, coloured by whatever is playing.
 */
export function LabBackground({ dayTheme }: { dayTheme: HongKongDayTheme }) {
  const { track, colors, ready, lastFmUsername } = useLastFmVisualData();
  const visualEffects = useSiteVisualEffects();

  // With no album art sampled yet the field's palette is a grey ramp, which
  // reads as a grey veil over a colourful sky. Until a track paints it, let
  // the field borrow the sky's own colours — so the ASCII drifts through
  // sunrise orange and noon blue, and album colours take over when playing.
  const { shader } = dayTheme;
  const skyColors = useMemo(
    () => [
      shader.beam,
      shader.accent,
      shader.beamSecondary,
      shader.base,
      shader.shadow,
    ],
    [
      shader.beam,
      shader.accent,
      shader.beamSecondary,
      shader.base,
      shader.shadow,
    ],
  );
  const usingDefaults = colors[0] === "#ffffff" && colors[4] === "#333333";
  const fieldColors = usingDefaults ? skyColors : colors;
  const animateWeather =
    visualEffects ||
    dayTheme.shader.weatherKind === "rain" ||
    dayTheme.shader.weatherKind === "storm";

  return (
    <>
      <Light
        scene={dayTheme.shader}
        animated={animateWeather}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {visualEffects ? (
          <Ascii
            colors={fieldColors}
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
      <LabAurora daylight={shader.daylightStrength} />
    </>
  );
}

/** Colours sampled from the current album art, for accent use in a layout. */
export { useLastFmVisualData };
