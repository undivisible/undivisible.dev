"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  const seed = nowMarkdownFromRepo;
  return useMemo(
    () => parseNowMarkdown(raw ?? seed),
    [raw, seed],
  );
}

export async function loadRemoteReadmeBundle(
  signal?: AbortSignal,
  options?: { forceRefresh?: boolean },
): Promise<ReadmeBundle | null> {
  const bundles = await Promise.all(
    REMOTE_README_URLS.map(async (url) => {
      const md = await fetchReadmeMarkdown({
        signal,
        url,
        forceRefresh: options?.forceRefresh,
      });
      if (!md) return null;
      return normalizeReadmeBundle(parseReadme(md));
    }),
  );
  let best: ReadmeBundle | null = null;
  let bestCount = 0;
  for (const bundle of bundles) {
    if (!bundle) continue;
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