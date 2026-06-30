"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import {
  normalizeReadmeBundle,
  parseReadme,
  readmeBundleProjectCount,
  type ReadmeBundle,
} from "@/lib/parse-readme-markdown";
import {
  fetchNowStatus,
  fetchReadmeMarkdown,
  REMOTE_README_URLS,
} from "@/lib/remote-markdown";
import { nowMarkdownFromRepo } from "@/data/now-markdown.generated";
import { parseNowMarkdown } from "@/lib/parse-now-markdown";

export function useNowMarkdown() {
  const [raw, setRaw] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void fetchNowStatus({ signal: ac.signal }).then(setRaw);
    return () => ac.abort();
  }, []);

  if (raw === null) {
    return parseNowMarkdown(nowMarkdownFromRepo);
  }
  return parseNowMarkdown(raw);
}

export async function loadRemoteReadmeBundle(
  signal?: AbortSignal,
  options?: { forceRefresh?: boolean },
): Promise<ReadmeBundle | null> {
  let best: ReadmeBundle | null = null;
  let bestCount = 0;
  for (const url of REMOTE_README_URLS) {
    const md = await fetchReadmeMarkdown({
      signal,
      url,
      forceRefresh: options?.forceRefresh,
    });
    if (!md) continue;
    const bundle = normalizeReadmeBundle(parseReadme(md));
    const count = readmeBundleProjectCount(bundle);
    if (count > bestCount) {
      best = bundle;
      bestCount = count;
    }
  }
  return bestCount > 0 ? best : null;
}

export function useRemoteReadme(seed: ReadmeBundle) {
  const [readme, setReadme] = useState<ReadmeBundle>(seed);

  const refreshReadme = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      const best = await loadRemoteReadmeBundle(undefined, options);
      if (best) {
        flushSync(() => setReadme(best));
      }
      return best;
    },
    [],
  );

  useEffect(() => {
    const ac = new AbortController();
    void loadRemoteReadmeBundle(ac.signal).then((best) => {
      if (best) setReadme(best);
    });
    return () => ac.abort();
  }, []);

  return { readme, refreshReadme };
}