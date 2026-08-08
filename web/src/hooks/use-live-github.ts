"use client";

import { useEffect, useState } from "react";
import { GITHUB_ACTIVITY } from "@/data/github-activity";

export type LiveGithub = {
  prsTotal: number;
  prsThisYear: number;
  merged: number;
  commitsThisYear: number;
  repos: number;
  omiThisMonth: number;
  lastMerged: { title: string; url: string } | null;
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

/**
 * The numbers on the page, from the GitHub API at load time.
 *
 * Renders instantly from the committed snapshot, then each figure is replaced
 * as its live response lands — so the site is current without a rebuild, and
 * a rate-limited or offline visit still shows real (just older) numbers.
 */
export function useLiveGithub(): LiveGithub {
  const [state, setState] = useState<LiveGithub>({
    prsTotal: GITHUB_ACTIVITY.account.pullRequests,
    prsThisYear: GITHUB_ACTIVITY.account.pullRequestsThisYear,
    merged: GITHUB_ACTIVITY.account.merged,
    commitsThisYear: GITHUB_ACTIVITY.account.commitsThisYear,
    repos: GITHUB_ACTIVITY.account.repos,
    omiThisMonth: GITHUB_ACTIVITY.thisMonth.pullRequests,
    lastMerged: GITHUB_ACTIVITY.recentMerged[0]
      ? {
          title: GITHUB_ACTIVITY.recentMerged[0].title,
          url: `https://github.com/${GITHUB_ACTIVITY.repo}/pull/${GITHUB_ACTIVITY.recentMerged[0].number}`,
        }
      : null,
    live: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const author = GITHUB_ACTIVITY.author;
    const year = new Date().getFullYear();
    const monthStart = `${new Date().toISOString().slice(0, 8)}01`;

    const apply = (patch: Partial<LiveGithub>) =>
      setState((current) => ({ ...current, ...patch, live: true }));

    void count(`author:${author} is:pr created:>=${year}-01-01`, signal)
      .then((prsThisYear) => apply({ prsThisYear }))
      .catch(() => {});
    void count(`author:${author} is:pr is:merged`, signal)
      .then((merged) => apply({ merged }))
      .catch(() => {});
    void count(`author:${author} is:pr`, signal)
      .then((prsTotal) => apply({ prsTotal }))
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
      )}&sort=updated&order=desc&per_page=1`,
      { headers: JSON_HEADERS, signal },
    )
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          items: Array<{ title: string; html_url: string }>;
        };
        const item = data.items[0];
        if (item)
          apply({ lastMerged: { title: item.title, url: item.html_url } });
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return state;
}
