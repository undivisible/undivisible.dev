import {
  DEFAULT_PROFILE_MARKDOWN_URL,
  DEFAULT_RESUME_MARKDOWN_URL,
  PROFILE_PROJECT_LIST_MARKDOWN_URL,
} from "@/lib/parse-readme-markdown";

export const NOW_STATUS_URL =
  process.env.NEXT_PUBLIC_NOW_STATUS_URL ?? DEFAULT_PROFILE_MARKDOWN_URL;

export const REMOTE_README_URLS = process.env.NEXT_PUBLIC_PROFILE_README_URL
  ? [process.env.NEXT_PUBLIC_PROFILE_README_URL]
  : [PROFILE_PROJECT_LIST_MARKDOWN_URL, DEFAULT_PROFILE_MARKDOWN_URL];

const CACHE_PREFIX = "undivisible-remote-md:";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

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
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return (await res.text()).trim();
}

export async function fetchRemoteMarkdown(
  url: string,
  options?: { signal?: AbortSignal; forceRefresh?: boolean },
): Promise<string | null> {
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
    return readCache(url, Number.POSITIVE_INFINITY);
  }
}

export async function fetchNowStatus(options?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<string | null> {
  return fetchRemoteMarkdown(NOW_STATUS_URL, options);
}

export async function fetchReadmeMarkdown(options?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
  url?: string;
}): Promise<string | null> {
  const url = options?.url ?? REMOTE_README_URLS[0];
  if (!url) return null;
  return fetchRemoteMarkdown(url, options);
}

export function resumeMarkdownCacheUrl(): string {
  return (
    process.env.NEXT_PUBLIC_RESUME_MARKDOWN_URL ?? DEFAULT_RESUME_MARKDOWN_URL
  );
}

export function readRemoteMarkdownCache(url: string): string | null {
  return readCache(url, Number.POSITIVE_INFINITY);
}

export async function fetchResumeMarkdownCached(options?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<string | null> {
  return fetchRemoteMarkdown(resumeMarkdownCacheUrl(), options);
}