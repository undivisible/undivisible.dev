"use client";

import { useEffect, useState } from "react";
import { normalizeReadmeBundle, parseReadme, type ReadmeBundle } from "@/lib/profile-readme";
import { fetchNowStatus, fetchReadmeMarkdown } from "@/lib/remote-markdown";
import { nowMarkdownFromRepo } from "@/data/now-markdown.generated";
import { parseNowMarkdown, type NowContent } from "@/lib/parse-now-markdown";

export function useNowMarkdown(fallback?: string | null) {
  const seed = fallback ?? nowMarkdownFromRepo;
  const [raw, setRaw] = useState<string | null>(seed);

  useEffect(() => {
    const ac = new AbortController();
    void fetchNowStatus({
      signal: ac.signal,
      fallback: seed,
    }).then(setRaw);
    return () => ac.abort();
  }, [seed]);

  return parseNowMarkdown(raw);
}

/** @deprecated use useNowMarkdown */
export function useNowStatus(fallback?: string | null): string | null {
  return useNowMarkdown(fallback).status;
}

export function useRemoteReadme(seed: ReadmeBundle) {
  const [readme, setReadme] = useState<ReadmeBundle>(seed);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      const md = await fetchReadmeMarkdown({ signal: ac.signal });
      if (!md) return;
      setReadme(normalizeReadmeBundle(parseReadme(md)));
    })();
    return () => ac.abort();
  }, []);

  return readme;
}