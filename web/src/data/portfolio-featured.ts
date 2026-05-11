import type { ReadmeBundle } from "@/lib/profile-readme";

export const pillarKeys = [
  "crepuscularity",
  "equilibrium",
  "inauguration",
  "soliloquy",
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
  equilibrium: {
    eyebrow: "Systems & FFI",
    displayName: "Equilibrium",
    tagline: "Foreign code, one load call.",
    narrative:
      "Load C-compatible libraries into Rust with automatic detection, compilation, and module handles — the pragmatic bridge between ecosystems when you need native performance without rewriting the world.",
    stat: "FFI core",
    hrefFallback: "https://github.com/semitechnological/equilibrium",
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
  soliloquy: {
    eyebrow: "Web-native OS",
    displayName: "Soliloquy",
    tagline: "Immutable plates. Servo + V8.",
    narrative:
      "An operating system model for the browser: Alpine-based, Servo rendering, V8 runtime, and room for agentic assistants that feel native to the web without pretending the host machine does not exist.",
    stat: "Experimental",
    hrefFallback: "https://github.com/atechnology-company/soliloquy",
  },
};

function findInReadme(readme: ReadmeBundle, key: string) {
  return [...readme.mainProjects, ...readme.utilities].find((p) => p.key === key);
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
      displayName: row?.name ? row.name.replace(/\s*\(wip\)\s*/i, "") : t.displayName,
      tagline: t.tagline,
      narrative,
      stat: t.stat,
    };
  });
}
