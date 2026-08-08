/**
 * Single source of copy for the /lab redesign. One place to edit the words.
 *
 * Tone rule: state the fact, stop talking. Anything that sounds like a boast
 * gets rewritten as a plain sentence or cut — the numbers do the arguing.
 */

export const IDENTITY = {
  name: "max carter",
  hanzi: "祁明思",
  role: "systems platform & product engineer",
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

export const TERRY_URL = "https://en.wikipedia.org/wiki/Terry_A._Davis";

/**
 * What I actually do at Based Hardware: the platform under omi and the
 * product on top of it — not the firmware.
 */
export const OMI_ROLE = {
  line: "the platform under omi and the product on top of it — backend, llm gateway, knowledge graph, device sdks, and the desktop apps.",
  surfaces: [
    "python backend",
    "llm gateway",
    "on-device knowledge graph",
    "sdks in six languages",
    "swift macos app",
    "windows rewind",
    "flutter app",
    "rust core",
    "typescript edge",
  ],
} as const;

export type Place = {
  name: string;
  code: string;
  /** Always-visible note — no hover required to read the story. */
  note: string;
  /** Part of the seven-in-twelve-months run at sixteen. */
  run?: boolean;
  home?: boolean;
  next?: boolean;
};

/** In the order they happened, not alphabetical. */
export const PLACES: Place[] = [
  { name: "australia", code: "AUS", note: "from here", home: true },
  {
    name: "hong kong",
    code: "HKG",
    note: "first — and family. 祁明思",
    run: true,
  },
  { name: "new zealand", code: "NZL", note: "also first" },
  { name: "china", code: "CHN", note: "sixteen, alone", run: true },
  { name: "malaysia", code: "MYS", note: "sixteen, alone", run: true },
  { name: "singapore", code: "SGP", note: "sixteen, alone", run: true },
  { name: "brunei", code: "BRN", note: "" },
  { name: "bahrain", code: "BHR", note: "sixteen, alone", run: true },
  {
    name: "united states",
    code: "USA",
    note: "secondary inspection. two hours. they didn't believe my age",
    run: true,
  },
  {
    name: "japan",
    code: "JPN",
    note: "still learning the language",
    run: true,
  },
  { name: "vietnam", code: "VNM", note: "booked", next: true },
];

export const COUNTRIES_IN_A_YEAR = PLACES.filter((place) => place.run).length;

export type LabFact = {
  title: string;
  meta: string;
  detail: string;
};

/** Before seventeen — facts, flatly. */
export const EARLY_FACTS: LabFact[] = [
  {
    title: "seven countries in twelve months",
    meta: "at sixteen, alone",
    detail:
      "Hong Kong, China, Malaysia, Singapore, Bahrain, the United States and Japan. Worked the whole way through. Still nomadic — Vietnam next.",
  },
  {
    title: "a full-time job paying 100k+ a year",
    meta: "at sixteen",
    detail: "Someone else had to sign the contract. I wasn't old enough.",
  },
  {
    title: "first computer at six, first software at eight",
    meta: "then everything else",
    detail:
      "Exploit labs at ten. Mining at eleven. Keyboards, cloud lights, marketplace arbitrage. None of it was a plan; all of it was practice.",
  },
  {
    title: "left school at seventeen",
    meta: "founded tsc.hk",
    detail:
      "Also founded The Arkie Company that year, and closed it after leaving school. tsc.hk is the one that stayed open.",
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
