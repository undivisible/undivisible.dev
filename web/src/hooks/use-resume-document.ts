"use client";

import { useMemo } from "react";
import {
  parseResumeMarkdown,
  type ResumeDocument,
} from "@/lib/parse-resume-markdown";
import { fetchResumeMarkdownCached } from "@/lib/remote-markdown";
import { useProfileMarkdown } from "@/hooks/use-remote-content";

export function useResumeDocument(): ResumeDocument {
  const { raw } = useProfileMarkdown(fetchResumeMarkdownCached);

  return useMemo(() => {
    try {
      return parseResumeMarkdown(raw ?? "");
    } catch {
      return parseResumeMarkdown("");
    }
  }, [raw]);
}
