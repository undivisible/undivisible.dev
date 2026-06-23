import {
  librariesFromReadme,
  mainHeroQuoteFromReadme,
  mainProjectsFromReadme,
  miniappsFromReadme,
  utilitiesFromReadme,
} from "@/data/readme-projects.generated";
import { scrapeGithubRepoLanguages, sleep } from "@/lib/github-repo-languages";

export type ReadmeProject = {
  key: string;
  name: string;
  href: string;
  desc: string;
  stack?: string;
  category?: string;
};

export type ReadmeBundle = {
  mainHeroQuote: string;
  mainProjects: ReadmeProject[];
  utilities: ReadmeProject[];
  miniapps: ReadmeProject[];
  libraries: ReadmeProject[];
};

export function projectKey(name: string): string {
  return name
    .replace(/\s*\((wip|shelved|archived)\)\s*/gi, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9/_-]/g, "");
}

function displayName(name: string): string {
  return name.trim();
}

function stripMdLinks(text: string): string {
  return text
    .replace(/##+ /g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1$2");
}

function collapseWs(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function pushUnique(list: ReadmeProject[], p: ReadmeProject) {
  if (!list.some((x) => x.href === p.href && x.key === p.key)) list.push(p);
}

const LINKED_WITH_DESC =
  /^-\s+\*\*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\*\*\s*(?:–|—|-)?\s*(.+?)\s*$/;
const LINKED_NO_URL = /^-\s+\*\*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\*\*\s*$/;
const OTHER_WITH_DESC = /^-\s+\*\*([^*]+)\*\*\s*(?:–|—|-)?\s*(.+?)\s*$/;
const OTHER_NO_DESC = /^-\s+\*\*([^*]+)\*\*\s*$/;
const H3_LINK = /^###\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*$/;
const H2_LINK = /^##\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*$/;

function parseLinkedLine(line: string): ReadmeProject | null {
  const withDesc = line.match(LINKED_WITH_DESC);
  if (withDesc) {
    const nm = withDesc[1]!;
    return {
      key: projectKey(nm),
      name: displayName(nm),
      href: withDesc[2]!,
      desc: collapseWs(stripMdLinks(withDesc[3]!)),
    };
  }
  const noDesc = line.match(LINKED_NO_URL);
  if (noDesc) {
    const nm = noDesc[1]!;
    return {
      key: projectKey(nm),
      name: displayName(nm),
      href: noDesc[2]!,
      desc: "",
    };
  }
  return null;
}

function parseOtherLine(line: string): ReadmeProject | null {
  const wd = line.match(OTHER_WITH_DESC);
  if (wd) {
    const nm = wd[1]!.trim();
    return {
      key: projectKey(nm),
      name: displayName(nm),
      href: "#",
      desc: collapseWs(stripMdLinks(wd[2]!)),
    };
  }
  const nd = line.match(OTHER_NO_DESC);
  if (nd) {
    const nm = nd[1]!.trim();
    return {
      key: projectKey(nm),
      name: displayName(nm),
      href: "#",
      desc: "",
    };
  }
  return null;
}

function assignFrameworkDescriptions(
  mainProjects: ReadmeProject[],
  bodyLines: string[],
): string {
  const quoteBits: string[] = [];
  const proseBits: string[] = [];
  for (const ln of bodyLines) {
    const t = ln.trim();
    if (!t) continue;
    if (t.startsWith(">")) {
      quoteBits.push(t.replace(/^\s*>\s?/, "").trim());
    } else {
      proseBits.push(t);
    }
  }
  const heroQuote = collapseWs(stripMdLinks(quoteBits.join(" ")));
  const prose = collapseWs(stripMdLinks(proseBits.join("\n")));
  if (mainProjects.length < 2) {
    for (const p of mainProjects) {
      p.desc = heroQuote ? prose : collapseWs(`${heroQuote} ${prose}`.trim());
    }
    return heroQuote;
  }
  const m = prose.match(/^(.*?)(\.\s+)(aurorality.*)$/i);
  if (!m) {
    mainProjects[0]!.desc = prose;
    mainProjects[1]!.desc = prose;
    return heroQuote;
  }
  const leftBody = collapseWs(`${m[1]!.trim()}${m[2]!.trim()}`);
  const rightBody = collapseWs(m[3]!.trim());
  mainProjects[0]!.desc = heroQuote
    ? leftBody
    : collapseWs(`${heroQuote} ${leftBody}`);
  mainProjects[1]!.desc = rightBody;
  return heroQuote;
}

export function parseReadme(md: string): ReadmeBundle {
  const mainProjects: ReadmeProject[] = [];
  const utilities: ReadmeProject[] = [];
  const miniapps: ReadmeProject[] = [];
  const libraries: ReadmeProject[] = [];
  let mainHeroQuote = "";

  let mode:
    | "idle"
    | "framework_body"
    | "subprojects"
    | "other"
    | "semitech"
    | "semiother"
    | "miniapps"
    | "libraries" = "idle";
  let currentCategory = "";

  const frameworkBodyLines: string[] = [];

  const lines = md.split(/\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (mode === "framework_body") {
      if (trimmed === "### subprojects") {
        mainHeroQuote = assignFrameworkDescriptions(
          mainProjects,
          frameworkBodyLines,
        );
        mode = "subprojects";
        i++;
        continue;
      }
      if (trimmed.startsWith("## ")) {
        mode = "idle";
        continue;
      }
      frameworkBodyLines.push(line);
      i++;
      continue;
    }

    if (mode === "miniapps") {
      if (trimmed.startsWith("## ")) {
        mode = "idle";
        continue;
      }
      if (trimmed.startsWith("### ")) {
        currentCategory = trimmed.replace("### ", "").trim();
        i++;
        continue;
      }
      const linked = parseLinkedLine(line);
      if (linked) {
        if (currentCategory) linked.category = currentCategory;
        pushUnique(miniapps, linked);
      } else {
        const other = parseOtherLine(line);
        if (other) {
          if (currentCategory) other.category = currentCategory;
          pushUnique(miniapps, other);
        }
      }
      i++;
      continue;
    }

    if (mode === "libraries") {
      if (trimmed.startsWith("## ")) {
        mode = "idle";
        continue;
      }
      const linked = parseLinkedLine(trimmed);
      if (linked) pushUnique(libraries, linked);
      i++;
      continue;
    }

    if (mode === "semitech") {
      if (trimmed === "***") {
        mode = "idle";
        i++;
        continue;
      }
      const linked = parseLinkedLine(line);
      if (linked) {
        pushUnique(utilities, linked);
        i++;
        continue;
      }
      const other = parseOtherLine(line);
      if (other) pushUnique(utilities, other);
      i++;
      continue;
    }

    if (mode === "other") {
      if (trimmed === "***") {
        mode = "idle";
        i++;
        continue;
      }
      const other = parseOtherLine(line);
      if (other) pushUnique(utilities, other);
      i++;
      continue;
    }

    if (mode === "subprojects") {
      if (trimmed === "***" || trimmed.startsWith("## [atechnology")) {
        mode = "idle";
        i++;
        continue;
      }
      const linked = parseLinkedLine(line);
      if (linked) pushUnique(utilities, linked);
      i++;
      continue;
    }

    const linkMatches = [
      ...trimmed.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g),
    ];
    const headlineCore = (trimmed.split("(")[0] ?? trimmed).toLowerCase();
    const isExcludedHeadline =
      headlineCore.includes("atechnology company") ||
      headlineCore.includes("semitechnological") ||
      trimmed === "## miniapps" ||
      trimmed.toLowerCase().startsWith("## libraries");
    if (
      trimmed.startsWith("##") &&
      !isExcludedHeadline &&
      linkMatches.length >= 2
    ) {
      for (const m of linkMatches) {
        const nm = m[1]!;
        mainProjects.push({
          key: projectKey(nm),
          name: displayName(nm),
          href: m[2]!,
          desc: "",
        });
      }
      mode = "framework_body";
      frameworkBodyLines.length = 0;
      i++;
      continue;
    }

    if (
      trimmed.startsWith("## ") &&
      !isExcludedHeadline &&
      linkMatches.length === 1
    ) {
      const m = linkMatches[0]!;
      const nm = m[1]!;
      let j = i + 1;
      const descLines: string[] = [];
      while (j < lines.length && !lines[j]!.trim().startsWith("## ") && !lines[j]!.trim().startsWith("### ")) {
        descLines.push(lines[j]!);
        j++;
      }
      utilities.push({
        key: projectKey(nm),
        name: displayName(nm),
        href: m[2]!,
        desc: collapseWs(stripMdLinks(descLines.join("\n"))),
      });
      i = j;
      continue;
    }

    if (trimmed === "### subprojects") {
      mode = "subprojects";
      i++;
      continue;
    }

    if (trimmed === "### other") {
      mode = "other";
      i++;
      continue;
    }

    if (trimmed.startsWith("## [semitechnological]")) {
      mode = "semitech";
      i++;
      continue;
    }

    if (trimmed === "## miniapps") {
      mode = "miniapps";
      i++;
      continue;
    }

    if (trimmed.toLowerCase() === "## libraries") {
      mode = "libraries";
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      const h3Fallback = trimmed.match(H3_LINK);
      const nm = h3Fallback
        ? h3Fallback[1]!
        : trimmed.replace("### ", "").trim();
      const href = h3Fallback ? h3Fallback[2]! : "#";
      let j = i + 1;
      const descLines: string[] = [];
      while (j < lines.length && !lines[j]!.trim().startsWith("### ") && !lines[j]!.trim().startsWith("## ")) {
        descLines.push(lines[j]!);
        j++;
      }
      utilities.push({
        key: projectKey(nm),
        name: displayName(nm),
        href,
        desc: collapseWs(stripMdLinks(descLines.join("\n"))),
      });
      i = j;
      continue;
    }

    i++;
  }

  return { mainHeroQuote, mainProjects, utilities, miniapps, libraries };
}

export const DEFAULT_PROFILE_MARKDOWN_URL =
  "https://raw.githubusercontent.com/undivisible/undivisible/main/now.md";

export const DEFAULT_RESUME_MARKDOWN_URL =
  "https://raw.githubusercontent.com/undivisible/undivisible/main/resume.md";

export const LEGACY_PROFILE_MARKDOWN_URL =
  "https://raw.githubusercontent.com/undivisible/undivisible/main/README.md";

export function profileMarkdownUrls(): string[] {
  return process.env.PROFILE_README_URL
    ? [process.env.PROFILE_README_URL]
    : [LEGACY_PROFILE_MARKDOWN_URL];
}

export function promoteAuroralityToUtilities(
  bundle: ReadmeBundle,
): ReadmeBundle {
  const aurIndex = bundle.mainProjects.findIndex((p) => p.key === "aurorality");
  if (aurIndex === -1) return bundle;
  const aur = bundle.mainProjects[aurIndex]!;
  const mainProjects = bundle.mainProjects.filter((_, i) => i !== aurIndex);
  const hasInUtils = bundle.utilities.some((u) => u.key === "aurorality");
  const utilities = hasInUtils ? bundle.utilities : [aur, ...bundle.utilities];
  return { ...bundle, mainProjects, utilities };
}

const EQSWIFT: ReadmeProject = {
  key: "eqswift",
  name: "eqswift",
  href: "https://github.com/semitechnological/eqswift",
  desc: "Rust-to-Swift binding tooling designed to reduce UniFFI boilerplate and make interop practical.",
};

export function appendEqswiftToUtilities(bundle: ReadmeBundle): ReadmeBundle {
  const miniapps = bundle.miniapps.filter((m) => m.key !== "eqswift");
  if (bundle.utilities.some((u) => u.key === "eqswift")) {
    return { ...bundle, miniapps };
  }
  const eqIdx = bundle.utilities.findIndex((u) => u.key === "equilibrium");
  const utilities =
    eqIdx >= 0
      ? [
          ...bundle.utilities.slice(0, eqIdx + 1),
          EQSWIFT,
          ...bundle.utilities.slice(eqIdx + 1),
        ]
      : [EQSWIFT, ...bundle.utilities];
  return { ...bundle, miniapps, utilities };
}

export function normalizeReadmeBundle(bundle: ReadmeBundle): ReadmeBundle {
  return appendEqswiftToUtilities(promoteAuroralityToUtilities(bundle));
}

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
  return {
    mainHeroQuote: mainHeroQuoteFromReadme,
    mainProjects: mainProjectsFromReadme,
    utilities: utilitiesFromReadme,
    miniapps: miniappsFromReadme,
    libraries: librariesFromReadme,
  };
}

export function getProfileReadmeProjects(): ReadmeBundle {
  return getReadmeBundleFromGenerated();
}

const FEATURED_RESUME_PROJECT_KEYS = new Set([
  "inauguration",
  "alpenglow",
  "space",
  "wax",
  "rv8",
  "unthinkclaw",
]);

function isFeaturedResumeProject(project: ReadmeProject): boolean {
  return FEATURED_RESUME_PROJECT_KEYS.has(project.key);
}

function resumeProjectKeysAboveFold(bundle: ReadmeBundle): Set<string> {
  const keys = new Set(FEATURED_RESUME_PROJECT_KEYS);
  const hero = bundle.mainProjects[0]?.key;
  if (hero) keys.add(hero);
  return keys;
}

export type ResumePrintProjectSection = {
  title: string;
  items: ReadmeProject[];
};

export function resumePrintProjectSections(
  bundle: ReadmeBundle,
): ResumePrintProjectSection[] {
  const aboveFold = resumeProjectKeysAboveFold(bundle);
  const allProjects = [
    ...bundle.mainProjects,
    ...bundle.utilities,
    ...bundle.libraries,
    ...bundle.miniapps,
  ];
  const featured = allProjects.filter(isFeaturedResumeProject);
  const rest = allProjects.filter(
    (p) => !isFeaturedResumeProject(p) && !aboveFold.has(p.key),
  );
  return [
    { title: "Flagship projects", items: featured },
    { title: "Other projects", items: rest },
  ];
}

export type ResumeProjectCategoryRow = { label: string; items: string };

export function resumeProjectCategoryRows(
  bundle: ReadmeBundle,
): ResumeProjectCategoryRow[] {
  const aboveFold = resumeProjectKeysAboveFold(bundle);
  const rest = [
    ...bundle.utilities,
    ...bundle.miniapps,
    ...bundle.libraries,
    ...bundle.mainProjects,
  ].filter((p) => !aboveFold.has(p.key));

  const buckets = new Map<string, ReadmeProject[]>();
  const bucketLabel = (p: ReadmeProject): string => {
    if (p.category) return p.category;
    if (bundle.libraries.some((l) => l.key === p.key)) return "libraries";
    if (bundle.utilities.some((u) => u.key === p.key)) return "platforms & tools";
    if (bundle.mainProjects.some((m) => m.key === p.key)) return "frameworks";
    return "other";
  };

  for (const p of rest) {
    const label = bucketLabel(p);
    const list = buckets.get(label) ?? [];
    list.push(p);
    buckets.set(label, list);
  }

  const order = [
    "mobile & desktop",
    "browser extensions",
    "developer tools",
    "web apps",
    "libraries",
    "platforms & tools",
    "frameworks",
    "other",
  ];

  const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

  const rows: ResumeProjectCategoryRow[] = [];
  for (const key of order) {
    const match = [...buckets.entries()].find(
      ([k]) => k.toLowerCase() === key,
    );
    if (!match) continue;
    const [, projects] = match;
    buckets.delete(match[0]);
    rows.push({
      label: titleCase(key),
      items: projects.map((p) => p.name).join(", "),
    });
  }
  for (const [label, projects] of buckets) {
    rows.push({
      label: titleCase(label),
      items: projects.map((p) => p.name).join(", "),
    });
  }
  return rows;
}
