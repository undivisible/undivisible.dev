import { useEffect } from "react";
import type { RefObject } from "react";
import { skyTextColor } from "@/lib/album-theme";

const SAMPLE_YS = [0.1, 0.3, 0.5, 0.7, 0.9];
const SAMPLE_INTERVAL_MS = 500;

export function useSkyContrast({
  backgroundRef,
  skyBaseRef,
}: {
  backgroundRef: RefObject<HTMLDivElement | null>;
  skyBaseRef: RefObject<string>;
}) {
  useEffect(() => {
    const background = backgroundRef.current;
    if (!background) return;
    const page = background.closest<HTMLElement>(".personal-page");
    if (!page) return;

    const scratch = document.createElement("canvas");
    scratch.width = 1;
    scratch.height = SAMPLE_YS.length;
    const scratchContext = scratch.getContext("2d", {
      willReadFrequently: true,
    });
    if (!scratchContext) return;

    const update = () => {
      if (document.hidden) return;
      const baseColor = skyBaseRef.current;
      const sky = background.querySelector<HTMLCanvasElement>(".album-sky");
      const samples: string[] = [];
      if (sky && sky.width && sky.height) {
        scratchContext.clearRect(0, 0, 1, SAMPLE_YS.length);
        for (const [index, y] of SAMPLE_YS.entries()) {
          scratchContext.drawImage(
            sky,
            Math.floor(sky.width / 2),
            Math.floor(sky.height * y),
            1,
            1,
            0,
            index,
            1,
            1,
          );
        }
        const { data } = scratchContext.getImageData(0, 0, 1, SAMPLE_YS.length);
        for (let index = 0; index < SAMPLE_YS.length; index += 1) {
          const offset = index * 4;
          const alpha = data[offset + 3]! / 255;
          const channels = [0, 1, 2].map((channel) => {
            const base = parseInt(
              baseColor.slice(1 + channel * 2, 3 + channel * 2),
              16,
            );
            return Math.round(
              data[offset + channel]! * alpha + base * (1 - alpha),
            )
              .toString(16)
              .padStart(2, "0");
          });
          samples.push(`#${channels.join("")}`);
        }
      }
      const tone =
        skyTextColor(samples.length ? samples : [baseColor]) === "#000000"
          ? "light"
          : "dark";
      if (page.dataset.skyTone !== tone) {
        page.dataset.skyTone = tone;
        window.dispatchEvent(new Event("site:sky-contrast"));
      }
    };
    update();
    const timer = window.setInterval(update, SAMPLE_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      delete page.dataset.skyTone;
    };
  }, [backgroundRef, skyBaseRef]);
}
