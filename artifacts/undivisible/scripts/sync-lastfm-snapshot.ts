import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const USERNAME = process.env.NEXT_PUBLIC_LASTFM_USERNAME ?? "undivisible";
const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY ?? "";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(scriptDir, "..", "public");
const outFile = path.join(publicDir, "lastfm-recent.json");

type TrackOut = {
  artist: string;
  track: string;
  albumArt: string;
  isNowPlaying: boolean;
} | null;

function normalizeTrack(track: unknown): TrackOut {
  if (!track || typeof track !== "object") {
    return null;
  }

  const t = track as Record<string, unknown>;
  const artistField = t.artist as Record<string, string> | undefined;
  const images = t.image;

  let albumArt = "";
  const imageList =
    Array.isArray(images)
      ? images
      : images != null && typeof images === "object"
        ? [images]
        : [];
  if (imageList.length > 0) {
    const last =
      imageList[imageList.length - 1] as Record<string, string> | undefined;
    albumArt =
      typeof last?.["#text"] === "string" ? last["#text"].trim() : "";
  }

  const name = typeof t.name === "string" ? t.name : "Unknown Track";
  const attrs = t["@attr"] as Record<string, string> | undefined;

  return {
    artist:
      (typeof artistField?.["#text"] === "string" && artistField["#text"]) ||
      "Unknown Artist",
    track: name,
    albumArt,
    isNowPlaying: attrs?.nowplaying === "true",
  };
}

if (!apiKey) {
  console.info("[lastfm-snapshot] skip: NEXT_PUBLIC_LASTFM_API_KEY unset");
  process.exit(0);
}

const url = new URL("https://ws.audioscrobbler.com/2.0/");
url.searchParams.set("method", "user.getrecenttracks");
url.searchParams.set("user", USERNAME);
url.searchParams.set("api_key", apiKey);
url.searchParams.set("format", "json");
url.searchParams.set("limit", "1");

let track: TrackOut = null;

try {
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  const data = (await res.json()) as {
    recenttracks?: { track?: unknown | unknown[] };
    message?: string;
    error?: number;
  };

  if (res.ok && data?.error === undefined) {
    const rawTracks = data.recenttracks?.track;
    const first = Array.isArray(rawTracks) ? rawTracks[0] : rawTracks;
    track = normalizeTrack(first);
  }
} catch (error) {
  console.warn("[lastfm-snapshot] fetch failed", error);
}

mkdirSync(publicDir, { recursive: true });
writeFileSync(
  outFile,
  `${JSON.stringify({ track }, null, 2)}\n`,
  "utf8",
);
console.info(
  `[lastfm-snapshot] wrote ${path.relative(process.cwd(), outFile)} track=${track ? `${track.artist} — ${track.track}` : "null"}`,
);
