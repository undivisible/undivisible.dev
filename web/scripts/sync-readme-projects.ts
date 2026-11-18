import { readFile } from "node:fs/promises";
import { parseLandingReadme } from "../src/lib/parse-readme-markdown.ts";
import {
  parseGithubLanguageBytes,
  type GithubLanguageStats,
} from "../src/lib/github-repo-languages.ts";
import {
  parseReadme,
  applyReadmeStackFallbacks,
  fillReadmeBundleMissingStacks,
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

function previousBundle(): Promise<ReadmeBundle | undefined> {
  try {
    // eslint-disable-next-line unicorn/no-require-postinstall
    // @ts-expect-error - dynamic require
    const mod = require(OUT_FILE.pathname);
    return Promise.resolve({
      mainHeroQuote:
        typeof mod.mainHeroQuoteFromReadme === "string"
          ? mod.mainHeroQuoteFromReadme
          : "",
      mainProjects: Array.isArray(mod.mainProjectsFromReadme)
        ? mod.mainProjectsFromReadme
        : [],
      utilities: Array.isArray(mod.utilitiesFromReadme)
        ? mod.utilitiesFromReadme
        : [],
      miniapps: Array.isArray(mod.miniappsFromReadme)
        ? mod.miniappsFromReadme
        : [],
      libraries: Array.isArray(mod.librariesFromReadme)
        ? mod.librariesFromReadme
        : [],
    });
  } catch {
    return Promise.resolve(undefined);
  }
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
`;
}

async function withGithubLanguages(
  projects: ReadmeProject[],
  markdown: string,
) {
  let token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    try {
      const auth = Bun.spawnSync(["gh", "auth", "token"], {
        stdout: "pipe",
        stderr: "ignore",
      });
      if (auth.exitCode === 0) token = auth.stdout.toString().trim();
    } catch {
      /* Public API access still works without a local gh installation. */
    }
  }
  const api = async (path: string): Promise<unknown> => {
    try {
      const response = await fetch(`https://api.github.com/${path}`, {
        headers: {
          "User-Agent": "undivisible.dev-sync/1.0",
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(15000),
      });
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  };
  const repositories: Array<{ path: string; homepage: string }> = [];
  for (const owner of ["undivisible", "tschk"]) {
    for (let page = 1; ; page++) {
      const data = await api(`users/${owner}/repos?per_page=100&page=${page}`);
      if (!Array.isArray(data)) break;
      for (const repo of data) {
        if (
          repo &&
          typeof repo === "object" &&
          "full_name" in repo &&
          typeof repo.full_name === "string" &&
          "homepage" in repo &&
          typeof repo.homepage === "string"
        )
          repositories.push({ path: repo.full_name, homepage: repo.homepage });
      }
      if (data.length < 100) break;
    }
  }
  const identity = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const site = (href: string) => {
    try {
      const url = new URL(href);
      return url.host + url.pathname.replace(/\/$/, "");
    } catch {
      return null;
    }
  };
  const readmeRepos = [
    ...markdown.matchAll(
      /https:\/\/github\.com\/([^/\s)]+\/[^/\s)]+)(?=[/)\s])/g,
    ),
  ].map((match) => match[1]!);
  const enriched: Array<ReadmeProject & { github: GithubLanguageStats }> = [];
  for (let start = 0; start < projects.length; start += 4) {
    enriched.push(
      ...(await Promise.all(
        projects.slice(start, start + 4).map(async (project) => {
          // Only an explicit README link or a matching GitHub homepage verifies a custom site's repository.
          const repository =
            githubRepoPathFromHref(project.href) ??
            readmeRepos.find(
              (path) =>
                identity(path.split("/")[1] ?? "") === identity(project.key),
            ) ??
            repositories.find(
              (repo) =>
                identity(repo.path.split("/")[1] ?? "") ===
                  identity(project.key) &&
                site(repo.homepage) !== null &&
                site(repo.homepage) === site(project.href),
            )?.path;
          const metadata = repository ? await api(`repos/${repository}`) : null;
          const publicRepository =
            metadata &&
            typeof metadata === "object" &&
            "private" in metadata &&
            metadata.private === false;
          return {
            ...project,
            github: repository
              ? {
                  repository,
                  languages: publicRepository
                    ? parseGithubLanguageBytes(
                        await api(`repos/${repository}/languages`),
                      )
                    : null,
                }
              : null,
          };
        }),
      )),
    );
  }
  return enriched;
}

const LOCAL_NOW = new URL("../public/now.md", import.meta.url);

let md: string;
try {
  md = process.env.PROFILE_README_URL
    ? await fetchProfileMarkdown({ urls: profileMarkdownUrls() })
    : await readFile(new URL("../../projects.md", import.meta.url), "utf8");
} catch (error) {
  try {
    md = await Bun.file(LOCAL_NOW).text();
    console.warn(
      `profile fetch failed (${error}); using ${LOCAL_NOW.pathname}`,
    );
  } catch {
    console.error(error);
    process.exit(1);
  }
}

const freshBundle = normalizeReadmeBundle(parseReadme(md));
const previous = await previousBundle();
const withFallbacks = previous
  ? applyReadmeStackFallbacks(freshBundle, previous)
  : freshBundle;
const bundle = await fillReadmeBundleMissingStacks(withFallbacks);

// The landing page's full inventory follows the user's profile README, not curated highlights.
let landingProjects: ReadmeProject[];
let landingMarkdown: string;
try {
  landingMarkdown = await fetchProfileMarkdown({
    urls: [
      "https://raw.githubusercontent.com/undivisible/undivisible/main/README.md",
    ],
  });
  landingProjects = parseLandingReadme(landingMarkdown);
} catch {
  console.warn(
    "Profile README unavailable; using the local project-copy fallback",
  );
  landingMarkdown = md;
  landingProjects = parseLandingReadme(md);
}

await Bun.write(
  OUT_FILE,
  emitTs(bundle, await withGithubLanguages(landingProjects, landingMarkdown)),
);

// Patch email: upstream README still has old address
const generated = await Bun.file(OUT_FILE.pathname).text();
await Bun.write(
  OUT_FILE,
  generated.replaceAll("max@undivisible.dev", "max@tsc.hk"),
);

console.log(
  `wrote ${OUT_FILE.pathname} (${bundle.mainProjects.length} main, ${bundle.utilities.length} utilities, ${bundle.miniapps.length} miniapps, ${bundle.libraries.length} libraries)`,
);
