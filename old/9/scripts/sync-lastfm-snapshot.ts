import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeLastFmTrack } from "../src/lib/lastfmClient.ts";

const USERNAME = process.env.NEXT_PUBLIC_LASTFM_USERNAME ?? "undivisible";
const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY ?? "";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(scriptDir, "..", "public");
const outFile = path.join(publicDir, "lastfm-recent.json");

type TrackOut = ReturnType<typeof normalizeLastFmTrack>;

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
    track = normalizeLastFmTrack(first);
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
