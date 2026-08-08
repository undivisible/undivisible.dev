/**
 * Refresh src/data/github-activity.ts from the GitHub search API.
 *
 * Unauthenticated (public repo, counts and titles only), and deliberately not
 * part of prebuild: it rewrites a committed file, and a failed fetch leaves
 * the previous snapshot in place so builds never depend on api.github.com.
 *
 *   bun run scripts/sync-github-activity.ts
 */
const REPO = "BasedHardware/omi";
const AUTHOR = "undivisible";
const SINCE = "2026-07-20";
const OUT = new URL("../src/data/github-activity.ts", import.meta.url);

const API = "https://api.github.com/search/issues?q=";
const HEADERS = { accept: "application/vnd.github+json" };

async function count(query: string): Promise<number> {
  const res = await fetch(`${API}${encodeURIComponent(query)}&per_page=1`, {
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`${res.status} for ${query}`);
  return ((await res.json()) as { total_count: number }).total_count;
}

async function recentMerged(): Promise<
  Array<{ number: number; title: string; mergedAt: string }>
> {
  const query = `repo:${REPO} author:${AUTHOR} is:pr is:merged`;
  const res = await fetch(
    `${API}${encodeURIComponent(query)}&sort=created&order=desc&per_page=8`,
    { headers: HEADERS },
  );
  if (!res.ok) throw new Error(`${res.status} for recent merged`);
  const data = (await res.json()) as {
    items: Array<{ number: number; title: string; closed_at: string }>;
  };
  return data.items.map((item) => ({
    number: item.number,
    title: item.title,
    mergedAt: item.closed_at.slice(0, 10),
  }));
}

const base = `repo:${REPO} author:${AUTHOR} is:pr`;
const monthStart = `${new Date().toISOString().slice(0, 8)}01`;

const [total, merged, monthTotal, monthMerged, commits, recent] =
  await Promise.all([
    count(base),
    count(`${base} is:merged`),
    count(`${base} created:>=${monthStart}`),
    count(`${base} is:merged created:>=${monthStart}`),
    // Commit search uses a different endpoint; counts only.
    (async () => {
      const res = await fetch(
        `https://api.github.com/search/commits?q=${encodeURIComponent(
          `repo:${REPO} author:${AUTHOR}`,
        )}&per_page=1`,
        { headers: { accept: "application/vnd.github.cloak-preview+json" } },
      );
      if (!res.ok) throw new Error(`${res.status} for commits`);
      return ((await res.json()) as { total_count: number }).total_count;
    })(),
    recentMerged(),
  ]);

const today = new Date().toISOString().slice(0, 10);

const emit = `/**
 * GitHub activity on ${REPO}, refreshed by
 * \`bun run scripts/sync-github-activity.ts\` (best-effort — this committed
 * snapshot is the fallback, so an offline build never breaks).
 *
 * Snapshot taken ${today} from the GitHub API.
 */

export type MergedPr = {
  number: number;
  title: string;
  mergedAt: string;
};

export const GITHUB_ACTIVITY = {
  repo: ${JSON.stringify(REPO)},
  author: ${JSON.stringify(AUTHOR)},
  since: ${JSON.stringify(SINCE)},
  verifiedAt: ${JSON.stringify(today)},
  total: { pullRequests: ${total}, merged: ${merged}, commits: ${commits} },
  thisMonth: { pullRequests: ${monthTotal}, merged: ${monthMerged} },
  allPrsUrl:
    "https://github.com/${REPO}/pulls?q=is%3Apr+author%3A${AUTHOR}",
  recentMerged: ${JSON.stringify(recent, null, 2)} satisfies MergedPr[],
} as const;
`;

await Bun.write(OUT, emit);
console.log(
  `wrote github-activity.ts (${total} PRs, ${merged} merged, ${commits} commits)`,
);
