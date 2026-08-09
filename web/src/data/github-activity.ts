/**
 * GitHub activity on BasedHardware/omi, refreshed by
 * `bun run scripts/sync-github-activity.ts` (best-effort — this committed
 * snapshot is the fallback, so an offline build never breaks).
 *
 * Snapshot taken 2026-08-08 from the GitHub API.
 */

export type MergedPr = {
  number: number;
  title: string;
  mergedAt: string;
};

export const GITHUB_ACTIVITY = {
  /** Whole account, all repositories, GitHub search API. */
  account: {
    pullRequests: 1820,
    merged: 891,
    pullRequestsThisYear: 1785,
    commitsThisYear: 10798,
    repos: 91, // 69 personal + 22 under tschk
    /** Merged into repositories owned by neither me nor tsc.hk. */
    mergedElsewhere: 165,
  },
  repo: "BasedHardware/omi",
  author: "undivisible",
  since: "2026-07-20",
  verifiedAt: "2026-08-08",
  total: { pullRequests: 101, merged: 42, commits: 199 },
  thisMonth: { pullRequests: 34, merged: 3 },
  allPrsUrl:
    "https://github.com/BasedHardware/omi/pulls?q=is%3Apr+author%3Aundivisible",
  recentMerged: [
    {
      number: 11009,
      title: "feat(chat): route managed desktop chat through GPT-5.6 Luna",
      mergedAt: "2026-08-04",
    },
    {
      number: 11024,
      title: "ci(release): align mobile cadence hygiene guard",
      mergedAt: "2026-08-02",
    },
    {
      number: 10973,
      title:
        "perf(desktop): stop sending every tool's docs twice per chat turn",
      mergedAt: "2026-08-01",
    },
    {
      number: 10929,
      title: "feat(windows): show memory provenance",
      mergedAt: "2026-08-01",
    },
    {
      number: 10946,
      title: "ci: repair desktop changelog fragment",
      mergedAt: "2026-07-31",
    },
    {
      number: 10924,
      title: "fix(desktop): serialize mic watchdog reset",
      mergedAt: "2026-07-31",
    },
    {
      number: 10920,
      title:
        "fix(desktop): surface authoritative current time in chat identity context",
      mergedAt: "2026-07-31",
    },
    {
      number: 10876,
      title: "fix(desktop): route Escape by UI layer",
      mergedAt: "2026-07-30",
    },
  ] satisfies MergedPr[],
} as const;
