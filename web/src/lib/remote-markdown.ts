export const NOW_STATUS_URL =
  process.env.NEXT_PUBLIC_NOW_STATUS_URL ?? "/api/profile/now.md";
export const REMOTE_README_URLS = [
  process.env.NEXT_PUBLIC_PROFILE_README_URL ?? "/api/profile/README.md",
];

export const REMOTE_MARKDOWN_FRESH_MS = 60_000;
export const REMOTE_MARKDOWN_MAX_AGE_MS = 5 * 60_000;
const CACHE_PREFIX = "undivisible-remote-md:v3:";
type CacheEntry = { body: string; at: number };

function readCache(url: string, maxAgeMs: number): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${url}`);
    if (!raw) return null;
    const entry: unknown = JSON.parse(raw);
    if (
      !entry ||
      typeof entry !== "object" ||
      !("body" in entry) ||
      typeof entry.body !== "string" ||
      !("at" in entry) ||
      typeof entry.at !== "number" ||
      !Number.isFinite(entry.at) ||
      entry.at > Date.now() ||
      Date.now() - entry.at >= maxAgeMs
    )
      return null;
    return entry.body;
  } catch {
    return null;
  }
}

function storeCache(url: string, entry: CacheEntry | null) {
  if (typeof window === "undefined") return;
  try {
    if (entry)
      localStorage.setItem(`${CACHE_PREFIX}${url}`, JSON.stringify(entry));
    else localStorage.removeItem(`${CACHE_PREFIX}${url}`);
  } catch {
    // Storage is optional (private browsing or quota).
  }
}

export async function fetchRemoteMarkdown(
  url: string,
  options?: { signal?: AbortSignal; forceRefresh?: boolean },
): Promise<string | null> {
  if (!options?.forceRefresh) {
    const cached = readCache(url, REMOTE_MARKDOWN_FRESH_MS);
    if (cached !== null) return cached;
  }
  try {
    const timeout = AbortSignal.timeout(7000);
    const signal = options?.signal
      ? AbortSignal.any([options.signal, timeout])
      : timeout;
    const response = await fetch(url, { signal, cache: "no-store" });
    if (response.status === 404) {
      storeCache(url, null);
      return null;
    }
    if (!response.ok) throw new Error(`Markdown fetch ${response.status}`);
    const body = (await response.text()).trim();
    const upstreamAt = response.headers.get("X-Profile-Fetched-At");
    const at = upstreamAt === null ? Date.now() : Number(upstreamAt);
    if (
      !Number.isFinite(at) ||
      at > Date.now() ||
      Date.now() - at >= REMOTE_MARKDOWN_MAX_AGE_MS
    ) {
      storeCache(url, null);
      return null;
    }
    storeCache(url, { body, at });
    return body;
  } catch {
    return readCache(url, REMOTE_MARKDOWN_MAX_AGE_MS);
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
  return url ? fetchRemoteMarkdown(url, options) : null;
}

export function resumeMarkdownCacheUrl(): string {
  return (
    process.env.NEXT_PUBLIC_RESUME_MARKDOWN_URL ?? "/api/profile/resume.md"
  );
}

export function readRemoteMarkdownCache(url: string): string | null {
  return readCache(url, REMOTE_MARKDOWN_MAX_AGE_MS);
}

export async function fetchResumeMarkdownCached(options?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<string | null> {
  return fetchRemoteMarkdown(resumeMarkdownCacheUrl(), options);
}
