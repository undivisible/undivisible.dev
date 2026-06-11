import {
  getReadmeBundleFromGenerated,
  type ReadmeProject,
} from "@/lib/profile-readme";

export type BriefOpenSourceCard = {
  org: string;
  name: string;
  tech: string;
  desc: string;
  tag: string;
  accent: boolean;
  dark: boolean;
};

const BRIEF_FEATURED_GROUPS: string[][] = [
  ["crepuscularity", "aurorality"],
  ["wax"],
  ["equilibrium", "eqswift"],
  ["soliloquy", "rv8"],
  ["atmosphere"],
  ["unthinkclaw", "unthinkmail"],
];

const TAG_BY_KEY: Record<string, string> = {
  crepuscularity: "Framework",
  aurorality: "Framework",
  wax: "Package Manager",
  equilibrium: "Interop / FFI",
  eqswift: "Interop / FFI",
  soliloquy: "OS / Runtime",
  rv8: "OS / Runtime",
  atmosphere: "Ecosystem",
  unthinkclaw: "AI Agent Runtime",
  unthinkmail: "AI Agent Runtime",
};

function orgFromHref(href: string): string {
  const match = href.match(/github\.com\/([^/]+)/i);
  if (match?.[1]) return match[1];
  if (href.includes("undivisible.dev")) return "undivisible";
  return "undivisible";
}

function stackLabel(stack?: string): string {
  if (!stack) return "";
  return stack.replace(/\.$/, "").replace(/, /g, " · ");
}

function findProject(
  projects: ReadmeProject[],
  key: string,
): ReadmeProject | undefined {
  return projects.find((project) => project.key === key);
}

function groupCard(
  keys: string[],
  projects: ReadmeProject[],
  index: number,
): BriefOpenSourceCard | null {
  const rows = keys
    .map((key) => findProject(projects, key))
    .filter((project): project is ReadmeProject => project != null);
  if (rows.length === 0) return null;

  const name = rows.map((row) => row.name).join(" + ");
  const desc = rows
    .map((row) => row.desc)
    .filter(Boolean)
    .join(" ");
  const tech =
    rows
      .map((row) => stackLabel(row.stack))
      .filter(Boolean)
      .join(" · ") || stackLabel(rows[0]?.stack);
  const tag = TAG_BY_KEY[rows[0]!.key] ?? "Open Source";
  const dark = index % 3 === 0;

  return {
    org: orgFromHref(rows[0]!.href),
    name,
    tech,
    desc,
    tag,
    accent: dark,
    dark,
  };
}

export function briefOpenSourceCards(): BriefOpenSourceCard[] {
  const readme = getReadmeBundleFromGenerated();
  const projects = [
    ...readme.mainProjects,
    ...readme.utilities,
    ...readme.miniapps,
    ...readme.libraries,
  ];

  return BRIEF_FEATURED_GROUPS.map((keys, index) =>
    groupCard(keys, projects, index),
  ).filter((card): card is BriefOpenSourceCard => card != null);
}
