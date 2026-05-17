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
  }
];

export const utilitiesFromReadme: ReadmeProject[] = [
  {
    "key": "aurorality",
    "name": "aurorality",
    "href": "https://github.com/tschk/aurorality",
    "desc": "aurorality turns web frontends into native swiftui for macos and ios, accepting swift, js/ts, or rust as your backend. with crepuscularity lite and aurorality-js, you can drop into existing sites to connect native frontends to js backends."
  },
  {
    "key": "inauguration",
    "name": "inauguration",
    "href": "https://github.com/tschk/inauguration",
    "desc": "an experimental multi-frontend compiler/runtime platform targeting Core IR, SIL analysis, hot reload, and ultrafast incremental workflows."
  },
  {
    "key": "equilibrium",
    "name": "equilibrium",
    "href": "https://github.com/tschk/equilibrium",
    "desc": "load c-compatible code into rust with one call. auto-detects sources, compiles, exposes as rust modules. `load()` is the primary path. for rust → swift, see eqswift."
  },
  {
    "key": "eqswift",
    "name": "eqswift",
    "href": "https://github.com/semitechnological/eqswift",
    "desc": "Rust-to-Swift binding tooling designed to reduce UniFFI boilerplate and make interop practical."
  },
  {
    "key": "wax",
    "name": "wax",
    "href": "https://github.com/semitechnological/wax",
    "desc": "fast homebrew-compatible package manager in rust. uses homebrew's ecosystem (formulae, bottles, casks) without the ruby/git overhead — compiled, async, parallel installs, lockfiles, and experimental winget/scoop/nix-like support."
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
  }
];

export const miniappsFromReadme: ReadmeProject[] = [];
