import { safeExternalHref } from "@/lib/safe-external-href";

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

// Canonical full_names verified through the GitHub API; unknown repositories stay untouched.
const MIGRATED_TSCHK_REPOSITORIES = new Set([
  "alpenglow",
  "alpenglowed",
  "apollo",
  "aurorality",
  "crepuscularity",
  "darash",
  "eqswift",
  "eqts",
  "equilibrium",
  "inauguration",
  "moonshine",
  "nexnet",
  "praefectus",
  "rig",
  "rotary",
  "rv8",
  "soliloquy",
  "space",
  "subspace",
  "telekinesis",
  "wax",
  "zkr",
]);

const CORRECTED_PROJECT_REPOSITORIES = new Map([
  ["oil", "semitechnological/oil"],
  ["rs_vimium", "undivisible/rs_vimium"],
  ["anywhere", "undivisible/anywhere"],
  ["ark", "atechnology-company/ark"],
  ["arkie", "arkiecompany/arkie"],
  ["ark-protocol", "arkiecompany/ark-protocol"],
  ["websurfx", "undivisible/websurfx"],
  ["stalwart-lite", "arkiecompany/stalwart-lite"],
  ["darash", "softwarecorporation/darash"],
  ["drift", "undivisible/drift-wallpaper"],
  ["drift-wallpaper", "undivisible/drift-wallpaper"],
]);
const PROJECT_REPOSITORY_OWNERS = new Set([
  "tschk",
  "softwarecorporation",
  "undivisible",
  "arkiecompany",
  "atechnology-company",
  "semitechnological",
]);

export function normalizeProjectHref(href: string): string {
  const safe = safeExternalHref(href);
  if (safe === "#") return safe;
  const url = new URL(safe);
  if (
    url.hostname === "softwarecorporation.github.io" &&
    /^\/darash\/?$/.test(url.pathname)
  ) {
    return "https://darash.tsc.hk";
  }
  if (url.hostname !== "github.com") return href.trim();
  const match = /^\/([^/]+)\/([^/]+)(\/.*)?$/.exec(url.pathname);
  if (!match) return href.trim();
  const owner = match[1]!.toLowerCase();
  if (!PROJECT_REPOSITORY_OWNERS.has(owner)) return href.trim();
  const repo = match[2]!.replace(/\.git$/i, "").toLowerCase();
  const repository =
    CORRECTED_PROJECT_REPOSITORIES.get(repo) ??
    (owner === "tschk" && MIGRATED_TSCHK_REPOSITORIES.has(repo)
      ? `softwarecorporation/${repo}`
      : undefined);
  if (!repository) return href.trim();
  if (
    repository === "softwarecorporation/darash" &&
    !/\.git$/i.test(match[2]!) &&
    (!match[3] || match[3] === "/")
  ) {
    return "https://darash.tsc.hk";
  }
  url.pathname = `/${repository}${/\.git$/i.test(match[2]!) ? ".git" : ""}${match[3] ?? ""}`;
  return url.href;
}

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
const H3_LINK =
  /^###\s+(?:\*\*)?\[([^\]]+)\]\((https?:\/\/[^)]+)\)(?:\*\*)?\s*$/;

function parseH3UtilityHeading(
  trimmed: string,
): { name: string; href: string } | null {
  const linked = trimmed.match(H3_LINK);
  if (linked) {
    return { name: linked[1]!, href: linked[2]! };
  }
  const plain = trimmed.replace(/^###\s+/, "").trim();
  if (!plain || plain.toLowerCase() === "other" || plain === "subprojects") {
    return null;
  }
  return { name: plain, href: "#" };
}

function readFollowingDescription(
  lines: string[],
  start: number,
): [string[], number] {
  const descLines: string[] = [];
  let j = start;
  while (j < lines.length) {
    const t = lines[j]!.trim();
    if (t.startsWith("### ") || t.startsWith("## ") || t === "***") break;
    descLines.push(lines[j]!);
    j++;
  }
  return [descLines, j];
}

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
    const line = lines[i]!.replace(/^\s*[–—]\s*/, "- ");
    const trimmed = line.trim();

    if (mode === "framework_body") {
      if (trimmed.startsWith("## ")) {
        mainHeroQuote = assignFrameworkDescriptions(
          mainProjects,
          frameworkBodyLines,
        );
        mode = "idle";
        continue;
      }
      if (trimmed.startsWith("### ")) {
        if (frameworkBodyLines.length > 0) {
          mainHeroQuote = assignFrameworkDescriptions(
            mainProjects,
            frameworkBodyLines,
          );
          frameworkBodyLines.length = 0;
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
        const h3 = parseH3UtilityHeading(trimmed);
        if (h3) {
          const [descLines, j] = readFollowingDescription(lines, i + 1);
          utilities.push({
            key: projectKey(h3.name),
            name: displayName(h3.name),
            href: h3.href,
            desc: collapseWs(stripMdLinks(descLines.join("\n"))),
          });
          i = j;
          continue;
        }
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
      if (trimmed === "***" || trimmed === "---") {
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
      if (trimmed === "***" || trimmed === "---") {
        mode = "idle";
        i++;
        continue;
      }
      const linked = parseLinkedLine(line);
      if (linked) {
        pushUnique(utilities, linked);
      } else {
        const other = parseOtherLine(line);
        if (other) pushUnique(utilities, other);
      }
      i++;
      continue;
    }

    if (mode === "subprojects") {
      if (
        trimmed === "***" ||
        trimmed === "---" ||
        trimmed.startsWith("## [atechnology")
      ) {
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
      while (
        j < lines.length &&
        !lines[j]!.trim().startsWith("## ") &&
        !lines[j]!.trim().startsWith("### ")
      ) {
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
      const h3 = parseH3UtilityHeading(trimmed);
      if (h3) {
        const [descLines, j] = readFollowingDescription(lines, i + 1);
        utilities.push({
          key: projectKey(h3.name),
          name: displayName(h3.name),
          href: h3.href,
          desc: collapseWs(stripMdLinks(descLines.join("\n"))),
        });
        i = j;
        continue;
      }
      i++;
      continue;
    }

    i++;
  }

  return { mainHeroQuote, mainProjects, utilities, miniapps, libraries };
}

/** Include owned projects mentioned in prose, not just headings and list items. */
export function parseLandingReadme(md: string): ReadmeProject[] {
  const bundle = parseReadme(md);
  const projects = [
    ...bundle.mainProjects,
    ...bundle.utilities,
    ...bundle.miniapps,
    ...bundle.libraries,
  ];
  const owners = new Set(
    projects.flatMap(({ href }) => {
      const match = /^https:\/\/github\.com\/([^/]+)\//i.exec(href);
      return match ? [match[1]!.toLowerCase()] : [];
    }),
  );
  for (const paragraph of md.split(/\n\s*\n/)) {
    for (const match of paragraph.matchAll(
      /\[([^\]\n]+)\]\((https:\/\/github\.com\/([^/\s]+)\/([^/)\s]+)\/?)(?:\s+[^)]*)?\)/g,
    )) {
      const [, name, href, owner, repo] = match;
      if (!name || !href || !owner || !repo || !owners.has(owner.toLowerCase()))
        continue;
      const identity = projectKey(name).replace(/[-_]/g, "");
      if (
        projects.some(
          (project) =>
            project.href.replace(/\/$/, "") === href.replace(/\/$/, "") ||
            project.key.replace(/[-_]/g, "") === identity ||
            project.key.replace(/[-_]/g, "") ===
              projectKey(repo).replace(/[-_]/g, ""),
        )
      )
        continue;
      const sentence =
        paragraph
          .split(/(?<=[.!?])\s+(?![^(]*\))/)
          .find((part) => part.includes(match[0])) ?? paragraph;
      projects.push({
        key: projectKey(name),
        name,
        href: safeExternalHref(href),
        desc: collapseWs(stripMdLinks(sentence)),
      });
    }
  }
  return projects.map((project) => ({
    ...project,
    href: normalizeProjectHref(project.href),
  }));
}

/** Upstream now line / article — not the GitHub project list (see PROFILE_PROJECT_LIST_MARKDOWN_URL). */
export const DEFAULT_PROFILE_MARKDOWN_URL =
  "https://raw.githubusercontent.com/undivisible/undivisible/main/now.md";

export const DEFAULT_RESUME_MARKDOWN_URL =
  "https://raw.githubusercontent.com/undivisible/undivisible/main/resume.md";

/** Project list + portfolio sections (parseReadme) live in this repository’s projects.md. */
export const PROFILE_PROJECT_LIST_MARKDOWN_URL =
  "https://raw.githubusercontent.com/undivisible/undivisible.dev/main/projects.md";

export function readmeBundleProjectCount(bundle: ReadmeBundle): number {
  return (
    bundle.mainProjects.length +
    bundle.utilities.length +
    bundle.miniapps.length +
    bundle.libraries.length
  );
}

/** URLs tried for project list sync (README first; now.md is status-only today). */
export function profileMarkdownUrls(): string[] {
  if (process.env.PROFILE_README_URL) {
    return [process.env.PROFILE_README_URL];
  }
  return [PROFILE_PROJECT_LIST_MARKDOWN_URL, DEFAULT_PROFILE_MARKDOWN_URL];
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
  href: "https://github.com/softwarecorporation/eqswift",
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

// ponytail: tsc.hk / non-GitHub hrefs skip Linguist scrape; keep resume/print stacks stable.
const HARDCODED_PROJECT_STACKS: Record<string, string> = {
  inauguration: "Rust.",
  alpenglow: "Rust, Zig.",
  space: "Inauguration, Assembly.",
};

function applyHardcodedProjectStacks(
  projects: ReadmeProject[],
): ReadmeProject[] {
  return projects.map((p) => {
    const stack = HARDCODED_PROJECT_STACKS[p.key];
    return stack ? { ...p, stack } : p;
  });
}

function applyHardcodedStacksToBundle(bundle: ReadmeBundle): ReadmeBundle {
  return {
    ...bundle,
    mainProjects: applyHardcodedProjectStacks(bundle.mainProjects),
    utilities: applyHardcodedProjectStacks(bundle.utilities),
    miniapps: applyHardcodedProjectStacks(bundle.miniapps),
    libraries: applyHardcodedProjectStacks(bundle.libraries),
  };
}

function withSafeHrefs(bundle: ReadmeBundle): ReadmeBundle {
  const map = (projects: ReadmeProject[]) =>
    projects.map((p) => ({
      ...p,
      href: safeExternalHref(normalizeProjectHref(p.href)),
    }));
  return {
    ...bundle,
    mainProjects: map(bundle.mainProjects),
    utilities: map(bundle.utilities),
    miniapps: map(bundle.miniapps),
    libraries: map(bundle.libraries),
  };
}

export function normalizeReadmeBundle(bundle: ReadmeBundle): ReadmeBundle {
  return applyHardcodedStacksToBundle(
    withSafeHrefs(
      appendEqswiftToUtilities(promoteAuroralityToUtilities(bundle)),
    ),
  );
}
