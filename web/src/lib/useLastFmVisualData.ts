import { useEffect, useState } from "react";
import { extractColorsFromCanvasImage } from "./album-theme";

import { fetchLastFmRecent, type LastFmTrackNormalized } from "./lastfmClient";

export type TrackInfo = LastFmTrackNormalized;

const DEFAULT_COLORS = ["#ffffff", "#cccccc", "#999999", "#666666", "#333333"];

/**
 * Last.fm recent track + palette from album art.
 * Uses static export–friendly client fetch (Audioscrobbler allows CORS; art CDN sends `Access-Control-Allow-Origin: *`).
 */
export function useLastFmVisualData(enabled = true) {
  const publicUsername =
    process.env.NEXT_PUBLIC_LASTFM_USERNAME ?? "undivisible";

  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReady(true);
      return undefined;
    }

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
  }, [enabled]);

  return { track, colors, ready, lastFmUsername: publicUsername };
}
