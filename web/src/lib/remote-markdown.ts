import {
  DEFAULT_RESUME_MARKDOWN_URL,
  LEGACY_PROFILE_MARKDOWN_URL,
} from "@/lib/profile-readme";

export const NOW_STATUS_URL =
  process.env.NEXT_PUBLIC_NOW_STATUS_URL ??
  "https://raw.githubusercontent.com/undivisible/undivisible/main/now.md";

export const REMOTE_README_URLS = [
  process.env.NEXT_PUBLIC_PROFILE_README_URL,
  LEGACY_PROFILE_MARKDOWN_URL,
].filter((u): u is string => Boolean(u));

const CACHE_PREFIX = "undivisible-remote-md:";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type CacheEntry = { body: string; at: number };

function cacheKey(url: string) {
  return `${CACHE_PREFIX}${url}`;
}

function readCache(url: string, maxAgeMs: number): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(url));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.at > maxAgeMs) return null;
    return entry.body;
  } catch {
    return null;
  }
}

function writeCache(url: string, body: string) {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = { body, at: Date.now() };
    localStorage.setItem(cacheKey(url), JSON.stringify(entry));
  } catch {
    /* quota */
  }
}

async function fetchText(url: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(url, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return (await res.text()).trim();
}

export async function fetchNowStatus(options?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<string | null> {
  const url = NOW_STATUS_URL;

  if (!options?.forceRefresh) {
    const cached = readCache(url, DEFAULT_TTL_MS);
    if (cached) return cached;
  }

  try {
    const body = await fetchText(url, options?.signal);
    if (!body) return null;
    writeCache(url, body);
    return body;
  } catch {
    const stale = readCache(url, Number.POSITIVE_INFINITY);
    if (stale) return stale;
    return null;
  }
}

export async function fetchReadmeMarkdown(options?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<string | null> {
  const urls = REMOTE_README_URLS;

  if (!options?.forceRefresh) {
    for (const url of urls) {
      const cached = readCache(url, DEFAULT_TTL_MS);
      if (cached) return cached;
    }
  }

  for (const url of urls) {
    try {
      const body = await fetchText(url, options?.signal);
      if (!body) continue;
      writeCache(url, body);
      return body;
    } catch {
      continue;
    }
  }

  for (const url of urls) {
    const stale = readCache(url, Number.POSITIVE_INFINITY);
    if (stale) return stale;
  }
  return null;
}

export function resumeMarkdownCacheUrl(): string {
  return (
    process.env.NEXT_PUBLIC_RESUME_MARKDOWN_URL ??
    DEFAULT_RESUME_MARKDOWN_URL
  );
}

/** Sync read of cached resume markdown (any age). For print layout before fetch completes. */
export function readRemoteMarkdownCache(url: string): string | null {
  return readCache(url, Number.POSITIVE_INFINITY);
}

export async function fetchResumeMarkdownCached(options?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<string | null> {
  const url = resumeMarkdownCacheUrl();

  if (!options?.forceRefresh) {
    const cached = readCache(url, DEFAULT_TTL_MS);
    if (cached) return cached;
  }

  try {
    const body = await fetchText(url, options?.signal);
    if (!body) return null;
    writeCache(url, body);
    return body;
  } catch {
    const stale = readCache(url, Number.POSITIVE_INFINITY);
    if (stale) return stale;
    return null;
  }
}