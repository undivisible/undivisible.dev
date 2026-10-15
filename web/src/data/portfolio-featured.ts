import { projects } from "@/data/profile";
import type { ReadmeBundle } from "@/lib/profile-readme";

export const pillarKeys = [
  "crepuscularity",
  "inauguration",
  "alpenglow",
  "space",
] as const;

export type PillarKey = (typeof pillarKeys)[number];

type PillarTemplate = {
  eyebrow: string;
  displayName: string;
  tagline: string;
  stat: string;
  hrefFallback: string;
};

const templates: Record<PillarKey, PillarTemplate> = {
  crepuscularity: {
    eyebrow: "Application platform",
    displayName: "Crepuscularity",
    tagline: "Desktop, web and terminal interfaces.",
    stat: "Multi-surface",
    hrefFallback: "https://crepuscularity.tsc.hk",
  },
  space: {
    eyebrow: "Operating system",
    displayName: "Space",
    tagline: "An experimental component-based OS.",
    stat: "Boots",
    hrefFallback: "https://github.com/tschk/space",
  },
  inauguration: {
    eyebrow: "Compiler platform",
    displayName: "Inauguration",
    tagline: "Multiple languages, one intermediate representation.",
    stat: "Research",
    hrefFallback: "https://github.com/tschk/inauguration",
  },
  alpenglow: {
    eyebrow: "Linux distribution",
    displayName: "Alpenglow",
    tagline: "Diskless, immutable Linux.",
    stat: "Diskless",
    hrefFallback: "https://github.com/tschk/alpenglow",
  },
};

function findInReadme(readme: ReadmeBundle, key: string) {
  return [...readme.mainProjects, ...readme.utilities].find(
    (p) => p.key === key,
  );
}

export type PillarResolved = {
  key: PillarKey;
  href: string;
  eyebrow: string;
  displayName: string;
  tagline: string;
  narrative: string;
  stat: string;
};

export function resolvePillars(readme: ReadmeBundle): PillarResolved[] {
  return pillarKeys.map((key) => {
    const t = templates[key];
    const row = findInReadme(readme, key);
    const href = row?.href && row.href !== "#" ? row.href : t.hrefFallback;
    const narrative =
      projects.find((project) => project.name.toLowerCase() === key)
        ?.description ?? "";
    return {
      key,
      href,
      eyebrow: t.eyebrow,
      displayName: row?.name
        ? row.name.replace(/\s*\(wip\)\s*/i, "")
        : t.displayName,
      tagline: t.tagline,
      narrative,
      stat: t.stat,
    };
  });
}
