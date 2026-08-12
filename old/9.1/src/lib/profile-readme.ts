import { scrapeGithubRepoLanguages, sleep } from "@/lib/github-repo-languages";
import {
  normalizeReadmeBundle,
  parseReadme,
  profileMarkdownUrls,
  type ReadmeBundle,
  type ReadmeProject,
} from "@/lib/parse-readme-markdown";

export {
  normalizeReadmeBundle,
  parseReadme,
  profileMarkdownUrls,
  projectKey,
  readmeBundleProjectCount,
  DEFAULT_PROFILE_MARKDOWN_URL,
  DEFAULT_RESUME_MARKDOWN_URL,
  PROFILE_PROJECT_LIST_MARKDOWN_URL,
  type ReadmeBundle,
  type ReadmeProject,
} from "@/lib/parse-readme-markdown";

export {
  resumePrintProjectSections,
  resumeProjectCategoryRows,
  type ResumePrintProjectSection,
  type ResumeProjectCategoryRow,
} from "@/lib/readme-resume-layout";

export function githubRepoPathFromHref(href: string): string | undefined {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return undefined;
  }
  if (url.hostname !== "github.com") return undefined;
  const [owner, repo] = url.pathname.split("/").filter(Boolean);
  if (!owner || !repo) return undefined;
  return `${owner}/${repo.replace(/\.git$/i, "")}`;
}

export function formatLinguistLanguages(
  languages: Record<string, number>,
): string | undefined {
  const names = Object.entries(languages)
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  if (names.length === 0) return undefined;
  return `${names.join(", ")}.`;
}

const STACK_SCRAPE_DELAY_MS = 250;

async function fillMissingRepoLanguageStacks(
  projects: ReadmeProject[],
  signal?: AbortSignal,
): Promise<ReadmeProject[]> {
  const filled: ReadmeProject[] = [];
  for (const project of projects) {
    if (project.stack) {
      filled.push(project);
      continue;
    }
    const repoPath = githubRepoPathFromHref(project.href);
    if (!repoPath) {
      filled.push(project);
      continue;
    }
    const stack = await scrapeGithubRepoLanguages(repoPath, signal);
    filled.push(stack ? { ...project, stack } : project);
    await sleep(STACK_SCRAPE_DELAY_MS);
  }
  return filled;
}

export async function fillReadmeBundleMissingStacks(
  bundle: ReadmeBundle,
  signal?: AbortSignal,
): Promise<ReadmeBundle> {
  return {
    ...bundle,
    mainProjects: await fillMissingRepoLanguageStacks(
      bundle.mainProjects,
      signal,
    ),
    utilities: await fillMissingRepoLanguageStacks(bundle.utilities, signal),
    miniapps: await fillMissingRepoLanguageStacks(bundle.miniapps, signal),
    libraries: await fillMissingRepoLanguageStacks(bundle.libraries, signal),
  };
}

function projectIdentity(project: ReadmeProject): string {
  return `${project.key}:${project.href.replace(/\/$/, "").toLowerCase()}`;
}

function applyStackFallbacks(
  fresh: ReadmeProject[],
  previous: ReadmeProject[],
): ReadmeProject[] {
  const stacks = new Map(
    previous
      .filter((project) => project.stack)
      .map((project) => [projectIdentity(project), project.stack!]),
  );
  return fresh.map((project) =>
    project.stack
      ? project
      : {
          ...project,
          stack: stacks.get(projectIdentity(project)),
        },
  );
}

export function applyReadmeStackFallbacks(
  fresh: ReadmeBundle,
  previous: ReadmeBundle,
): ReadmeBundle {
  return {
    ...fresh,
    mainProjects: applyStackFallbacks(
      fresh.mainProjects,
      previous.mainProjects,
    ),
    utilities: applyStackFallbacks(fresh.utilities, previous.utilities),
    miniapps: applyStackFallbacks(fresh.miniapps, previous.miniapps),
    libraries: applyStackFallbacks(fresh.libraries, previous.libraries),
  };
}

export async function fetchProfileMarkdown(options?: {
  signal?: AbortSignal;
  urls?: string[];
}): Promise<string> {
  const urls = options?.urls ?? profileMarkdownUrls();
  for (const url of urls) {
    const res = await fetch(url, { signal: options?.signal });
    if (!res.ok) continue;
    return res.text();
  }
  throw new Error(`profile markdown fetch failed: ${urls.join(" -> ")}`);
}

export async function fetchProfileReadmeProjects(options?: {
  includeRepoLanguageStacks?: boolean;
  signal?: AbortSignal;
  urls?: string[];
}): Promise<ReadmeBundle> {
  const normalized = normalizeReadmeBundle(
    parseReadme(await fetchProfileMarkdown(options)),
  );
  if (options?.includeRepoLanguageStacks === false) {
    return normalized;
  }
  return fillReadmeBundleMissingStacks(normalized, options?.signal);
}

export function getReadmeBundleFromGenerated(): ReadmeBundle {
  // eslint-disable-next-line unicorn/no-require-postinstall
  // @ts-ignore - dynamic require of generated file, exists after prebuild
  const mod = require("@/data/readme-projects.generated");
  return {
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
  };
}

export function getProfileReadmeProjects(): ReadmeBundle {
  return getReadmeBundleFromGenerated();
}