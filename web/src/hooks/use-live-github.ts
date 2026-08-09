"use client";

import { useEffect, useState } from "react";
import { GITHUB_ACTIVITY } from "@/data/github-activity";

export type MergedPr = {
  title: string;
  url: string;
  repo: string;
  mergedAt: string;
};

export type LiveGithub = {
  prsTotal: number;
  prsThisYear: number;
  merged: number;
  /** Merged into repositories that are neither mine nor tsc.hk's. */
  mergedElsewhere: number;
  /** Closed without merging — nearly all of them closed by me, not rejected. */
  closedUnmerged: number;
  commitsThisYear: number;
  repos: number;
  omiThisMonth: number;
  recent: MergedPr[];
  /** True once at least one live response has replaced the snapshot. */
  live: boolean;
};

const SEARCH = "https://api.github.com/search/issues?q=";
const JSON_HEADERS = { accept: "application/vnd.github+json" };

async function count(query: string, signal: AbortSignal): Promise<number> {
  const res = await fetch(`${SEARCH}${encodeURIComponent(query)}&per_page=1`, {
    headers: JSON_HEADERS,
    signal,
  });
  if (!res.ok) throw new Error(String(res.status));
  return ((await res.json()) as { total_count: number }).total_count;
}

const snapshotRecent: MergedPr[] = GITHUB_ACTIVITY.recentMerged.map((pr) => ({
  title: pr.title,
  url: `https://github.com/${GITHUB_ACTIVITY.repo}/pull/${pr.number}`,
  repo: GITHUB_ACTIVITY.repo,
  mergedAt: pr.mergedAt,
}));

/**
 * The numbers and the merged list, from the GitHub API at load time.
 *
 * Renders instantly from the committed snapshot, then each figure is replaced
 * as its live response lands — so the site is current without a rebuild, and a
 * rate-limited or offline visit still shows real (just older) numbers. Then it
 * keeps going: the whole set refreshes on an interval and whenever the tab
 * comes back to the front.
 */
export function useLiveGithub(): LiveGithub {
  const [state, setState] = useState<LiveGithub>({
    prsTotal: GITHUB_ACTIVITY.account.pullRequests,
    prsThisYear: GITHUB_ACTIVITY.account.pullRequestsThisYear,
    merged: GITHUB_ACTIVITY.account.merged,
    mergedElsewhere: GITHUB_ACTIVITY.account.mergedElsewhere,
    closedUnmerged: GITHUB_ACTIVITY.account.closedUnmerged,
    commitsThisYear: GITHUB_ACTIVITY.account.commitsThisYear,
    repos: GITHUB_ACTIVITY.account.repos,
    omiThisMonth: GITHUB_ACTIVITY.thisMonth.pullRequests,
    recent: snapshotRecent,
    live: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const author = GITHUB_ACTIVITY.author;

    const apply = (patch: Partial<LiveGithub>) =>
      setState((current) => ({ ...current, ...patch, live: true }));

    function refresh() {
      const now = new Date();
      const year = now.getFullYear();
      const monthStart = `${now.toISOString().slice(0, 8)}01`;

      void count(`author:${author} is:pr created:>=${year}-01-01`, signal)
        .then((prsThisYear) => apply({ prsThisYear }))
        .catch(() => {});
      void count(`author:${author} is:pr is:merged`, signal)
        .then((merged) => apply({ merged }))
        .catch(() => {});
      void count(`author:${author} is:pr`, signal)
        .then((prsTotal) => apply({ prsTotal }))
        .catch(() => {});
      // Merged somewhere someone else had to press the button. The plain
      // merge/close ratio is misleading — a PR I closed myself is not a
      // rejection — so this is the number that actually means something.
      void count(
        `author:${author} is:pr is:merged -user:${author} -user:tschk`,
        signal,
      )
        .then((mergedElsewhere) => apply({ mergedElsewhere }))
        .catch(() => {});
      // Closed without merging. Shown only alongside the sentence saying who
      // did the closing, never on its own where it would read as rejections.
      void count(`author:${author} is:pr is:closed is:unmerged`, signal)
        .then((closedUnmerged) => apply({ closedUnmerged }))
        .catch(() => {});
      void count(
        `repo:${GITHUB_ACTIVITY.repo} author:${author} is:pr created:>=${monthStart}`,
        signal,
      )
        .then((omiThisMonth) => apply({ omiThisMonth }))
        .catch(() => {});

      void fetch(
        `https://api.github.com/search/commits?q=${encodeURIComponent(
          `author:${author} author-date:>=${year}-01-01`,
        )}&per_page=1`,
        {
          headers: { accept: "application/vnd.github.cloak-preview+json" },
          signal,
        },
      )
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as { total_count: number };
          apply({ commitsThisYear: data.total_count });
        })
        .catch(() => {});

      void fetch(
        `${SEARCH}${encodeURIComponent(
          `author:${author} is:pr is:merged`,
        )}&sort=updated&order=desc&per_page=8`,
        { headers: JSON_HEADERS, signal },
      )
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as {
            items: Array<{
              title: string;
              html_url: string;
              repository_url: string;
              closed_at: string | null;
              updated_at: string;
            }>;
          };
          const recent = data.items.map((item) => ({
            title: item.title,
            url: item.html_url,
            repo: item.repository_url.replace(
              "https://api.github.com/repos/",
              "",
            ),
            mergedAt: (item.closed_at ?? item.updated_at).slice(0, 10),
          }));
          if (recent.length) apply({ recent });
        })
        .catch(() => {});
    }

    refresh();

    // Keep it live rather than merely current-at-load.
    const id = setInterval(refresh, 120_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      controller.abort();
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return state;
}
