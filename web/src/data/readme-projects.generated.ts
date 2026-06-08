export type ReadmeProject = {
  key: string;
  name: string;
  href: string;
  desc: string;
  stack?: string;
  category?: string;
};

export const mainHeroQuoteFromReadme: string = "a framework for building cross-platform applications from a single web-based codebase — solely by writing react + tailwindcss and a js/ts or rust backend.";

export const mainProjectsFromReadme: ReadmeProject[] = [
  {
    "key": "crepuscularity",
    "name": "crepuscularity",
    "href": "https://crepuscularity.undivisible.dev",
    "desc": "crepuscularity builds for: desktop apps (gpui), swiftui & jetpack compose mobile, tuis on ratatui, websites, embedded with a custom framebuffer or lvgl and browser extensions."
  }
];

export const utilitiesFromReadme: ReadmeProject[] = [
  {
    "key": "aurorality",
    "name": "aurorality",
    "href": "https://github.com/tschk/aurorality",
    "desc": "aurorality turns web frontends into native swiftui for macos and ios, accepting swift, js/ts, or rust as your backend. with crepuscularity lite and aurorality-js, you can drop into existing sites to connect native frontends to js backends.",
    "stack": "Rust, Swift, Other."
  },
  {
    "key": "inauguration",
    "name": "inauguration (wip)",
    "href": "https://github.com/tschk/inauguration",
    "desc": "an ultra-fast, general-purpose compiler pipeline for multiple languages designed around explicit capability management and deterministic execution graphs. it features a native language (inlang) that supports two synchronized syntaxes—a strict, explicit form ideal for tooling, agents, and deterministic builds, and a lightweight, human-friendly form optimized for readability.",
    "stack": "Rust, Swift, V, C, Java, TypeScript."
  },
  {
    "key": "equilibrium",
    "name": "equilibrium",
    "href": "https://github.com/tschk/equilibrium",
    "desc": "load c-compatible code into rust with one call. auto-detects sources, compiles, exposes as rust modules. `load()` is the primary path. for rust → swift, see eqswift.",
    "stack": "Rust, Other."
  },
  {
    "key": "eqswift",
    "name": "eqswift",
    "href": "https://github.com/semitechnological/eqswift",
    "desc": "Rust-to-Swift binding tooling designed to reduce UniFFI boilerplate and make interop practical.",
    "stack": "Rust, Swift, C."
  },
  {
    "key": "wax",
    "name": "wax",
    "href": "https://github.com/tschk/wax",
    "desc": "fast homebrew-compatible package manager in rust. uses homebrew's ecosystem (formulae, bottles, casks) without the ruby/git overhead — compiled, async, parallel installs, lockfiles, and experimental winget/scoop/nix-like support.",
    "stack": "Rust."
  },
  {
    "key": "soliloquy",
    "name": "soliloquy",
    "href": "https://github.com/tschk/soliloquy",
    "desc": "an experimental operating system model for the web — immutable, browser-native, built on a modified alpine base.",
    "stack": "Rust, HTML, Svelte, TypeScript, Shell, C, Other."
  },
  {
    "key": "rv8",
    "name": "rv8",
    "href": "https://github.com/tschk/rv8",
    "desc": "it uses rv8, a custom browser engine built with servo and v8.",
    "stack": "Rust."
  },
  {
    "key": "space",
    "name": "space",
    "href": "#",
    "desc": "is a work in progress ground-up nanokernel built on top of inauguration."
  },
  {
    "key": "experiences",
    "name": "experiences (shelved)",
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
    "name": "tile (shelved)",
    "href": "https://github.com/semitechnological/tile",
    "desc": "mosaic-style tiling window manager + canvas + multiplexer for macos.",
    "stack": "Rust."
  },
  {
    "key": "tabyrus",
    "name": "tabyrus (wip)",
    "href": "https://github.com/semitechnological/tabyrus",
    "desc": "ai-powered autocomplete anywhere on your mac. uses cotabby as a reference but uses a rust backend + mlx.",
    "stack": "Swift, Rust, C."
  },
  {
    "key": "rover",
    "name": "rover (shelved)",
    "href": "#",
    "desc": "utilities and plugin system for mac, based on raycast + ghostty."
  }
];

export const miniappsFromReadme: ReadmeProject[] = [
  {
    "key": "standpoint",
    "name": "standpoint",
    "href": "https://standpoint.undivisible.dev",
    "desc": "the ultimate opinion based platform for sharing tierlists, voting on polls, and playing spectrum - a party game to guess on a spectrum based on a prompt.",
    "category": "web apps"
  },
  {
    "key": "notes",
    "name": "notes",
    "href": "https://notes.undivisible.dev/",
    "desc": "minimal note taker with full google font support, code highlighting and editing and notion-style markdown editing.",
    "category": "web apps"
  },
  {
    "key": "bublik",
    "name": "bublik",
    "href": "https://bublik.undivisible.dev/",
    "desc": "canvas tool for generating custom frequency soundscapes.",
    "category": "web apps"
  },
  {
    "key": "alphabets",
    "name": "alphabets",
    "href": "https://alphabets.undivisible.dev",
    "desc": "learn any unicode-supported alphabet through cards, quizzes, and completion tables.",
    "category": "web apps"
  },
  {
    "key": "infrastruct",
    "name": "infrastruct",
    "href": "https://infrastruct.undivisible.dev",
    "desc": "belief agnostic jurisprudence local ai search engine platform with searx & ddg, transformers.js and browser prompt api.",
    "category": "web apps"
  },
  {
    "key": "akh",
    "name": "akh (archived)",
    "href": "https://akh.undivisible.dev",
    "desc": "islamic uniplatform for when i was previously interested in islam.",
    "category": "web apps"
  },
  {
    "key": "unthinkmail",
    "name": "unthinkmail",
    "href": "https://unthinkmail.undivisible.dev/",
    "desc": "mcp for imap-supported email.",
    "category": "developer tools"
  },
  {
    "key": "folk-around",
    "name": "folk around",
    "href": "https://github.com/undivisible/folk-around",
    "desc": "lets folk or any hermes agent or openclaw interact with your computer p2p on macos.",
    "category": "developer tools",
    "stack": "Rust, TypeScript, Astro, JavaScript."
  },
  {
    "key": "poke-around",
    "name": "poke around",
    "href": "https://github.com/undivisible/poke-around",
    "desc": "lets poke interact with your computer across major oses.",
    "category": "developer tools",
    "stack": "Rust, TypeScript, Dockerfile."
  },
  {
    "key": "unthinkclaw",
    "name": "unthinkclaw",
    "href": "https://github.com/undivisible/unthinkclaw",
    "desc": "openclaw but <1/100 of the size, with a better ux (subjectively), with speed and with the ability to deploy agent swarms.",
    "category": "developer tools",
    "stack": "Rust, JavaScript, Other."
  },
  {
    "key": "bluetooth-terminal",
    "name": "bluetooth terminal",
    "href": "https://github.com/undivisible/bluetooth-terminal",
    "desc": "random bluetooth terminal i made",
    "category": "developer tools",
    "stack": "Swift."
  },
  {
    "key": "rs_vimium",
    "name": "rs_vimium",
    "href": "https://github.com/undivisible/rs_vimium",
    "desc": "a rust rewrite of the vimium browser extension built with the crepuscularity webextension framework.",
    "category": "browser extensions",
    "stack": "Rust."
  },
  {
    "key": "anywhere",
    "name": "anywhere",
    "href": "https://github.com/undivisible/anywhere",
    "desc": "browser extension that turns ai chat responses into interactive interfaces. renders widgets, panels, forms, charts inside chat via custom response tags, also built with the crepuscularity webextension framework.",
    "category": "browser extensions",
    "stack": "Rust."
  },
  {
    "key": "drift",
    "name": "drift",
    "href": "https://github.com/undivisible/drift-wallpaper",
    "desc": "macos drift screensaver as a live wallpaper on linux, macos, windows. spotify and apple music now playing support.",
    "category": "mobile & desktop",
    "stack": "Rust, WGSL, PowerShell, Shell."
  },
  {
    "key": "vro",
    "name": "vro",
    "href": "https://github.com/undivisible/vro",
    "desc": "minimal micro inspired text editor written in v.",
    "category": "mobile & desktop",
    "stack": "V."
  },
  {
    "key": "ycyestim",
    "name": "ycyestim",
    "href": "https://github.com/undivisible/YCYEStim",
    "desc": "ios controller for ycy yokonex gen 1 and 2 electrostimulation hardware over btle (optional user-owned http/websocket bridge); dual-channel waveforms, presets and programs, safety limits, healthkit and watchos heart-rate adaptive output.",
    "category": "mobile & desktop",
    "stack": "Swift."
  },
  {
    "key": "unelaborate",
    "name": "unelaborate (shelved)",
    "href": "https://github.com/undivisible/unelaborate",
    "desc": "minecraft client in native swiftui with modrinth modpack, shader, and resource pack loading.",
    "category": "mobile & desktop",
    "stack": "Swift, Shell."
  }
];

export const librariesFromReadme: ReadmeProject[] = [
  {
    "key": "rs_ai",
    "name": "rs_ai",
    "href": "https://github.com/undivisible/rs_ai",
    "desc": "rust ai sdk for building across cloud and local providers with one async-first api with on-device runtimes through `rs_ai_local` — including gemini nano on android and google chrome (browser prompt api), foundationmodels on macos, and phi silica on windows and microsoft edge (browser prompt api).",
    "stack": "Rust, Swift, C#, Kotlin."
  },
  {
    "key": "rs_poke",
    "name": "rs_poke",
    "href": "https://github.com/undivisible/rs_poke",
    "desc": "poke by interaction's sdk in rust.",
    "stack": "Rust."
  },
  {
    "key": "rs_peekaboo",
    "name": "rs_peekaboo",
    "href": "https://github.com/undivisible/rs_peekaboo",
    "desc": "peter steinberger's peekaboo rewritten in rust with a shell tool and usable as a crate library for embedding into applications.",
    "stack": "Rust."
  },
  {
    "key": "rs_imessage",
    "name": "rs_imessage",
    "href": "https://github.com/undivisible/rs_imessage",
    "desc": "rust imessage crate and cli",
    "stack": "Rust, Other."
  },
  {
    "key": "rs_facetime",
    "name": "rs_facetime",
    "href": "https://github.com/undivisible/rs_facetime",
    "desc": "rust facetime crate and cli",
    "stack": "Rust, Objective-C, Makefile, Shell."
  },
  {
    "key": "stalwart-lite",
    "name": "stalwart lite",
    "href": "https://github.com/arkiecompany/stalwart-lite",
    "desc": "stalwart fork that runs in-process as a rust crate. imap, smtp, management api — no web admin, no overhead. built for embedding and local-first setups.",
    "stack": "Rust, Shell, HTML, Python, Sieve, Dockerfile."
  },
  {
    "key": "crosspost-rs",
    "name": "crosspost-rs",
    "href": "https://github.com/arkiecompany/crosspost-rs",
    "desc": "a rust crossposting library for multiple social media platforms",
    "stack": "Rust, Dockerfile."
  },
  {
    "key": "ark-protocol",
    "name": "ark-protocol",
    "href": "https://github.com/tschk/ark-protocol",
    "desc": "open protocol and reference implementation for exposing many local vps services behind one standardized https/websocket ingress. defines a manifest-based routing layer, adapter apis, and cloudflare-compatible edge integration for multiplexing internal ports through a single public endpoint.",
    "stack": "JavaScript, Rust."
  },
  {
    "key": "monoprotocol",
    "name": "monoprotocol",
    "href": "https://github.com/atechnology-company/monoprotocol",
    "desc": "normative draft sync protocol: wire format, crypto (hkdf, aes256gcm), replicated object model, journals, capabilities; rust reference crate on crates.io with golden conformance vectors (json/cbor).",
    "stack": "Rust."
  },
  {
    "key": "svelte-streamdown",
    "name": "svelte-streamdown",
    "href": "https://github.com/undivisible/svelte-streamdown",
    "desc": "a svelte version of vercel's streamdown for streamable markdown rendering with interactive codeblocks and math rendering.",
    "stack": "TypeScript, Svelte, Other."
  }
];
