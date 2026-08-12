const GITHUB_LANG_RE =
  /<span class="color-fg-default text-bold mr-1">([^<]+)<\/span>\s*<span>([0-9.]+)%<\/span>/g;

const SCRAPE_HEADERS = {
  "User-Agent": "undivisible.dev-sync/1.0 (+https://undivisible.dev)",
  Accept: "text/html",
};

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
