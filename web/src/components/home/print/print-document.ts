import { resumeDoc } from "@/data/resume-document";
import {
  parseResumeMarkdown,
  resumeItemBlurb,
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

export function getCachedResumeDocument() {
  const cached = readRemoteMarkdownCache(resumeMarkdownCacheUrl());
  if (!cached) return resumeDoc;
  try {
    return parseResumeMarkdown(cached);
  } catch {
    return resumeDoc;
  }
}

export function printProjectCopy(item: PrintProject) {
  const isResumeItem = "meta" in item;
  const baseBlurb = isResumeItem ? resumeItemBlurb(item) : item.desc;
  const stack = item.stack?.trim() || undefined;
  const blurb = stack ? `${baseBlurb} Built with ${stack}` : baseBlurb;
  const label = isResumeItem && item.meta ? item.meta : item.name;
  return { label, blurb, stack, href: item.href };
}
