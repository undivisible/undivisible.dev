/**
 * The application registry for the web build of alpenglowed.
 *
 * Two kinds of app: `site` apps are my deployed websites running in the
 * window as themselves (with a pop-out into a real tab, since an iframe is
 * a window pretending); `panel` apps are rendered by the DE — the almanac
 * content, the terminal, telekinesis.
 */

export type OsAppKind = "panel" | "site";

export type OsApp = {
  id: string;
  title: string;
  subtitle: string;
  kind: OsAppKind;
  /** For `site` apps: what the window loads and the pop-out opens. */
  url?: string;
  /** Repository behind the thing, when it's public. */
  github?: string;
  /** Launcher keywords beyond the title. */
  keywords?: string[];
  /** Default floating geometry, in % of the desktop. */
  rect?: { x: number; y: number; w: number; h: number };
};

export const OS_APPS: OsApp[] = [
  // ── panels: the site's own content ──
  {
    id: "about",
    title: "about",
    subtitle: "max carter · 祁明思",
    kind: "panel",
    keywords: ["me", "max", "ghost", "terry"],
    rect: { x: 4, y: 10, w: 40, h: 62 },
  },
  {
    id: "activity",
    title: "2026",
    subtitle: "live github activity",
    kind: "panel",
    keywords: ["github", "prs", "commits", "numbers"],
    rect: { x: 46, y: 8, w: 38, h: 56 },
  },
  {
    id: "works",
    title: "works",
    subtitle: "headline projects + the index",
    kind: "panel",
    keywords: ["projects", "software", "index"],
    rect: { x: 22, y: 22, w: 44, h: 66 },
  },
  {
    id: "route",
    title: "route",
    subtitle: "airports, this year, at seventeen",
    kind: "panel",
    keywords: ["travel", "airports", "countries"],
    rect: { x: 52, y: 52, w: 40, h: 34 },
  },
  {
    id: "before17",
    title: "before 17",
    subtitle: "the dial",
    kind: "panel",
    keywords: ["timeline", "milestones", "age"],
    rect: { x: 8, y: 46, w: 40, h: 44 },
  },
  {
    id: "vm",
    title: "alpenglow",
    subtitle: "real kernel, emulated cpu",
    kind: "panel",
    github: "https://github.com/tschk/alpenglow",
    keywords: ["vm", "v86", "linux", "kernel", "shell", "console", "terminal", "bash"],
    rect: { x: 28, y: 14, w: 52, h: 66 },
  },
  {
    id: "terminal",
    title: "sh (web)",
    subtitle: "the bit, not the machine",
    kind: "panel",
    keywords: ["shell", "easter", "fake"],
    rect: { x: 34, y: 34, w: 44, h: 52 },
  },
  {
    id: "telekinesis",
    title: "telekinesis",
    subtitle: "code here, with your own model",
    kind: "panel",
    keywords: ["ai", "agent", "rotary", "code", "byok"],
    github: "https://github.com/tschk/telekinesis",
    rect: { x: 18, y: 12, w: 58, h: 72 },
  },

  // ── my sites, as webapps ──
  {
    id: "tschk",
    title: "tsc.hk",
    subtitle: "the software company of hong kong",
    kind: "site",
    url: "https://tsc.hk",
    rect: { x: 12, y: 10, w: 56, h: 68 },
  },
  {
    id: "crepuscularity",
    title: "crepuscularity",
    subtitle: "one codebase, every platform",
    kind: "site",
    url: "https://crepuscularity.undivisible.dev",
    github: "https://github.com/tschk/crepuscularity",
    rect: { x: 14, y: 8, w: 58, h: 70 },
  },
  {
    id: "moonshine",
    title: "moonshine",
    subtitle: "renders the thing you're looking at",
    kind: "site",
    url: "https://moonshine.tsc.hk",
    github: "https://github.com/tschk/moonshine",
    rect: { x: 18, y: 12, w: 56, h: 68 },
  },
  {
    id: "inauguration",
    title: "inauguration",
    subtitle: "forty languages, no llvm",
    kind: "site",
    url: "https://inauguration.tsc.hk",
    github: "https://github.com/tschk/inauguration",
    rect: { x: 20, y: 14, w: 56, h: 68 },
  },
  {
    id: "alpenglow",
    title: "alpenglow",
    subtitle: "the real one boots in under a second",
    kind: "site",
    url: "https://alpenglow.tsc.hk",
    github: "https://github.com/tschk/alpenglow",
    keywords: ["linux", "distro", "os"],
    rect: { x: 22, y: 16, w: 56, h: 68 },
  },
  {
    id: "space",
    title: "space",
    subtitle: "the os the compiler grew",
    kind: "site",
    url: "https://space.tsc.hk",
    github: "https://github.com/tschk/space",
    rect: { x: 24, y: 18, w: 56, h: 68 },
  },
  {
    id: "notes",
    title: "notes",
    subtitle: "notion-style markdown",
    kind: "site",
    url: "https://notes.undivisible.dev",
    github: "https://github.com/undivisible/notes",
    rect: { x: 26, y: 20, w: 52, h: 66 },
  },
  {
    id: "standpoint",
    title: "standpoint",
    subtitle: "tierlists, polls, spectrum",
    kind: "site",
    url: "https://standpoint.undivisible.dev",
    github: "https://github.com/undivisible/standpoint",
    rect: { x: 28, y: 22, w: 52, h: 66 },
  },
  {
    id: "alphabets",
    title: "alphabets",
    subtitle: "learn any script",
    kind: "site",
    url: "https://alphabets.undivisible.dev",
    github: "https://github.com/undivisible/alphabets",
    rect: { x: 30, y: 24, w: 52, h: 66 },
  },
  {
    id: "bublik",
    title: "bublik",
    subtitle: "frequency soundscapes",
    kind: "site",
    url: "https://bublik.undivisible.dev",
    github: "https://github.com/undivisible/bublik",
    rect: { x: 32, y: 26, w: 48, h: 62 },
  },
  {
    id: "crates",
    title: "crates download history",
    subtitle: "the widget github should have",
    kind: "site",
    url: "https://cratesdownloadhistory.undivisible.dev",
    github: "https://github.com/undivisible/cratesdownloadhistory",
    keywords: ["rust", "charts"],
    rect: { x: 34, y: 28, w: 52, h: 62 },
  },
  {
    id: "infrastruct",
    title: "infrastruct",
    subtitle: "local ai jurisprudence search",
    kind: "site",
    url: "https://infrastruct.undivisible.dev",
    github: "https://github.com/undivisible/infrastruct",
    rect: { x: 36, y: 30, w: 52, h: 62 },
  },
];

export function findApp(id: string): OsApp | undefined {
  return OS_APPS.find((app) => app.id === id);
}

/** What the desktop opens by itself after boot — the site's own content. */
export const PREOPENED: string[] = ["about", "vm", "activity"];
