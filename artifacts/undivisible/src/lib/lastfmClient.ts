const USERNAME =
  process.env.NEXT_PUBLIC_LASTFM_USERNAME ?? "undivisible";

export type LastFmRecentPayload = {
  configured: boolean;
  track: {
    artist: string;
    track: string;
    albumArt: string;
    isNowPlaying: boolean;
  } | null;
  error?: string;
};

function normalizeTrack(track: unknown) {
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

function parseSnapshotTrack(raw: unknown): LastFmRecentPayload["track"] {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const artist = typeof o.artist === "string" ? o.artist : "";
  const track = typeof o.track === "string" ? o.track : "";
  if (!artist || !track) {
    return null;
  }
  return {
    artist,
    track,
    albumArt: typeof o.albumArt === "string" ? o.albumArt : "",
    isNowPlaying: o.isNowPlaying === true,
  };
}

async function fetchSnapshotTrack(): Promise<LastFmRecentPayload["track"]> {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const res = await fetch(
      new URL("/lastfm-recent.json", window.location.origin).toString(),
      { cache: "no-store" },
    );
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { track?: unknown };
    return parseSnapshotTrack(data.track);
  } catch {
    return null;
  }
}

/** Browser fetch — Last.fm allows CORS on ws.audioscrobbler.com; falls back to same-origin snapshot when live API is blocked or fails. */
export async function fetchLastFmRecent(): Promise<LastFmRecentPayload> {
  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY ?? "";
  let fallback: LastFmRecentPayload | undefined;

  if (apiKey) {
    try {
      const url = new URL("https://ws.audioscrobbler.com/2.0/");
      url.searchParams.set("method", "user.getrecenttracks");
      url.searchParams.set("user", USERNAME);
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");

      const res = await fetch(url.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const data = (await res.json()) as {
        recenttracks?: { track?: unknown | unknown[] };
        message?: string;
        error?: number;
      };

      if (!res.ok || data?.error !== undefined) {
        fallback = {
          configured: true,
          track: null,
          error:
            typeof data.message === "string" ? data.message : "lastfm_error",
        };
      } else {
        const rawTracks = data.recenttracks?.track;
        const first = Array.isArray(rawTracks) ? rawTracks[0] : rawTracks;
        const track = normalizeTrack(first);
        if (track) {
          return {
            configured: true,
            track,
          };
        }
        fallback = { configured: true, track: null };
      }
    } catch {
      fallback = {
        configured: true,
        track: null,
        error: "network_error",
      };
    }
  }

  const snapTrack = await fetchSnapshotTrack();
  if (snapTrack) {
    return {
      configured: true,
      track: snapTrack,
    };
  }

  if (fallback) {
    return fallback;
  }

  return { configured: false, track: null };
}
