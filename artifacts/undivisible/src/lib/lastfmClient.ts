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

/** Browser fetch — Last.fm allows `Access-Control-Allow-Origin: *` on ws.audioscrobbler.com. */
export async function fetchLastFmRecent(): Promise<LastFmRecentPayload> {
  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY ?? "";

  if (!apiKey) {
    return { configured: false, track: null };
  }

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
      return {
        configured: true,
        track: null,
        error:
          typeof data.message === "string" ? data.message : "lastfm_error",
      };
    }

    const rawTracks = data.recenttracks?.track;
    const first = Array.isArray(rawTracks) ? rawTracks[0] : rawTracks;
    const track = normalizeTrack(first);

    return {
      configured: true,
      track,
    };
  } catch {
    return {
      configured: true,
      track: null,
      error: "network_error",
    };
  }
}
