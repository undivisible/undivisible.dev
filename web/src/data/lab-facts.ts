/**
 * Single source of copy for the /lab redesign. One place to edit the words.
 *
 * Tone rule: state the fact, stop talking. The numbers do the arguing.
 */

export const IDENTITY = {
  name: "max carter",
  hanzi: "祁明思",
  role: "founding engineer",
  org: "based hardware",
  product: "omi",
} as const;

/**
 * The blank in "the ghost of terry davis, but ___". Each one carries the note
 * that opens when you hold it, so the joke has a second half.
 */
export type GhostSuffix = { word: string; note: string };

export const GHOST_SUFFIXES: GhostSuffix[] = [
  {
    word: "asian",
    note: "祁明思. hong kong on one side, australia on the other. he never had to spell his name twice.",
  },
  {
    word: "worse",
    note: "“like dillon brooks but worse” — jpegmafia, i lay down my life for you. he says he screams it in the mirror before talking to anyone. same.",
  },
  {
    word: "autistic",
    note: "it is why there are tree-sitter grammars for holyc, v, crystal, nim and lolcode. it is not an excuse for them.",
  },
  {
    word: "bored",
    note: "the compiler exists because nothing else was on.",
  },
  {
    word: "not schizo",
    note: "the one difference that matters. everything else is negotiable.",
  },
  {
    word: "rusty",
    note: "the browser engine is rust. i also haven't opened holyc in months. both readings apply.",
  },
  {
    word: "on the wrong timezone",
    note: "shipping to a us team from utc+8. the standup is a lifestyle choice.",
  },
  {
    word: "employed",
    note: "he turned the job down on principle. i took it.",
  },
  {
    word: "cantonese",
    note: "he talked to god in english. i'd have to pick a language first.",
  },
  {
    word: "chronically on github",
    note: "the numbers further down this page are not a flex, they are a diagnosis.",
  },
  {
    word: "nomadic",
    note: "ten countries, no lease. he built templeos from one room.",
  },
  {
    word: "it compiles",
    note: "forty languages, self-hosting in under two seconds into a 9 mb binary. that part is real.",
  },
  {
    word: "his os is wip",
    note: "templeos shipped. space is five layers deep and boots. i am behind.",
  },
];

/** Why the line is built the way it is. */
export const GHOST_SOURCE = {
  title: "the ghost of ___",
  body: "peggy got here first — the ghost~pop tape in 2017, the ghost of ranking dread on all my heroes are cornballs, the ghost of emmett till on experimental rap 2026.",
  note: "the construction is borrowed. the ghost is not.",
  link: "https://en.wikipedia.org/wiki/JPEGMafia",
} as const;

/** The card that opens when you hover his name. */
export const TERRY = {
  name: "Terrence Andrew Davis",
  years: "1969 – 2018",
  image: "/refs/terry-davis.jpg",
  body: "Spent a decade alone writing TempleOS — the kernel, the compiler, the graphics stack and its own language, HolyC — at 640×480 in sixteen colours, and put the whole thing in the public domain.",
  link: "https://en.wikipedia.org/wiki/Terry_A._Davis",
  linkLabel: "wikipedia",
  /** Why the tagline isn't just a reference. */
  mine: "i wrote the tree-sitter grammar for holyc before i wrote this line.",
  mineHref: "https://github.com/undivisible/tree-sitter-holyc",
} as const;

/**
 * omi, written out properly — the same treatment Terry gets, because "omi"
 * on its own tells a reader nothing. What it is, then what of it is mine.
 */
export const OMI = {
  name: "omi",
  meta: "based hardware · open source",
  body: "A wearable that listens to your day and a system that remembers it — conversations transcribed, turned into memories and action items, and answerable later. Open source, with apps on iOS, Android, macOS and Windows.",
  /** What of it is mine. */
  mine: "i'm a founding engineer on it: the platform underneath — backend, llm gateway, knowledge graph, device sdks — and the product on top, including the desktop apps. not the firmware.",
  link: "https://github.com/BasedHardware/omi",
  linkLabel: "github.com/BasedHardware/omi",
} as const;

/** The projects worth leading with, ahead of the full index. */
export type HeadlineWork = {
  name: string;
  href: string;
  what: string;
  line: string;
  stat: string;
};

export const HEADLINE_WORKS: HeadlineWork[] = [
  {
    name: "inauguration",
    href: "https://inauguration.tsc.hk/",
    what: "compiler",
    line: "forty languages through one import graph. self-hosts in under two seconds into a 9 mb binary.",
    stat: "no llvm",
  },
  {
    name: "space",
    href: "https://space.tsc.hk/",
    what: "operating system",
    line: "built from the compiler up, five layers deep. the compiler defines authority, objects and scheduling — not just machine code.",
    stat: "no posix",
  },
  {
    name: "crepuscularity",
    href: "https://crepuscularity.undivisible.dev/",
    what: "framework",
    line: "write react, get gpui desktop, swiftui, jetpack compose, ratatui and embedded. write rust, get browser extensions.",
    stat: "29 ★",
  },
  {
    name: "alpenglow",
    href: "https://alpenglow.tsc.hk/",
    what: "linux",
    line: "diskless. the minimal build is smaller than a photo from a modern phone, and it boots in under a second.",
    stat: "own package manager",
  },
  {
    name: "moonshine",
    href: "https://moonshine.tsc.hk/",
    what: "web framework",
    line: "bun-first, signal-only kernel, opt-in compiler. this page is rendered by it.",
    stat: "renders this",
  },
  {
    name: "rotary · apollo",
    href: "https://github.com/tschk/rotary",
    what: "agent stack",
    line: "rotary owns the loop — tools, providers, sessions, permissions, computer-use. apollo is the runtime on top: 14 mb, 20+ llm providers, 10+ messaging channels. zkr remembers, praefectus verifies, darash searches.",
    stat: "all rust",
  },
  {
    name: "rv8",
    href: "https://github.com/tschk/rv8",
    what: "browser engine",
    line: "servo for rendering, v8 for javascript, rust holding it together.",
    stat: "servo + v8",
  },
];

/**
 * Airports, this year, at seventeen — the codes I actually flew through.
 * Country-level history lives in EARLY_FACTS; this is the itinerary.
 */
export type Stop = {
  code: string;
  city: string;
  note: string;
  next?: boolean;
};

/** In order flown, not alphabetised. */
export const STOPS_THIS_YEAR: Stop[] = [
  { code: "HKG", city: "hong kong", note: "march. family. 祁明思" },
  { code: "HND", city: "tokyo haneda", note: "april" },
  { code: "HKG", city: "hong kong", note: "back again" },
  { code: "MEL", city: "melbourne", note: "july. where i'm from" },
  { code: "LGA", city: "new york laguardia", note: "" },
  { code: "JFK", city: "new york kennedy", note: "" },
  { code: "BAH", city: "bahrain", note: "" },
  { code: "SIN", city: "singapore", note: "" },
  { code: "KUL", city: "kuala lumpur", note: "" },
  { code: "HKG", city: "hong kong", note: "here now" },
  {
    code: "CKG",
    city: "chongqing",
    note: "next, with shanghai, chengdu and shenzhen",
    next: true,
  },
  { code: "SGN", city: "ho chi minh city", note: "after that", next: true },
];

/** Ten countries so far; seven of them inside one year, at seventeen. */
export const COUNTRIES = [
  "australia",
  "hong kong",
  "china",
  "new zealand",
  "malaysia",
  "singapore",
  "brunei",
  "bahrain",
  "united states",
  "japan",
] as const;

export const COUNTRIES_IN_A_YEAR = 7;

export type Milestone = {
  age: string;
  title: string;
  detail: string;
};

/** Before seventeen. The timeline opens one of these at a time. */
export const MILESTONES: Milestone[] = [
  {
    age: "6",
    title: "built a computer, put ubuntu on it",
    detail:
      "the terminal was the interesting part. i have not really stopped since.",
  },
  {
    age: "8",
    title: "started shipping software",
    detail: "small programs, badly. the loop was the point.",
  },
  {
    age: "10",
    title: "networking, pentesting, exploit labs",
    detail:
      "hackerone and hackthebox. later: 12th at barbie ctf 2023 in petrozavodsk, 15th nationally and 4th in division at pecan 2025.",
  },
  {
    age: "11",
    title: "mining crypto, first money online",
    detail:
      "then keyboards at twelve, cloud lights at thirteen, marketplace arbitrage at fourteen. none of it was a plan.",
  },
  {
    age: "12",
    title: "started teaching english",
    detail:
      "volunteer tutor for russian and other esl speakers, online, from 2022 and still going.",
  },
  {
    age: "16",
    title: "became muslim, for a year and a half",
    detail:
      "read into it properly, converted, and left again eighteen months later. built akh and infrastruct while i was in it. i don't regret either direction.",
  },
  {
    age: "17",
    title: "left school, seven countries, a job paying 100k+",
    detail:
      "hong kong, china, malaysia, singapore, bahrain, the united states and japan in twelve months, working the whole way through. founded tsc.hk, and the arkie company — which i closed after leaving school. tsc.hk stayed open.",
  },
];

export const TSCHK = {
  name: "tsc.hk",
  full: "the software company of hong kong",
  href: "https://tsc.hk",
  blurb:
    "the software company of hong kong — a compiler, two operating systems, a browser engine, a linux distribution, two web frameworks and an agent runtime.",
} as const;

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
  { name: "resume", href: "/resume.md", handle: "resume.md" },
] as const;

export const WEBRING = {
  prev: "https://ring.liampas.ca/left",
  next: "https://ring.liampas.ca/right",
} as const;
