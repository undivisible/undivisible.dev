import type { ReadmeBundle, ReadmeProject } from "@/lib/parse-readme-markdown";

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