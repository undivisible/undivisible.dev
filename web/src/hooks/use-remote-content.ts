"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  parseLandingReadme,
  parseReadme,
  type ReadmeBundle,
  type ReadmeProject,
} from "@/lib/parse-readme-markdown";
import {
  fetchNowStatus,
  fetchReadmeMarkdown,
  REMOTE_README_URLS,
  REMOTE_MARKDOWN_FRESH_MS,
} from "@/lib/remote-markdown";
import { parseNowMarkdown } from "@/lib/parse-now-markdown";
import type { GithubLanguageStats } from "@/lib/github-repo-languages";

type MarkdownLoader = (options: {
  signal: AbortSignal;
  forceRefresh: boolean;
}) => Promise<string | null>;

/** Undefined is loading; null is an unavailable/expired runtime document. */
export function useProfileMarkdown(load: MarkdownLoader) {
  const [raw, setRaw] = useState<string | null | undefined>(undefined);
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const md = await load({
        signal: signal ?? new AbortController().signal,
        forceRefresh: true,
      });
      if (!signal?.aborted) setRaw(md);
    },
    [load],
  );
  useEffect(() => {
    const ac = new AbortController();
    let pending = false;
    const poll = async () => {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try {
        await refresh(ac.signal);
      } finally {
        pending = false;
      }
    };
    void poll();
    const timer = window.setInterval(
      () => void poll(),
      REMOTE_MARKDOWN_FRESH_MS,
    );
    const visible = () => void poll();
    document.addEventListener("visibilitychange", visible);
    return () => {
      ac.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);
  return { raw, setRaw, refresh };
}

export function useNowMarkdown() {
  const { raw } = useProfileMarkdown(fetchNowStatus);
  return useMemo(() => parseNowMarkdown(raw), [raw]);
}

export async function loadRemoteReadmeBundle(
  signal?: AbortSignal,
  options?: { forceRefresh?: boolean },
): Promise<ReadmeBundle | null> {
  for (const url of REMOTE_README_URLS) {
    const md = await fetchReadmeMarkdown({
      signal,
      url,
      forceRefresh: options?.forceRefresh,
    });
    if (md !== null) return parseReadme(md);
  }
  return null;
}

export function useRemoteReadme(_seed?: ReadmeBundle) {
  const { raw, setRaw } = useProfileMarkdown(fetchReadmeMarkdown);
  const readme = useMemo(() => parseReadme(raw ?? ""), [raw]);
  const refreshReadme = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      const md = await fetchReadmeMarkdown(options);
      setRaw(md);
      return md === null ? null : parseReadme(md);
    },
    [setRaw],
  );
  return { readme, refreshReadme };
}

export type LandingProject = ReadmeProject & { github: GithubLanguageStats };

function repositoryFromHref(href: string): string | null {
  const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)(?:[/?#]|$)/i.exec(
    href,
  );
  return match ? `${match[1]}/${match[2]!.replace(/\.git$/i, "")}` : null;
}

/** Only unchanged source associations or explicit repository links may reuse statistics. */
export function landingProjectsFromMarkdown(
  md: string,
  seed: readonly LandingProject[],
): LandingProject[] {
  const sameHref = (a: string, b: string) =>
    a !== "#" && a.replace(/\/$/, "") === b.replace(/\/$/, "");
  return parseLandingReadme(md).map((project) => {
    const repository =
      repositoryFromHref(project.href) ??
      seed.find((previous) => sameHref(previous.href, project.href))?.github
        ?.repository ??
      null;
    const previous = repository
      ? seed.find(
          (item) =>
            item.github?.repository.toLowerCase() === repository.toLowerCase(),
        )
      : undefined;
    return {
      ...project,
      github: repository
        ? {
            repository: previous?.github?.repository ?? repository,
            languages: previous?.github?.languages ?? null,
          }
        : null,
    };
  });
}

export function useLandingProjects(seed: readonly LandingProject[]): {
  projects: LandingProject[];
  status: "loading" | "ready" | "unavailable";
  refreshProjects: () => Promise<void>;
} {
  const { raw, refresh, setRaw } = useProfileMarkdown(fetchReadmeMarkdown);
  const refreshProjects = useCallback(async () => {
    setRaw(undefined);
    await refresh();
  }, [refresh, setRaw]);
  const projects = useMemo(
    () => landingProjectsFromMarkdown(raw ?? "", seed),
    [raw, seed],
  );
  return {
    projects,
    status:
      raw === undefined ? "loading" : raw === null ? "unavailable" : "ready",
    refreshProjects,
  };
}
