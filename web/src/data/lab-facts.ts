/**
 * Single source of copy for the /lab layout studies.
 *
 * Every layout reads from here, so a wording change lands in all three at
 * once and the three can be compared on shape rather than on content.
 */

export const IDENTITY = {
  name: "max carter",
  hanzi: "祁明思",
  role: "founding engineer",
  org: "based hardware",
  product: "omi",
  blurb: "firmware to backend on omi.",
} as const;

/** The blank in "the ghost of terry davis, but ___". */
export const GHOST_SUFFIXES = [
  "asian",
  "worse",
  "autistic",
  "bored",
  "not schizo",
  "rusty",
  "on the wrong timezone",
  "employed",
  "cantonese",
  "chronically on github",
  "nomadic",
  "it compiles",
  "his os is wip",
] as const;

/** BasedHardware/omi, GitHub API, verified 2026-08-08. */
export const OMI = {
  since: "2026-07-20",
  pullRequests: 101,
  merged: 42,
  commits: 199,
  surfaces:
    "nRF firmware · flutter · swift macOS · windows · python backend · rust core · TS edge",
} as const;

export type LabFact = {
  title: string;
  meta: string;
  detail: string;
  /** Key into REFS, when the title names something with a reference card. */
  ref?: string;
};

export const NOW_FACTS: LabFact[] = [
  {
    title: "based hardware · omi",
    meta: "founding engineer",
    ref: "omi",
    detail:
      "The wearable that remembers. I ship the whole stack: nRF firmware, the Flutter app, the Swift macOS client, the Windows Rewind pipeline, the Python backend, a shared Rust core and the TypeScript edge gateway.",
  },
  {
    title: "101 pull requests",
    meta: "42 merged",
    detail:
      "BLE bonding and encryption, an on-device knowledge graph built from screen OCR, provider-agnostic LLM routing, device SDKs in six languages, and a dozen workspaces of dependency remediation.",
  },
  {
    title: "199 commits",
    meta: "first 19 days",
    detail:
      "Counted against the default branch through the GitHub API — the same build-time sync that already pulls README.md and resume.md into this site.",
  },
];

export const FRONTIER_FACTS: LabFact[] = [
  {
    title: "inauguration",
    meta: "a compiler",
    ref: "inauguration",
    detail:
      "Forty languages, one import graph — pull a library from any ecosystem and use it as if it were native. Self-hosts in under two seconds into a 9 MB binary. No LLVM anywhere in the pipeline.",
  },
  {
    title: "space",
    meta: "an operating system",
    ref: "space",
    detail:
      "Five layers built from the compiler up: .in → Inauguration → SCI → Space → Nanokernel. The compiler defines authority, objects, scheduling and policy, not just machine code. AArch64, ARM, RISC-V. No POSIX.",
  },
  {
    title: "crepuscularity",
    meta: "a framework",
    ref: "crepuscularity",
    detail:
      "Write React, get GPUI desktop apps, SwiftUI, Jetpack Compose, Ratatui terminal UIs and embedded targets. Write Rust, get browser extensions. This page is built with it.",
  },
  {
    title: "rv8 · alpenglow",
    meta: "a browser · a distro",
    ref: "rv8",
    detail:
      "A browser engine on Servo and V8, and a diskless Linux with its own package manager and Wayland shell. At some point you stop picking other people's software.",
  },
  {
    title: "tree-sitter-holyc",
    meta: "the holiest language on earth",
    ref: "holyc",
    detail:
      "A tree-sitter grammar for HolyC, Terry's language. I wrote it before I wrote the tagline.",
  },
];

export const BEFORE_17_FACTS: LabFact[] = [
  {
    title: "seven countries in twelve months",
    meta: "alone",
    detail:
      "Living by myself and working the whole way through. Not a gap year — the work didn't stop, it just moved. Still nomadic.",
  },
  {
    title: "a job paying six figures",
    meta: "100k+ / yr",
    detail: "Before I was old enough to sign the contract on my own.",
  },
  {
    title: "first computer, then ubuntu, then the terminal",
    meta: "age 6",
    detail:
      "Building software from eight. Networking and exploit labs at ten. Mining at eleven. Keyboards at twelve, cloud lights at thirteen, arbitrage at fourteen.",
  },
  {
    title: "left school, founded tsc.hk",
    meta: "age 17",
    detail:
      "Full time on the frontier since. 67 public repos of my own, 22 more under tschk, 24k+ Rust crate downloads.",
  },
];

export const LAB_LINKS = [
  {
    name: "github",
    href: "https://github.com/undivisible",
    handle: "undivisible",
  },
  {
    name: "twitter",
    href: "https://twitter.com/makethings4ppl",
    handle: "makethings4ppl",
  },
  {
    name: "instagram",
    href: "https://instagram.com/undivisible.dev",
    handle: "undivisible.dev",
  },
  { name: "email", href: "mailto:max@tsc.hk", handle: "max@tsc.hk" },
  { name: "agent", href: "/agent", handle: "/agent" },
] as const;

export const WEBRING = {
  prev: "https://ring.liampas.ca/left",
  next: "https://ring.liampas.ca/right",
} as const;

/** Hour-of-day copy for the Signal layout. Anchored to Hong Kong time. */
const HOUR_COPY: ReadonlyArray<readonly [number, string]> = [
  [0, "still up. firmware."],
  [3, "the wrong side of the clock."],
  [6, "wherever i am, hong kong is already loud."],
  [9, "review queue."],
  [12, "ship."],
  [15, "gym, then ship again."],
  [18, "dinner. cantonese. ship again."],
  [21, "the good hours."],
];

export function copyForHour(hour: number): string {
  let out = HOUR_COPY[0]![1];
  for (const [from, text] of HOUR_COPY) if (hour >= from) out = text;
  return out;
}

export const LAB_LAYOUTS = [
  { slug: "temple", label: "temple", href: "/lab/temple" },
  { slug: "ledger", label: "ledger", href: "/lab/ledger" },
  { slug: "signal", label: "signal", href: "/lab/signal" },
] as const;

export type LabSlug = (typeof LAB_LAYOUTS)[number]["slug"];
