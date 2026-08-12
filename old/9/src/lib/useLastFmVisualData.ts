import { useEffect, useState } from "react";

import {
  fetchLastFmRecent,
  type LastFmTrackNormalized,
} from "./lastfmClient";

export type TrackInfo = LastFmTrackNormalized;

const DEFAULT_COLORS = ["#ffffff", "#cccccc", "#999999", "#666666", "#333333"];

function extractColorsFromCanvasImage(
  image: CanvasImageSource,
): string[] | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 12;
    canvas.height = 12;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(image, 0, 0, 12, 12);
    const pixels = ctx.getImageData(0, 0, 12, 12).data;
    const bucket: number[][] = [];

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = ((r ?? 0) + (g ?? 0) + (b ?? 0)) / 3;
      if (brightness > 22 && brightness < 232 && r != null && g != null && b != null) {
        bucket.push([r, g, b]);
      }
    }

    if (bucket.length < 5) return null;

    const step = Math.max(1, Math.floor(bucket.length / 5));
    return [0, 1, 2, 3, 4].map((index) => {
      const [r, g, b] = bucket[Math.min(index * step, bucket.length - 1)];
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    });
  } catch {
    return null;
  }
}

/**
 * Last.fm recent track + palette from album art.
 * Uses static export–friendly client fetch (Audioscrobbler allows CORS; art CDN sends `Access-Control-Allow-Origin: *`).
 */
export function useLastFmVisualData() {
  const publicUsername =
    process.env.NEXT_PUBLIC_LASTFM_USERNAME ?? "undivisible";

  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (!cancelled) {
        setReady(true);
      }
    };

    void (async () => {
      try {
        const payload = await fetchLastFmRecent();

        if (cancelled) return;

        const raw = payload.track;
        if (!raw) {
          finish();
          return;
        }

        const nextTrack: TrackInfo = {
          artist: raw.artist ?? "Unknown Artist",
          track: raw.track ?? "Unknown Track",
          albumArt: (raw.albumArt ?? "").trim(),
          isNowPlaying: Boolean(raw.isNowPlaying),
          trackUrl: raw.trackUrl ?? "",
          artistUrl: raw.artistUrl ?? "",
          playedAtLabel:
            typeof raw.playedAtLabel === "string" ? raw.playedAtLabel : null,
        };

        setTrack(nextTrack);

        const artHref = nextTrack.albumArt;
        if (!artHref) {
          finish();
          return;
        }

        const img = new Image();
        img.decoding = "async";
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (cancelled) return;
          const sampled = extractColorsFromCanvasImage(img);
          if (sampled) {
            setColors(sampled);
          }
          finish();
        };
        img.onerror = finish;
        img.src = artHref;
      } catch {
        finish();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { track, colors, ready, lastFmUsername: publicUsername };
}
