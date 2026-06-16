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
  narrative: string;
  stat: string;
  hrefFallback: string;
};

const templates: Record<PillarKey, PillarTemplate> = {
  crepuscularity: {
    eyebrow: "Application platform",
    displayName: "Crepuscularity",
    tagline: "One surface model. Every target.",
    narrative:
      "A framework for shipping real interfaces across desktop, mobile, terminal, extension, and web from a single React and Tailwind codebase — with GPUI, SwiftUI, Jetpack Compose, Ratatui, and the open web as first-class targets.",
    stat: "Multi-surface",
    hrefFallback: "https://crepuscularity.undivisible.dev",
  },
  space: {
    eyebrow: "Operating system",
    displayName: "Space",
    tagline: "Component-based nanokernel. .in native language.",
    narrative:
      "A component-based operating system built on a five-layer architecture: .in native language, Inauguration compiler, SCI component image format, Space runtime, and nanokernel enforcement. No POSIX in the kernel — Linux, Darwin, and Windows are microservices.",
    stat: "Boots",
    hrefFallback: "https://github.com/tschk/space",
  },
  inauguration: {
    eyebrow: "Compiler platform",
    displayName: "Inauguration",
    tagline: "Multi-frontend, Core IR, hot paths.",
    narrative:
      "An experimental compiler and runtime stack aimed at Core IR, SIL-level reasoning, and ultrafast incremental workflows — where frontends are swappable but the pipeline stays ruthless about throughput.",
    stat: "Research",
    hrefFallback: "https://github.com/semitechnological/inauguration",
  },
  alpenglow: {
    eyebrow: "Linux appliance",
    displayName: "Alpenglow",
    tagline: "Diskless, hardened, immutable.",
    narrative:
      "Diskless, hardened, immutable Linux appliance. GlowFS root, dinit init, Oil packages. Boots to login in <1s on native virt. x86_64, aarch64, riscv64, Rockchip RK3566.",
    stat: "<1s boot",
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
    const narrative = row?.desc ?? t.narrative;
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
