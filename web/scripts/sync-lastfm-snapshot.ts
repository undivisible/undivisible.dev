import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeLastFmTrack } from "../src/lib/lastfmClient.ts";
import { loadRootEnv } from "./load-root-env";

await loadRootEnv();

const USERNAME = process.env.NEXT_PUBLIC_LASTFM_USERNAME ?? "undivisible";
const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY ?? "";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(scriptDir, "..", "public");
const outFile = path.join(publicDir, "lastfm-recent.json");

type TrackOut = ReturnType<typeof normalizeLastFmTrack>;

if (!apiKey) {
  throw new Error(
    "NEXT_PUBLIC_LASTFM_API_KEY is required: refusing to build without the Last.fm integration",
  );
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
    signal: AbortSignal.timeout(8000),
  });
  const data = (await res.json()) as {
    recenttracks?: { track?: unknown | unknown[] };
    message?: string;
    error?: number;
  };

  if (!res.ok || data?.error !== undefined)
    throw new Error("Last.fm rejected the snapshot request");
  const rawTracks = data.recenttracks?.track;
  const first = Array.isArray(rawTracks) ? rawTracks[0] : rawTracks;
  track = normalizeLastFmTrack(first);
} catch {
  throw new Error(
    "Could not refresh the Last.fm snapshot; existing snapshot was not overwritten",
  );
}

mkdirSync(publicDir, { recursive: true });
writeFileSync(outFile, `${JSON.stringify({ track }, null, 2)}\n`, "utf8");
console.info(
  `[lastfm-snapshot] wrote ${path.relative(process.cwd(), outFile)} track=${track ? `${track.artist} — ${track.track}` : "null"}`,
);
