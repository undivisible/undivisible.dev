import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DEFAULT_RESUME_MARKDOWN_URL } from "../src/lib/profile-readme.ts";

export function resumeMarkdownUrls(): string[] {
  return process.env.RESUME_MARKDOWN_URL
    ? [process.env.RESUME_MARKDOWN_URL]
    : [DEFAULT_RESUME_MARKDOWN_URL];
}

export async function fetchResumeMarkdown(options?: {
  signal?: AbortSignal;
  urls?: string[];
}): Promise<string> {
  const urls = options?.urls ?? resumeMarkdownUrls();
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: options?.signal });
      if (!res.ok) continue;
      const raw = (await res.text()).trim();
      if (raw.length > 0) return raw;
    } catch {
      /* try next */
    }
  }
  try {
    const local = fileURLToPath(
      new URL("../public/resume.md", import.meta.url),
    );
    const raw = (await readFile(local, "utf8")).trim();
    if (raw.length > 0) return raw;
  } catch {
    /* no fallback */
  }
  throw new Error(`resume markdown fetch failed: ${urls.join(" -> ")}`);
}