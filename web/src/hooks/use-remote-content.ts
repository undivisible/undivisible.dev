"use client";

import { useEffect, useState } from "react";
import { normalizeReadmeBundle, parseReadme, type ReadmeBundle } from "@/lib/profile-readme";
import { fetchNowStatus, fetchReadmeMarkdown } from "@/lib/remote-markdown";
import { nowMarkdownFromRepo } from "@/data/now-markdown.generated";
import { parseNowMarkdown, type NowContent } from "@/lib/parse-now-markdown";

export function useNowMarkdown() {
  const [raw, setRaw] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void fetchNowStatus({ signal: ac.signal }).then(setRaw);
    return () => ac.abort();
  }, []);

  // Return parsed content with fallback to seed (for initial render before fetch)
  if (raw === null) {
    return parseNowMarkdown(nowMarkdownFromRepo);
  }
  return parseNowMarkdown(raw);
}

export function refreshNowMarkdown(): Promise<string | null> {
  const controller = new AbortController();
  return fetchNowStatus({ signal: controller.signal, forceRefresh: true });
}

export function useRemoteReadme(seed: ReadmeBundle) {
  const [readme, setReadme] = useState<ReadmeBundle>(seed);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      const md = await fetchReadmeMarkdown({ signal: ac.signal });
      if (md) setReadme(normalizeReadmeBundle(parseReadme(md)));
    })();
    return () => ac.abort();
  }, []);

  return readme;
}

export function refreshReadmeMarkdown(): Promise<string | null> {
  const controller = new AbortController();
  return fetchReadmeMarkdown({ signal: controller.signal, forceRefresh: true });
}