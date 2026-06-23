import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DEFAULT_RESUME_MARKDOWN_URL } from "@/lib/profile-readme";

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

export function contactHref(label: string, value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  switch (label) {
    case "Email":
      return `mailto:${v}`;
    case "Phone":
      return `tel:${v.replace(/[^\d+]/g, "")}`;
    case "Instagram": {
      if (/^https?:\/\//i.test(v)) return v;
      const handle = v.replace(/^@/, "");
      return `https://instagram.com/${handle}`;
    }
    case "Twitter": {
      if (/^https?:\/\//i.test(v)) return v;
      const handle = v.replace(/^@/, "");
      return `https://x.com/${handle}`;
    }
    case "GitHub": {
      if (/^https?:\/\//i.test(v)) return v;
      const path = v.replace(/^github\.com\//i, "").replace(/^\//, "");
      return path ? `https://github.com/${path}` : `https://github.com/${v}`;
    }
    default:
      return undefined;
  }
}

export function contactDisplayUsername(label: string, value: string): string {
  if (label === "GitHub" && !value.includes("@")) {
    const m = value.match(/github\.com\/([^/\s]+)/i);
    if (m) return m[1]!;
  }
  return value;
}