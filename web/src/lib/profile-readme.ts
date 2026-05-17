export type ReadmeProject = {
  key: string;
  name: string;
  href: string;
  desc: string;
};

export type ReadmeBundle = {
  mainHeroQuote: string;
  mainProjects: ReadmeProject[];
  utilities: ReadmeProject[];
  miniapps: ReadmeProject[];
};

export function projectKey(name: string): string {
  return name
    .replace(/\s*\(wip\)\s*/gi, "")
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
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1");
}

function collapseWs(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function pushUnique(list: ReadmeProject[], p: ReadmeProject) {
  if (!list.some((x) => x.href === p.href && x.key === p.key)) list.push(p);
}

const LINKED_WITH_DESC =
  /^-\s+\*\*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\*\*\s*[–—\-]\s*(.+?)\s*$/;
const LINKED_NO_URL = /^-\s+\*\*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\*\*\s*$/;
const OTHER_WITH_DESC = /^-\s+\*\*([^*]+)\*\*\s*[–—\-]\s*(.+?)\s*$/;
const OTHER_NO_DESC = /^-\s+\*\*([^*]+)\*\*\s*$/;
const H3_LINK = /^###\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*$/;
const H2_LINK = /^##\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*$/;
const LIB_CONT = /^\s+-\s+(.+?)\s*$/;

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
  mainProjects[0]!.desc = heroQuote ? leftBody : collapseWs(`${heroQuote} ${leftBody}`);
  mainProjects[1]!.desc = rightBody;
  return heroQuote;
}

export function parseReadme(md: string): ReadmeBundle {
  const mainProjects: ReadmeProject[] = [];
  const utilities: ReadmeProject[] = [];
  const miniapps: ReadmeProject[] = [];
  let mainHeroQuote = "";

  let mode:
    | "idle"
    | "framework_body"
    | "subprojects"
    | "soliloquy_body"
    | "other"
    | "semitech"
    | "miniapps"
    | "libraries" = "idle";

  const frameworkBodyLines: string[] = [];
  const soliloquyBodyLines: string[] = [];
  let pendingSoliloquy: ReadmeProject | null = null;

  const lines = md.split(/\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (mode === "framework_body") {
      if (trimmed === "### subprojects") {
        mainHeroQuote = assignFrameworkDescriptions(
          mainProjects,
          frameworkBodyLines,
        );
        mode = "subprojects";
        continue;
      }
      if (trimmed.startsWith("## ")) {
        mode = "idle";
        continue;
      }
      frameworkBodyLines.push(line);
      continue;
    }

    if (mode === "soliloquy_body") {
      if (trimmed === "### other") {
        if (pendingSoliloquy) {
          pendingSoliloquy.desc = collapseWs(
            stripMdLinks(soliloquyBodyLines.join("\n")),
          );
          pushUnique(utilities, pendingSoliloquy);
          pendingSoliloquy = null;
        }
        soliloquyBodyLines.length = 0;
        mode = "other";
        continue;
      }
      soliloquyBodyLines.push(line);
      continue;
    }

    if (mode === "libraries") {
      const linked = parseLinkedLine(line);
      if (linked) {
        pushUnique(utilities, linked);
        continue;
      }
      const cont = line.match(LIB_CONT);
      if (cont && utilities.length > 0) {
        const last = utilities[utilities.length - 1]!;
        const add = collapseWs(stripMdLinks(cont[1]!));
        last.desc = last.desc ? `${last.desc} ${add}` : add;
      }
      continue;
    }

    if (mode === "miniapps") {
      if (trimmed.startsWith("## libraries")) {
        mode = "libraries";
        continue;
      }
      const linked = parseLinkedLine(line);
      if (linked) pushUnique(miniapps, linked);
      continue;
    }

    if (mode === "semitech") {
      if (trimmed === "***") {
        mode = "idle";
        continue;
      }
      const linked = parseLinkedLine(line);
      if (linked) {
        pushUnique(utilities, linked);
        continue;
      }
      const other = parseOtherLine(line);
      if (other) pushUnique(utilities, other);
      continue;
    }

    if (mode === "other") {
      if (trimmed === "***") {
        mode = "idle";
        continue;
      }
      const other = parseOtherLine(line);
      if (other) pushUnique(utilities, other);
      continue;
    }

    if (mode === "subprojects") {
      if (trimmed === "***" || trimmed.startsWith("## [atechnology")) {
        mode = "idle";
        continue;
      }
      const linked = parseLinkedLine(line);
      if (linked) pushUnique(utilities, linked);
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
      continue;
    }

    if (trimmed === "### subprojects") {
      mode = "subprojects";
      continue;
    }

    const h2Sol = trimmed.match(H2_LINK);
    if (h2Sol && projectKey(h2Sol[1]!) === "soliloquy") {
      const nm = h2Sol[1]!;
      pendingSoliloquy = {
        key: projectKey(nm),
        name: displayName(nm),
        href: h2Sol[2]!,
        desc: "",
      };
      soliloquyBodyLines.length = 0;
      mode = "soliloquy_body";
      continue;
    }

    const sol = trimmed.match(H3_LINK);
    if (sol && projectKey(sol[1]!) === "soliloquy") {
      const nm = sol[1]!;
      pendingSoliloquy = {
        key: projectKey(nm),
        name: displayName(nm),
        href: sol[2]!,
        desc: "",
      };
      soliloquyBodyLines.length = 0;
      mode = "soliloquy_body";
      continue;
    }

    if (trimmed === "### other") {
      mode = "other";
      continue;
    }

    if (trimmed.startsWith("## [semitechnological]")) {
      mode = "semitech";
      continue;
    }

    if (trimmed === "## miniapps") {
      mode = "miniapps";
      continue;
    }
  }

  if (pendingSoliloquy) {
    pendingSoliloquy.desc = collapseWs(
      stripMdLinks(soliloquyBodyLines.join("\n")),
    );
    pushUnique(utilities, pendingSoliloquy);
  }

  return { mainHeroQuote, mainProjects, utilities, miniapps };
}

export const DEFAULT_PROFILE_MARKDOWN_URL =
  "https://raw.githubusercontent.com/undivisible/undivisible/main/now.md";

export const LEGACY_PROFILE_MARKDOWN_URL =
  "https://raw.githubusercontent.com/undivisible/undivisible/main/README.md";

export function promoteAuroralityToUtilities(bundle: ReadmeBundle): ReadmeBundle {
  const aurIndex = bundle.mainProjects.findIndex((p) => p.key === "aurorality");
  if (aurIndex === -1) return bundle;
  const aur = bundle.mainProjects[aurIndex]!;
  const mainProjects = bundle.mainProjects.filter((_, i) => i !== aurIndex);
  const hasInUtils = bundle.utilities.some((u) => u.key === "aurorality");
  const utilities = hasInUtils
    ? bundle.utilities
    : [aur, ...bundle.utilities];
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

export async function getProfileReadmeProjects(): Promise<ReadmeBundle> {
  const urls = process.env.PROFILE_README_URL
    ? [process.env.PROFILE_README_URL]
    : [DEFAULT_PROFILE_MARKDOWN_URL, LEGACY_PROFILE_MARKDOWN_URL];
  try {
    for (const url of urls) {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) continue;
      return normalizeReadmeBundle(parseReadme(await res.text()));
    }
    throw new Error("profile markdown fetch failed");
  } catch {
    const mod = await import("@/data/readme-projects.generated");
    const hero =
      "mainHeroQuoteFromReadme" in mod &&
      typeof (mod as { mainHeroQuoteFromReadme: unknown })
        .mainHeroQuoteFromReadme === "string"
        ? (mod as { mainHeroQuoteFromReadme: string }).mainHeroQuoteFromReadme
        : "";
    return normalizeReadmeBundle({
      mainHeroQuote: hero,
      mainProjects: [...mod.mainProjectsFromReadme],
      utilities: [...mod.utilitiesFromReadme],
      miniapps: [...mod.miniappsFromReadme],
    });
  }
}
