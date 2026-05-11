export type ReadmeProject = {
  key: string;
  name: string;
  href: string;
  desc: string;
};

export const mainHeroQuoteFromReadme: string = "a framework for building cross-platform applications from a single web-based codebase — solely by writing react + tailwindcss and a js/ts or rust backend.";

export const mainProjectsFromReadme: ReadmeProject[] = [
  {
    "key": "crepuscularity",
    "name": "crepuscularity",
    "href": "https://crepuscularity.undivisible.dev",
    "desc": "crepuscularity builds for: desktop apps (gpui), swiftui & jetpack compose mobile, tuis on ratatui, websites, and browser extensions."
  },
  {
    "key": "aurorality",
    "name": "aurorality",
    "href": "https://github.com/semitechnological/aurorality",
    "desc": "aurorality turns web frontends into native swiftui for macos and ios, accepting swift, js/ts, or rust as your backend. with crepuscularity lite and aurorality-js, you can drop into existing sites to connect native frontends to js backends."
  }
];

export const utilitiesFromReadme: ReadmeProject[] = [
  {
    "key": "inauguration",
    "name": "inauguration",
    "href": "https://github.com/semitechnological/inauguration",
    "desc": "an experimental multi-frontend compiler/runtime platform targeting Core IR, SIL analysis, hot reload, and ultrafast incremental workflows."
  },
  {
    "key": "equilibrium",
    "name": "equilibrium",
    "href": "https://github.com/semitechnological/equilibrium",
    "desc": "load c-compatible code into rust with one call. auto-detects sources, compiles, exposes as rust modules. `load()` is the primary path. for rust → swift, see eqswift."
  },
  {
    "key": "wax",
    "name": "wax",
    "href": "https://github.com/semitechnological/wax",
    "desc": "fast homebrew-compatible package manager in rust. uses homebrew's ecosystem (formulae, bottles, casks) without the ruby/git overhead — compiled, async, parallel installs, lockfiles, and experimental winget/scoop/nix-like support."
  },
  {
    "key": "soliloquy",
    "name": "soliloquy",
    "href": "https://github.com/atechnology-company/soliloquy",
    "desc": "an experimental operating system model for the web — immutable, browser-native, built on a modified alpine base with servo and v8. hosts plates, a wip agentic ecosystemic ai assistant for every device, native to the web, but using a hybrid of local and online models."
  },
  {
    "key": "experiences",
    "name": "experiences",
    "href": "#",
    "desc": "a project exploring a more accessible spatial web, built on unity wasm."
  },
  {
    "key": "atmosphere",
    "name": "atmosphere",
    "href": "#",
    "desc": "a native sync and ecosystem layer for every device, with local-first and homelab support."
  },
  {
    "key": "tile",
    "name": "tile (wip)",
    "href": "https://github.com/semitechnological/tile",
    "desc": "mosaic-style tiling window manager + canvas + multiplexer for macos."
  },
  {
    "key": "otto",
    "name": "otto (wip)",
    "href": "#",
    "desc": "ai-powered ottocomplete anywhere on your mac."
  },
  {
    "key": "rover",
    "name": "rover (wip)",
    "href": "#",
    "desc": "utilities and plugin system for mac, based on raycast + ghostty."
  },
  {
    "key": "stalwart-lite",
    "name": "stalwart lite",
    "href": "https://github.com/tschk/stalwart-lite",
    "desc": "stalwart fork that runs in-process as a rust crate. imap, smtp, management api — no web admin, no overhead. built for embedding and local-first setups."
  },
  {
    "key": "crosspost-rs",
    "name": "crosspost-rs",
    "href": "https://github.com/tschk/crosspost-rs",
    "desc": "a rust crossposting library for multiple social media platforms"
  },
  {
    "key": "ark-protocol",
    "name": "ark-protocol",
    "href": "https://github.com/tschk/ark-protocol",
    "desc": "open protocol and reference implementation for exposing many local VPS services behind one standardized HTTPS/WebSocket ingress. defines a manifest-based routing layer, adapter APIs, and Cloudflare-compatible edge integration for multiplexing internal ports through a single public endpoint."
  },
  {
    "key": "rs_ai",
    "name": "rs_ai",
    "href": "https://github.com/undivisible/rs_ai",
    "desc": "rust ai sdk for building across cloud and local providers with one async-first api with on-device runtimes through `rs_ai_local` — including gemini nano on android and google chrome (browser prompt api), foundationmodels on macos, and phi silica on windows and microsoft edge (browser prompt api)."
  }
];

export const miniappsFromReadme: ReadmeProject[] = [
  {
    "key": "standpoint",
    "name": "standpoint",
    "href": "https://standpoint.undivisible.dev",
    "desc": "the ultimate opinion based platform for sharing tierlists, voting on polls, and playing spectrum - a party game to guess on a spectrum based on a prompt."
  },
  {
    "key": "unthinkmail",
    "name": "unthinkmail",
    "href": "https://unthinkmail.undivisible.dev/",
    "desc": "mcp for imap-supported email."
  },
  {
    "key": "drift",
    "name": "drift",
    "href": "https://github.com/undivisible/drift-wallpaper",
    "desc": "macos drift screensaver as a live wallpaper on linux, macos, windows. spotify and apple music now playing support."
  },
  {
    "key": "vro",
    "name": "vro",
    "href": "https://github.com/undivisible/vro",
    "desc": "minimal micro inspired text editor written in v."
  },
  {
    "key": "notes",
    "name": "notes",
    "href": "https://notes.undivisible.dev/",
    "desc": "minimal note taker with google font and notion-style markdown editing."
  },
  {
    "key": "bublik",
    "name": "bublik",
    "href": "https://bublik.undivisible.dev/",
    "desc": "canvas tool for generating custom frequency soundscapes."
  },
  {
    "key": "alphabets",
    "name": "alphabets",
    "href": "https://alphabets.undivisible.dev",
    "desc": "learn any unicode-supported alphabet through cards, quizzes, and completion tables."
  },
  {
    "key": "unthinkclaw",
    "name": "unthinkclaw",
    "href": "https://github.com/undivisible/unthinkclaw",
    "desc": "openclaw but <1/100 of the size, with a better ux (subjectively), with speed and with the ability to deploy agent swarms."
  },
  {
    "key": "poke-around",
    "name": "poke around",
    "href": "https://github.com/undivisible/poke-around",
    "desc": "lets poke interact with your computer across major oses."
  },
  {
    "key": "anywhere",
    "name": "anywhere",
    "href": "https://github.com/undivisible/anywhere",
    "desc": "browser extension that turns ai chat responses into interactive interfaces. renders widgets, panels, forms, charts inside chat via custom response tags."
  },
  {
    "key": "unelaborate",
    "name": "unelaborate",
    "href": "https://github.com/undivisible/unelaborate",
    "desc": "minecraft client in native swiftui with modrinth modpack, shader, and resource pack loading."
  }
];
