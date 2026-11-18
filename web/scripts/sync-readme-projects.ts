import { readFile, stat } from "node:fs/promises";
import {
  parseLandingReadme,
  normalizeProjectHref,
} from "../src/lib/parse-readme-markdown.ts";
import { createPublicPortfolioFilter } from "../src/lib/public-portfolio.ts";
import {
  parseGithubLanguageBytes,
  type GithubLanguageStats,
} from "../src/lib/github-repo-languages.ts";
import {
  parseReadme,
  fetchProfileMarkdown,
  normalizeReadmeBundle,
  profileMarkdownUrls,
  githubRepoPathFromHref,
  type ReadmeBundle,
  type ReadmeProject,
} from "../src/lib/profile-readme.ts";

const OUT_FILE = new URL(
  "../src/data/readme-projects.generated.ts",
  import.meta.url,
);
const METADATA_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Previous output supplies source associations and recent public bytes, never membership or copy.
const associations = new Map<string, string>();
const recentLanguages = new Map<string, NonNullable<GithubLanguageStats>>();
const languageFetchedAt = new Map<string, number>();
try {
  const previous: unknown = await import(OUT_FILE.href);
  const legacyFetchedAt = (await stat(OUT_FILE)).mtimeMs;
  const timestamps =
    previous &&
    typeof previous === "object" &&
    "githubLanguagesFetchedAt" in previous
      ? previous.githubLanguagesFetchedAt
      : undefined;
  if (
    previous &&
    typeof previous === "object" &&
    "landingProjectsFromReadme" in previous &&
    Array.isArray(previous.landingProjectsFromReadme)
  ) {
    for (const project of previous.landingProjectsFromReadme) {
      if (
        !project ||
        typeof project !== "object" ||
        typeof project.href !== "string" ||
        !project.github ||
        typeof project.github.repository !== "string"
      )
        continue;
      const repository = project.github.repository;
      if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) continue;
      if (!URL.canParse(project.href)) continue;
      associations.set(normalizeProjectHref(project.href), repository);
      associations.set(
        normalizeProjectHref(project.href).replace(/\/$/, ""),
        repository,
      );
      associations.set(
        new URL(normalizeProjectHref(project.href)).href,
        repository,
      );
      const languages = parseGithubLanguageBytes(project.github.languages);
      const timestamp =
        timestamps && typeof timestamps === "object" && repository in timestamps
          ? Reflect.get(timestamps, repository)
          : legacyFetchedAt;
      if (
        typeof timestamp === "number" &&
        timestamp <= Date.now() &&
        Date.now() - timestamp < METADATA_MAX_AGE_MS &&
        languages
      ) {
        recentLanguages.set(repository.toLowerCase(), {
          repository,
          languages,
        });
        languageFetchedAt.set(repository, timestamp);
      }
    }
  }
} catch {
  // A first sync has no previous metadata to reuse.
}

function emitTs(
  bundle: ReadmeBundle,
  landingProjects: Array<ReadmeProject & { github: GithubLanguageStats }>,
): string {
  return `import type { GithubLanguageStats } from "../lib/github-repo-languages";

export type ReadmeProject = {
  key: string;
  name: string;
  href: string;
  desc: string;
  stack?: string;
  category?: string;
};

export const mainHeroQuoteFromReadme: string = ${JSON.stringify(bundle.mainHeroQuote)};

export const mainProjectsFromReadme: ReadmeProject[] = ${JSON.stringify(bundle.mainProjects, null, 2)};

export const utilitiesFromReadme: ReadmeProject[] = ${JSON.stringify(bundle.utilities, null, 2)};

export const miniappsFromReadme: ReadmeProject[] = ${JSON.stringify(bundle.miniapps, null, 2)};

export const librariesFromReadme: ReadmeProject[] = ${JSON.stringify(bundle.libraries, null, 2)};

export const landingProjectsFromReadme: Array<ReadmeProject & { github: GithubLanguageStats }> = ${JSON.stringify(landingProjects, null, 2)};

export const githubLanguagesFetchedAt: Record<string, number> = ${JSON.stringify(Object.fromEntries(landingProjects.flatMap((project) => (project.github ? [[project.github.repository, languageFetchedAt.get(project.github.repository)]] : []))), null, 2)};
`;
}

const languageRequests = new Map<
  string,
  Promise<NonNullable<GithubLanguageStats>>
>();
function publicLanguages(
  repository: string,
): Promise<NonNullable<GithubLanguageStats>> {
  const key = repository.toLowerCase();
  const cached = recentLanguages.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = languageRequests.get(key);
  if (pending) return pending;
  const request = (async () => {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/languages`,
      {
        headers: {
          "User-Agent": "undivisible.dev-sync/1.0",
          Accept: "application/vnd.github+json",
        },
        credentials: "omit",
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok)
      throw new Error(
        `Public languages unavailable for ${repository}: ${response.status}`,
      );
    const languages = parseGithubLanguageBytes(await response.json());
    if (!languages)
      throw new Error(`Invalid public language bytes for ${repository}`);
    const canonical =
      /^\/repos\/([^/]+\/[^/]+)\/languages$/.exec(
        new URL(response.url).pathname,
      )?.[1] ?? repository;
    languageFetchedAt.set(canonical, Date.now());
    return { repository: canonical, languages };
  })();
  languageRequests.set(key, request);
  return request;
}

async function withGithubLanguages(projects: ReadmeProject[]) {
  const enriched: Array<ReadmeProject & { github: GithubLanguageStats }> = [];
  for (let start = 0; start < projects.length; start += 4) {
    enriched.push(
      ...(await Promise.all(
        projects.slice(start, start + 4).map(async (project) => {
          const repository =
            githubRepoPathFromHref(project.href) ??
            associations.get(normalizeProjectHref(project.href)) ??
            associations.get(
              normalizeProjectHref(project.href).replace(/\/$/, ""),
            );
          if (!repository) return { ...project, github: null };
          return { ...project, github: await publicLanguages(repository) };
        }),
      )),
    );
  }
  return enriched;
}

const filterPublicPortfolio = createPublicPortfolioFilter();
const profileReadmeUrl = process.env.PROFILE_README_URL;
const source = profileReadmeUrl
  ? await fetchProfileMarkdown({ urls: profileMarkdownUrls() })
  : await readFile(new URL("../../projects.md", import.meta.url), "utf8");
const md = await filterPublicPortfolio(source, associations);
const bundle = normalizeReadmeBundle(parseReadme(md));

// README curation owns membership; unavailable upstream data must not revive a local snapshot.
const landingSource = profileReadmeUrl
  ? source
  : await fetchProfileMarkdown({
      urls: [
        "https://raw.githubusercontent.com/undivisible/undivisible/main/README.md",
      ],
    });
const landingMarkdown = await filterPublicPortfolio(
  landingSource,
  associations,
);
const landingProjects = await withGithubLanguages(
  parseLandingReadme(landingMarkdown),
);

await Bun.write(
  OUT_FILE,
  emitTs(bundle, landingProjects).replaceAll(
    "max@undivisible.dev",
    "max@tsc.hk",
  ),
);
console.log(
  `wrote ${OUT_FILE.pathname} (${bundle.mainProjects.length} main, ${bundle.utilities.length} utilities, ${bundle.miniapps.length} miniapps, ${bundle.libraries.length} libraries)`,
);
