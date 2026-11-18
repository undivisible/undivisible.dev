import {
  parseResumeMarkdown,
  type ResumeDocument,
  type ResumeListItem,
} from "@/lib/parse-resume-markdown";
import type { ReadmeProject } from "@/lib/profile-readme";
import {
  readRemoteMarkdownCache,
  resumeMarkdownCacheUrl,
} from "@/lib/remote-markdown";

export type PrintProject = ReadmeProject | ResumeListItem;

export type PrintProjectSection = {
  title: string;
  intro?: string;
  items: PrintProject[];
};

export function getCachedResumeDocument(
  fallback: ResumeDocument = parseResumeMarkdown(""),
) {
  const cached = readRemoteMarkdownCache(resumeMarkdownCacheUrl());
  if (cached === null) return fallback;
  try {
    return parseResumeMarkdown(cached);
  } catch {
    return fallback;
  }
}

function printStack(item: PrintProject): string | undefined {
  const raw = item.stack?.trim();
  return raw || undefined;
}

export function printProjectCopy(item: PrintProject) {
  const isResumeItem = "meta" in item;
  const blurb = isResumeItem ? item.desc.trim() : item.desc;
  const stack = printStack(item);
  const label = item.name;
  return { label, blurb, stack, href: item.href };
}
