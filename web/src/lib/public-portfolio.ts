import { parseLandingReadme } from "./parse-readme-markdown";

/** Checks public access without using local GitHub credentials or inferring authorship. */
export function createPublicPortfolioFilter({
  fetchUpstream = fetch,
  now = Date.now,
  timeoutMs = 5000,
}: {
  fetchUpstream?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
} = {}) {
  const visibility = new Map<string, { public: boolean; at: number }>();
  const isPublic = async (repository: string): Promise<boolean> => {
    const cached = visibility.get(repository);
    if (cached && now() - cached.at < 60_000) return cached.public;
    let url = new URL(`https://github.com/${repository}`);
    for (let redirects = 0; redirects < 4; redirects++) {
      const response = await fetchUpstream(url.href, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "User-Agent": "undivisible.dev-public-portfolio" },
      });
      if (response.status === 429) {
        // GitHub's page throttle is separate from its anonymous Git transport.
        const git = await fetchUpstream(
          `${url.origin}${url.pathname.replace(/\/$/, "")}.git/info/refs?service=git-upload-pack`,
          {
            method: "GET",
            redirect: "manual",
            signal: AbortSignal.timeout(timeoutMs),
            headers: { "User-Agent": "undivisible.dev-public-portfolio" },
          },
        );
        await git.body?.cancel();
        if (git.status === 401 || git.status === 404) {
          visibility.set(repository, { public: false, at: now() });
          return false;
        }
        if (
          git.status === 200 &&
          git.headers
            .get("Content-Type")
            ?.startsWith("application/x-git-upload-pack-advertisement")
        ) {
          visibility.set(repository, { public: true, at: now() });
          return true;
        }
        throw new Error(`Portfolio public verification failed (${git.status})`);
      }
      if (response.status === 404 || response.status === 410 || response.ok) {
        const result = response.ok;
        visibility.set(repository, { public: result, at: now() });
        return result;
      }
      const location = response.headers.get("Location");
      if (response.status >= 300 && response.status < 400 && location) {
        const next = new URL(location, url);
        if (
          next.origin !== "https://github.com" ||
          !/^\/[\w.-]+\/[\w.-]+\/?$/.test(next.pathname)
        )
          throw new Error("Portfolio repository redirect rejected");
        url = next;
      } else
        throw new Error(
          `Portfolio public verification failed (${response.status})`,
        );
    }
    throw new Error("Portfolio repository redirect limit");
  };

  return async (
    markdown: string,
    associations: ReadonlyMap<string, string> = new Map(),
  ): Promise<string> => {
    const projects = parseLandingReadme(markdown);
    const repositoriesByHref = new Map(
      [...associations].map(([href, repository]) => [
        href.replace(/\/$/, ""),
        repository,
      ]),
    );
    const kept = [];
    for (let offset = 0; offset < projects.length; offset += 16) {
      const batch = await Promise.all(
        projects.slice(offset, offset + 16).map(async (project) => {
          if (project.href === "#") return null;
          const match =
            /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)(?:[/?#]|$)/i.exec(
              project.href,
            );
          const repository =
            match?.[1]?.replace(/\.git$/i, "") ??
            repositoriesByHref.get(project.href.replace(/\/$/, ""));
          return !repository || (await isPublic(repository)) ? project : null;
        }),
      );
      kept.push(...batch.filter((project) => project !== null));
    }
    const seen = new Set<string>();
    const categories = new Map<string, string[]>();
    for (const project of kept) {
      if (seen.has(project.key)) continue;
      seen.add(project.key);
      const category = project.category ?? "projects";
      const entries = categories.get(category) ?? [];
      entries.push(
        `- **[${project.name}](${project.href})** — ${project.desc}`,
      );
      categories.set(category, entries);
    }
    return [...categories]
      .map(([category, entries]) => `## ${category}\n\n${entries.join("\n")}\n`)
      .join("\n");
  };
}
