import { githubLanguageColors } from "./github-language-colors";

const GITHUB_LANG_RE =
  /<span class="color-fg-default text-bold mr-1">([^<]+)<\/span>\s*<span>([0-9.]+)%<\/span>/g;

const SCRAPE_HEADERS = {
  "User-Agent": "undivisible.dev-sync/1.0 (+https://undivisible.dev)",
  Accept: "text/html",
};

export type GithubLanguageStats = {
  repository: string;
  languages: Record<string, number> | null;
} | null;

export function parseGithubLanguageBytes(
  data: unknown,
): Record<string, number> | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const entries: Array<[string, number]> = [];
  for (const [name, bytes] of Object.entries(data)) {
    if (typeof bytes !== "number" || !Number.isSafeInteger(bytes) || bytes < 0)
      return null;
    if (bytes > 0) entries.push([name, bytes]);
  }
  return Object.fromEntries(entries);
}

export function githubLanguageLabel(stats: GithubLanguageStats): string {
  if (!stats) return "GitHub languages: no linked repository";
  if (!stats.languages) return "GitHub languages unavailable";
  const entries = Object.entries(stats.languages)
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (!total) return "GitHub reports no language data";
  const summary = entries
    .filter(([, bytes]) => (bytes / total) * 100 >= 0.1)
    .slice(0, 3);
  const other = entries
    .slice(summary.length)
    .reduce((sum, [, bytes]) => sum + bytes, 0);
  if (other) summary.push(["Other", other]);
  return summary
    .map(([name, bytes]) => {
      const percentage = (bytes / total) * 100;
      return `${name} ${percentage < 0.1 ? "<0.1" : percentage.toFixed(1)}%`;
    })
    .join(" · ");
}

export function prepareGithubLanguages(stats: GithubLanguageStats) {
  const entries = Object.entries(stats?.languages ?? {})
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  const segments = entries.map(([name, bytes]) => {
    const color = Object.hasOwn(githubLanguageColors, name)
      ? (githubLanguageColors[name] ?? null)
      : null;
    const percentage = (bytes / total) * 100;
    const label = `${name} ${percentage < 0.1 ? "<0.1" : percentage.toFixed(1)}% (${bytes} bytes)${color ? "" : "; neutral fallback colour"}`;
    return { name, bytes, percentage, color, label };
  });
  const label = githubLanguageLabel(stats);
  return {
    repository: stats?.repository ?? null,
    label,
    accessibleLabel: segments.length
      ? `GitHub languages: ${segments.map((segment) => segment.label).join("; ")}`
      : label,
    segments,
  };
}

export type PreparedGithubLanguages = ReturnType<typeof prepareGithubLanguages>;

export function parseGithubLanguageHtml(html: string): string | undefined {
  const langs: Array<{ name: string; pct: number }> = [];
  for (const match of html.matchAll(GITHUB_LANG_RE)) {
    langs.push({ name: match[1]!.trim(), pct: Number.parseFloat(match[2]!) });
  }
  if (langs.length === 0) return undefined;
  langs.sort((a, b) => b.pct - a.pct);
  return `${langs.map((lang) => lang.name).join(", ")}.`;
}

export async function scrapeGithubRepoLanguages(
  repoPath: string,
  signal?: AbortSignal,
): Promise<string | undefined> {
  try {
    const res = await fetch(`https://github.com/${repoPath}`, {
      headers: SCRAPE_HEADERS,
      signal,
    });
    if (!res.ok) return undefined;
    return parseGithubLanguageHtml(await res.text());
  } catch {
    return undefined;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
