
import { useEffect, useState } from "react";

export interface TrackInfo {
  artist: string;
  track: string;
  albumArt: string;
  isNowPlaying: boolean;
}

const DEFAULT_COLORS = ["#ffffff", "#cccccc", "#999999", "#666666", "#333333"];

export function useLastFmVisualData() {
  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
    const username = "undivisible";

    console.log("[lastfm] init", {
      hasApiKey: Boolean(apiKey),
      username,
    });

    if (!apiKey) {
      console.log("[lastfm] missing env", {
        hasApiKey: Boolean(apiKey),
      });
      setReady(true);
      return;
    }

    fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`,
    )
      .then((res) => {
        console.log("[lastfm] response", { ok: res.ok, status: res.status });
        return res.json();
      })
      .then((data) => {
        console.log("[lastfm] payload", data);
        const item = data.recenttracks?.track?.[0];
        if (!item) {
          console.log("[lastfm] no recent track found");
          setReady(true);
          return;
        }

        const nextTrack = {
          artist: item.artist?.["#text"] || "Unknown Artist",
          track: item.name || "Unknown Track",
          albumArt: item.image?.[item.image.length - 1]?.["#text"] || "",
          isNowPlaying: item["@attr"]?.nowplaying === "true",
        } satisfies TrackInfo;

        setTrack(nextTrack);
        console.log("[lastfm] track", nextTrack);

        if (!nextTrack.albumArt) {
          console.log("[lastfm] missing album art");
          setReady(true);
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 12;
            canvas.height = 12;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              console.log("[lastfm] color extraction context unavailable");
              setReady(true);
              return;
            }

            ctx.drawImage(img, 0, 0, 12, 12);
            const pixels = ctx.getImageData(0, 0, 12, 12).data;
            const bucket: number[][] = [];

            for (let i = 0; i < pixels.length; i += 4) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              const brightness = (r + g + b) / 3;
              if (brightness > 22 && brightness < 232) {
                bucket.push([r, g, b]);
              }
            }

            if (bucket.length >= 5) {
              const step = Math.max(1, Math.floor(bucket.length / 5));
              const nextColors = [0, 1, 2, 3, 4].map((index) => {
                  const [r, g, b] = bucket[Math.min(index * step, bucket.length - 1)];
                  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                });
              setColors(nextColors);
              console.log("[lastfm] extracted colors", nextColors);
            } else {
              console.log("[lastfm] insufficient colors extracted", { bucketSize: bucket.length });
            }
            setReady(true);
          } catch (error) {
            console.log("[lastfm] color extraction failed", error);
            setReady(true);
            // Keep defaults when extraction is blocked.
          }
        };
        img.onerror = () => {
          console.log("[lastfm] album art image failed to load", nextTrack.albumArt);
          setReady(true);
        };
        img.src = nextTrack.albumArt;
      })
      .catch((error) => {
        console.error("[lastfm] request failed", error);
        setReady(true);
        // Keep defaults if Last.fm is unavailable.
      });
  }, []);

  return { track, colors, ready };
}
