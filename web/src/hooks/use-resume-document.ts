"use client";

import { useEffect, useMemo, useState } from "react";
import { resumeFromMarkdown } from "@/data/resume-from-markdown.generated";
import {
  parseResumeMarkdown,
  type ResumeDocument,
} from "@/lib/parse-resume-markdown";
import { fetchResumeMarkdownCached } from "@/lib/remote-markdown";

const seedDoc = resumeFromMarkdown as unknown as ResumeDocument;

export function useResumeDocument(): ResumeDocument {
  const [raw, setRaw] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void fetchResumeMarkdownCached({ signal: ac.signal }).then((md) => {
      if (md) setRaw(md);
    });
    return () => ac.abort();
  }, []);

  return useMemo(() => {
    if (!raw) return seedDoc;
    try {
      return parseResumeMarkdown(raw) as ResumeDocument;
    } catch {
      return seedDoc;
    }
  }, [raw]);
}