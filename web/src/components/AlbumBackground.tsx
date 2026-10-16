"use client";

import { useEffect, useRef, useState } from "react";
import { skyTextColor } from "@/lib/album-theme";
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

  useEffect(() => {
    const background = backgroundRef.current;
    if (!background) return;
    const page = background.closest<HTMLElement>(".personal-page");
    if (!page) return;
    const update = () => {
      const sky = background.querySelector<HTMLCanvasElement>(".album-sky");
      const context = sky?.getContext("2d");
      const samples: string[] = [];
      if (sky && context && sky.width && sky.height) {
        for (const y of [0.1, 0.3, 0.5, 0.7, 0.9]) {
          const pixel = context.getImageData(
            Math.floor(sky.width / 2),
            Math.floor(sky.height * y),
            1,
            1,
          ).data;
          const alpha = pixel[3]! / 255;
          const channels = [0, 1, 2].map((index) => {
            const base = parseInt(
              day.shader.base.slice(1 + index * 2, 3 + index * 2),
              16,
            );
            return Math.round(pixel[index]! * alpha + base * (1 - alpha))
              .toString(16)
              .padStart(2, "0");
          });
          samples.push(`#${channels.join("")}`);
        }
      }
      const tone =
        skyTextColor(samples.length ? samples : [day.shader.base]) === "#000000"
          ? "light"
          : "dark";
      if (page.dataset.skyTone !== tone) {
        page.dataset.skyTone = tone;
        window.dispatchEvent(new Event("site:sky-contrast"));
      }
    };
    update();
    const timer = window.setInterval(update, 500);
    return () => {
      window.clearInterval(timer);
      delete page.dataset.skyTone;
    };
  }, [day.shader.base]);

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
