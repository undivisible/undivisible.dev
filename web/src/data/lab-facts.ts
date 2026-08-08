/**
 * Single source of copy for the /lab layout studies.
 *
 * Every layout reads from here, so a wording change lands in all of them at
 * once and they can be compared on shape rather than on content.
 */

export const IDENTITY = {
  name: "max carter",
  hanzi: "祁明思",
  role: "founding engineer",
  org: "based hardware",
  product: "omi",
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
} as const;

export type Place = {
  name: string;
  code: string;
  /** Part of the seven-in-twelve-months run. */
  run?: boolean;
  home?: boolean;
  next?: boolean;
};

/**
 * Ten countries. Seven of them inside one year, alone, before seventeen.
 * Ordered west to east so the list reads as a route rather than a ranking.
 */
export const PLACES: Place[] = [
  { name: "australia", code: "AUS", home: true },
  { name: "bahrain", code: "BHR", run: true },
  { name: "united states", code: "USA", run: true },
  { name: "new zealand", code: "NZL" },
  { name: "singapore", code: "SGP", run: true },
  { name: "malaysia", code: "MYS", run: true },
  { name: "brunei", code: "BRN" },
  { name: "hong kong", code: "HKG", run: true },
  { name: "china", code: "CHN", run: true },
  { name: "japan", code: "JPN", run: true },
  { name: "vietnam", code: "VNM", next: true },
];

export const COUNTRIES_IN_A_YEAR = PLACES.filter((place) => place.run).length;

export type LabFact = {
  title: string;
  meta: string;
  detail: string;
  /** Key into LAB_REFS, when the title names something with a card. */
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
    title: "tsc.hk",
    meta: "founded at 17, still open",
    ref: "tschk",
    detail:
      "A compiler, two operating systems, a browser engine, a Linux distribution, two web frameworks and an agent runtime. Twenty-two repositories. None of them were a good idea.",
  },
  {
    title: "101 pull requests",
    meta: "42 merged",
    detail:
      "In omi's first nineteen days: BLE bonding and encryption, an on-device knowledge graph built from screen OCR, provider-agnostic LLM routing, and device SDKs in six languages.",
  },
];

export const FRONTIER_FACTS: LabFact[] = [
  {
    title: "inauguration",
    meta: "a compiler",
    ref: "inauguration",
    detail:
      "Forty languages, one import graph. Self-hosts in under two seconds into a 9 MB binary. No LLVM anywhere in the pipeline.",
  },
  {
    title: "space",
    meta: "an operating system",
    ref: "space",
    detail:
      "Five layers built from the compiler up. The compiler defines authority, objects, scheduling and policy, not just machine code. No POSIX.",
  },
  {
    title: "crepuscularity",
    meta: "a framework",
    ref: "crepuscularity",
    detail:
      "Write React, get GPUI desktop apps, SwiftUI, Jetpack Compose, Ratatui terminal UIs and embedded targets. Write Rust, get browser extensions.",
  },
  {
    title: "rv8 · alpenglow",
    meta: "a browser · a distro",
    ref: "rv8",
    detail:
      "A browser engine on Servo and V8, and a diskless Linux with its own package manager and Wayland shell.",
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
      "Hong Kong, China, Malaysia, Singapore, Bahrain, the United States and Japan — alone, and working the whole way through. Still nomadic. Vietnam next.",
  },
  {
    title: "a job paying six figures",
    meta: "100k+ / yr",
    detail: "Someone else had to sign it. I did the work.",
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
    ref: "tschk",
    detail:
      "Also founded The Arkie Company. Shut it down after leaving school — one of the two was worth keeping.",
  },
];

/**
 * The whole site, one line at a time. The claim carries the fact, the kicker
 * carries the tone — if a line needs more than that it is not a good line.
 */
export const SENTENCES: ReadonlyArray<{
  text: string;
  note?: string;
  kicker?: string;
}> = [
  {
    text: "i'm max carter.",
    note: "祁明思",
    kicker: "you can't pronounce the other one either.",
  },
  {
    text: "i build things that need a team.",
    kicker: "i don't have one.",
  },
  {
    text: "a compiler. forty languages. no llvm.",
    note: "inauguration",
    kicker: "on purpose.",
  },
  {
    text: "an operating system. no posix.",
    note: "space",
    kicker: "also on purpose.",
  },
  {
    text: "a browser engine, a linux distro, two web frameworks.",
    note: "tsc.hk",
    kicker: "founded at 17. still open.",
  },
  {
    text: "founding engineer at based hardware.",
    note: "omi",
    kicker: "firmware to backend. yes, all of it.",
  },
  { text: "101 pull requests in nineteen days.", kicker: "i'm fine." },
  {
    text: "seven countries in one year. alone. at sixteen.",
    kicker: "the visa officers had questions.",
  },
  {
    text: "six figures before i could legally sign the contract.",
    kicker: "someone else had to.",
  },
  {
    text: "left school at seventeen.",
    kicker: "it wasn't going anywhere.",
  },
  { text: "vietnam next.", kicker: "no, i don't have a home." },
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

/** Hour-of-day copy, anchored to wherever the clock says I am. */
const HOUR_COPY: ReadonlyArray<readonly [number, string]> = [
  [0, "still up. firmware."],
  [3, "the wrong side of the clock."],
  [6, "somewhere, it is already loud."],
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
  { slug: "margin", label: "margin", href: "/lab/margin" },
  { slug: "sentence", label: "sentence", href: "/lab/sentence" },
  { slug: "atlas", label: "atlas", href: "/lab/atlas" },
] as const;

export type LabSlug = (typeof LAB_LAYOUTS)[number]["slug"];
