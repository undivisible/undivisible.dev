const USERNAME =
  process.env.NEXT_PUBLIC_LASTFM_USERNAME ?? "undivisible";

export type LastFmTrackNormalized = {
  artist: string;
  track: string;
  albumArt: string;
  isNowPlaying: boolean;
  trackUrl: string;
  artistUrl: string;
  playedAtLabel: string | null;
};

export type LastFmRecentPayload = {
  configured: boolean;
  track: LastFmTrackNormalized | null;
  error?: string;
};

function lastFmArtistUrl(artist: string) {
  return `https://www.last.fm/music/${encodeURIComponent(artist).replace(/%20/g, "+")}`;
}

function formatPlayedAtLabel(utsSeconds: number) {
  const played = new Date(utsSeconds * 1000);
  const diffMs = Date.now() - played.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return played.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function normalizeLastFmTrack(track: unknown): LastFmTrackNormalized | null {
  if (!track || typeof track !== "object") {
    return null;
  }

  const t = track as Record<string, unknown>;
  const artistRaw = t.artist;
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
  const isNowPlaying = attrs?.nowplaying === "true";

  let artist = "Unknown Artist";
  if (typeof artistRaw === "string" && artistRaw.trim()) {
    artist = artistRaw.trim();
  } else if (artistRaw && typeof artistRaw === "object") {
    const af = artistRaw as Record<string, string>;
    if (typeof af["#text"] === "string" && af["#text"].trim()) {
      artist = af["#text"].trim();
    }
  }

  let playedAtLabel: string | null = null;
  if (!isNowPlaying) {
    const dateField = t.date;
    if (dateField && typeof dateField === "object") {
      const du = dateField as Record<string, string>;
      const utsRaw = du.uts;
      if (typeof utsRaw === "string") {
        const uts = parseInt(utsRaw, 10);
        if (!Number.isNaN(uts)) {
          playedAtLabel = formatPlayedAtLabel(uts);
        }
      }
    }
  }

  const pageUrl = typeof t.url === "string" ? t.url.trim() : "";
  const trackUrl =
    pageUrl ||
    `https://www.last.fm/search?q=${encodeURIComponent(`${artist} ${name}`)}`;
  const artistUrl = lastFmArtistUrl(artist);

  return {
    artist,
    track: name,
    albumArt,
    isNowPlaying,
    trackUrl,
    artistUrl,
    playedAtLabel,
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
  const albumArt = typeof o.albumArt === "string" ? o.albumArt : "";
  const isNowPlaying = o.isNowPlaying === true;
  const trackUrl =
    typeof o.trackUrl === "string" && o.trackUrl.trim()
      ? o.trackUrl.trim()
      : `https://www.last.fm/search?q=${encodeURIComponent(`${artist} ${track}`)}`;
  const artistUrl =
    typeof o.artistUrl === "string" && o.artistUrl.trim()
      ? o.artistUrl.trim()
      : lastFmArtistUrl(artist);
  const playedAtLabel =
    typeof o.playedAtLabel === "string" && o.playedAtLabel.trim()
      ? o.playedAtLabel.trim()
      : null;
  return {
    artist,
    track,
    albumArt,
    isNowPlaying,
    trackUrl,
    artistUrl,
    playedAtLabel,
  };
}

function snapshotUrl(): string {
  if (typeof window === "undefined") {
    return "/lastfm-recent.json";
  }
  return new URL("./lastfm-recent.json", window.location.href).toString();
}

async function fetchSnapshotTrack(): Promise<LastFmRecentPayload["track"]> {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const res = await fetch(snapshotUrl(), { cache: "no-store" });
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
        error?: unknown;
      };

      const err: unknown = data?.error;
      const hasApiError =
        (typeof err === "number" && err > 0) ||
        (typeof err === "string" && err.length > 0);

      if (!res.ok || hasApiError) {
        fallback = {
          configured: true,
          track: null,
          error:
            typeof data.message === "string" ? data.message : "lastfm_error",
        };
      } else {
        const rawTracks = data.recenttracks?.track;
        const first = Array.isArray(rawTracks) ? rawTracks[0] : rawTracks;
        const track = normalizeLastFmTrack(first);
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
