import type { ReadmeBundle } from "@/lib/profile-readme";

export type ResumeContactRow = [string, string];

export type ResumeExperience = {
  role: string;
  org: string;
  time: string;
  points: string[];
};

export type ResumeProject = {
  name: string;
  href: string;
  desc: string;
};

export const resumeContact: ResumeContactRow[] = [
  ["Email", "max@undivisible.dev"],
  ["Phone", "+61 481 729 894"],
  ["Instagram", "@undivisible.dev"],
  ["Twitter", "@makethings4ppl"],
  ["GitHub", "github.com/undivisible"],
  ["LinkedIn", "linkedin.com/in/undivisible"],
  ["Location", "Melbourne / Hong Kong"],
];

export const resumeExperience: ResumeExperience[] = [
  {
    role: "Founder / engineering lead",
    org: "The Arkie Company",
    time: "2024-present",
    points: [
      "Engineering leadership, product direction, and hands-on delivery across web surfaces, automation, and internal systems.",
      "Build custom AI automation systems, product prototypes, client-facing web surfaces, and internal tooling.",
      "Recent work includes Studio of Optimisations, MCP-backed tool flows, voice interfaces, booking handoffs, and business workflow automation.",
    ],
  },
  {
    role: "Founder, Artificer",
    org: "The Software Company of Hong Kong, atechnology company",
    time: "2023-present",
    points: [
      "Freelance developer since 2024.",
      "Maintain 32 public GitHub repositories across systems, runtimes, interfaces, developer tools, AI SDKs, and miniapps.",
      "Primary projects include Crepuscularity, Aurorality, Wax, Equilibrium and Soliloquy.",
    ],
  },
  {
    role: "Systems and Product Architect",
    org: "Gizzmo Electronics",
    time: "late 2024",
    points: [
      "Created websites and companion apps. Inspired direction for hardware products, with supporting work across product surfaces, packaging, manuals, and marketing.",
      "Redesigned brand and design in entirety."
    ],
  },
];

export const resumePrintProjects: ResumeProject[] = [
  {
    name: "Crepuscularity",
    href: "https://crepuscularity.undivisible.dev",
    desc: "Cross-platform application framework targeting GPUI desktop apps, Ratatui TUIs, MV3 browser extensions, websites, and mobile.",
  },
  {
    name: "Aurorality",
    href: "https://github.com/semitechnological/aurorality",
    desc: "SwiftUI-native output for web-style frontends, with Swift, TypeScript, JavaScript, or Rust backend support.",
  },
  {
    name: "Wax",
    href: "https://github.com/semitechnological/wax",
    desc: "Fast Homebrew-compatible Rust package manager using formulae, bottles, casks, APIs, lockfiles, and async execution.",
  },
  {
    name: "Equilibrium",
    href: "https://github.com/semitechnological/equilibrium",
    desc: "FFI tooling for loading C-compiling languages into Rust through a simple module-handle workflow.",
  },
  {
    name: "Soliloquy",
    href: "https://atechnology.company",
    desc: "Experimental web-native operating system model on a modified Alpine base with Servo and V8.",
  },
  {
    name: "Atmosphere",
    href: "https://github.com/undivisible",
    desc: "Native sync and ecosystem layer for cross-device clipboard, continuity, file sharing, and local-first setups.",
  },
  {
    name: "Unthinkmail",
    href: "https://unthinkmail.undivisible.dev",
    desc: "MCP server for IMAP-supported email workflows.",
  },
  {
    name: "Stalwart Lite",
    href: "https://github.com/undivisible/stalwart-lite",
    desc: "Lightweight embeddable mail-server fork focused on IMAP, SMTP delivery/submission, and local-first deployments.",
  },
  {
    name: "Anywhere",
    href: "https://github.com/undivisible/anywhere",
    desc: "Browser extension that turns AI chat responses into interactive interfaces with widgets, panels, forms, charts, and tools.",
  },
  {
    name: "Poke Around",
    href: "https://github.com/undivisible/poke-around",
    desc: "Tooling for letting AI agents interact with local computers across major operating systems.",
  },
  {
    name: "Drift",
    href: "https://github.com/undivisible/drift-wallpaper",
    desc: "macOS Drift screensaver as wallpaper across desktop platforms, with music integration.",
  },
  {
    name: "Unelaborate",
    href: "https://github.com/undivisible/unelaborate",
    desc: "SwiftUI Minecraft client with Modrinth-style modpack, shader, and resource-pack loading.",
  },
  {
    name: "Notes",
    href: "https://notes.undivisible.dev",
    desc: "Minimal markdown note-taking app with font controls and Notion-style editing.",
  },
  {
    name: "Bublik",
    href: "https://bublik.undivisible.dev",
    desc: "Canvas tool for generating custom frequency soundscapes.",
  },
  {
    name: "Alphabets",
    href: "https://alphabets.undivisible.dev",
    desc: "Cards, quizzes, and completion tables for learning unicode-supported alphabets.",
  },
];

export const resumeSkillGroups: [string, string][] = [
  ["Languages", "Rust, Swift, TypeScript, Python, Go, V, Zig, C / C#"],
  ["Frontend", "React, Next.js, SvelteKit, Solid, Tailwind, WebGL, SwiftUI"],
  ["Systems", "GPUI, Ratatui, MV3 extensions, FFI, UniFFI, Servo, V8, WASM"],
  [
    "AI / Data",
    "OpenAI, MCP, RAG, local models, Hugging Face, Supabase, PostgreSQL",
  ],
  ["Infra", "Cloudflare, Docker, Kubernetes, GitHub Actions, CI/CD, SQLite"],
];

export const resumeEducation: string[] = [
  "Certificate III in Information Technology coursework, Box Hill Institute.",
  "VCE coursework at Eltham High School, including Information Technology, Applied Computing, Politics, Philosophy, Extended Investigation, Linguistics, and Indonesian; left before Year 12 completion to build full time.",
];

export const resumeHumanLanguages: string[] = [
  "English",
  "Cantonese",
  "Russian",
  "Mandarin",
  "Indonesian",
];

export const resumeCommunity: string[] = [
  "Volunteer English teacher for Russian speakers, 2022-present.",
  "Barbie CTF 2023, Petrozavodsk: 12th place in Russian exploit competition.",
  "PECAN CTF 2025: 15th nationally, 4th in division.",
];

export const resumeInterests: string[] = [
  "Learning",
  "Travel",
  "Cooking",
  "Photography",
  "Phenomenology",
  "Existentialism",
  "Consciousness hacking",
  "Language learning",
  "Low-level systems",
  "Science-based lifting",
];

function normHref(h: string) {
  return h.replace(/\/$/, "").toLowerCase();
}

export function resumeProjectsNotInReadme(
  readme: ReadmeBundle,
): ResumeProject[] {
  const hrefs = new Set(
    [...readme.mainProjects, ...readme.utilities, ...readme.miniapps].map((p) =>
      normHref(p.href),
    ),
  );
  const names = new Set(
    [...readme.mainProjects, ...readme.utilities, ...readme.miniapps].map((p) =>
      p.name.toLowerCase(),
    ),
  );
  return resumePrintProjects.filter((p) => {
    return !hrefs.has(normHref(p.href)) && !names.has(p.name.toLowerCase());
  });
}
