# hi, i'm max &nbsp;_[undivisible.dev](https://undivisible.dev/) [tsc.hk](https://tsc.hk)_

unthinking things for people.  
i build systems, runtimes, interfaces, developer tools, and small pieces of software that feel inevitable since the age of 8. <br>
[every single piece of major hardware i've used + stories](https://github.com/undivisible/undivisible/blob/main/hardware.md) <br>
stories about software + ai coming soon <br>
<br>
[![crates.io download history](https://cratesdownloadhistory.undivisible.dev/api/svg/undivisible?theme=octocat&date=dmy&crates=1)](https://crates.io/users/undivisible) <br>
i made this widget! - [github](https://github.com/undivisible/cratesdownloadhistory) [website](https://cratesdownloadhistory.undivisible.dev)

---

## [crepuscularity](https://crepuscularity.tsc.hk) · [aurorality](https://github.com/tschk/aurorality)

> a cross-platform UI toolkit in active development.

crepuscularity compiles .crepus templates and frontend input syntaxes to GPUI desktop, HTML, Ratatui terminals and MV3 extensions. SwiftUI and Jetpack Compose shells use View IR; native mobile support is in development. [aurorality](https://github.com/tschk/aurorality) builds native SwiftUI macOS and iOS interfaces with JavaScript/TypeScript or Rust backends.

### [moonshine](https://moonshine.tsc.hk)

ground-up Bun-first hybrid web framework with a signal-only kernel and opt-in compiler, routing, rendering, server, and deployment layers.

### **[inauguration](https://inauguration.tsc.hk)**

a compiler toolchain that brings multiple source languages into Core IR and targets its own AArch64 and x86_64 backends. includes the Inlang language, JIT execution and language interoperability tooling; frontend and backend coverage varies by language.

### [alpenglow](https://alpenglow.tsc.hk)

a small diskless Linux distribution with a musl userspace, immutable root filesystem, dinit and Oil packages. includes work on the [alpenglowed](https://github.com/tschk/alpenglowed) desktop shell and [soliloquy](https://github.com/tschk/soliloquy), an experimental browser-native variant.

### [space](https://space.tsc.hk)

an experimental component-based operating system built with Inauguration, SCI component images and a nanokernel. boots under QEMU, with compiler-defined capability authority and ongoing Linux, Darwin and Windows personality work.

### other

- **subspace** - an experimental statically composed embedded realtime operating system.
- **[equilibrium](https://github.com/tschk/equilibrium)** — load c-compatible code into rust with one call. auto-detects sources, compiles, exposes as rust modules. `load()` is the primary path. for rust → swift, see [eqswift](https://github.com/tschk/eqswift).
- **[eqswift](https://github.com/tschk/eqswift)** — Rust-to-Swift binding tooling for exposing Rust APIs to Swift.
- **[eqts](https://github.com/tschk/eqts)** — one rust api for typescript across node, bun, deno, and webassembly.
- **[rig](https://github.com/tschk/rig)** — cross-language native dependency manager — detects host language, adds libs via cli, exposes them in-process with equilibrium-ffi.
- **[apollo](https://github.com/tschk/apollo)** - a local-first Rust AI agent runtime with messaging integrations, provider adapters, tool permissions and plugins.
- **[telekinesis](https://github.com/tschk/telekinesis)** — ai coding agent cli + tui powered by rotary (rx4) + crepuscularity-tui. [telekinesis.tsc.hk](https://telekinesis.tsc.hk).
- **[rv8](https://github.com/tschk/rv8)** (roverite) - a custom browser engine built with servo and v8 with in house optimisations.
- **[rx4](https://github.com/tschk/rotary)** (rotary) — general-purpose agent harness engine and crate in rust owns the loop, tools, providers, sessions, permissions and computer-use (with rs_peekaboo).
- **[zkr](https://github.com/tschk/zkr)** - evidence-backed temporal memory engine for personal agents.
- **[praefectus](https://github.com/tschk/praefectus)** - provider-neutral computer-use execution tooling for Rust, with verification and permission boundaries.
- **[darash](https://github.com/tschk/darash)** - provider-neutral async search client + crate for agents.
- **[wax](https://github.com/tschk/wax)** (archived) — fast homebrew-compatible package manager in rust. uses homebrew's ecosystem (formulae, bottles, casks) without the ruby/git overhead — compiled, async, parallel installs, lockfiles, and experimental winget/scoop/nix-like support.
- **[oil](https://github.com/semitechnological/oil)** – fast system package manager in rust for all major \*nix systems based on wax with linuxbrew support and interop with existing package managers.
- **[nexnet](https://github.com/tschk/nexnet)** - local-first peer-to-peer social chat with wallet identity and encrypted messaging.
- **atmosphere** — a native sync and ecosystem layer for every device, with local-first and homelab support.

---

## miniapps

### web apps

- **[crates download history](https://cratesdownloadhistory.undivisible.dev/)** - see cumulative download history for a user on [crates.io](https://crates.io) with embeddable svg charts into markdowns and websites.
- **[standpoint](https://standpoint.undivisible.dev)** — the ultimate opinion based platform for sharing tierlists, voting on polls, and playing spectrum - a party game to guess on a spectrum based on a prompt.
- **[notes](https://notes.undivisible.dev/)** — minimal note taker with full google font support, code highlighting and editing and notion-style markdown editing.
- **[bublik](https://bublik.undivisible.dev/)** — canvas tool for generating custom frequency soundscapes.
- **[alphabets](https://alphabets.undivisible.dev)** — learn any unicode-supported alphabet through cards, quizzes, and completion tables.
- **[infrastruct](https://infrastruct.undivisible.dev)** — belief agnostic jurisprudence local ai search engine platform with searx & ddg, transformers.js and browser prompt api.
- **[akh](https://akh.undivisible.dev)** — islamic uniplatform for when i was previously interested in islam.

### developer tools

- **[herdr-gui](https://github.com/undivisible/herdr-gui)** - a gui surface for [herdr](https://herdr.dev) built with crepuscularity and [ghostty](https://ghostty.org/)
- **[incisor](https://github.com/undivisible/incisor)** - a rust + crepuscularity rewrite of balenaetcher to flash os images to sd cards and usbs

### browser extensions

- **[rs_vimium](https://github.com/undivisible/rs_vimium)** — a rust rewrite of the [vimium](https://github.com/philc/vimium) browser extension built with the [crepuscularity webextension framework](https://github.com/tschk/crepuscularity).
- **[anywhere](https://github.com/undivisible/anywhere)** — browser extension that turns ai chat responses into interactive interfaces. renders widgets, panels, forms, charts inside chat via custom response tags, also built with the [crepuscularity webextension framework](https://github.com/tschk/crepuscularity).

### mobile & desktop

- **[unthinkmail](https://unthinkmail.undivisible.dev/)** — mcp for imap-supported email.
- **[folk around](https://github.com/undivisible/folk-around)** - lets [folk](https://getfolk.app) or any hermes agent or openclaw interact with your computer p2p on macos.
- **[poke around](https://github.com/undivisible/poke-around)** — lets [poke](https://poke.com) interact with your computer across major oses.
- **[drift](https://github.com/undivisible/drift-wallpaper)** — macos drift screensaver as a live wallpaper on linux, macos, windows. spotify and apple music now playing support.
- **[vro](https://github.com/undivisible/vro)** — minimal micro inspired text editor written in v.
- **[ycyestim](https://github.com/undivisible/ycyestim)** — ios controller for ycy yokonex gen 1 and 2 electrostimulation hardware over btle (optional user-owned http/websocket bridge); dual-channel waveforms, presets and programs, safety limits, healthkit and watchos heart-rate adaptive output.

## libraries

- **[rs_ai](https://github.com/undivisible/rs_ai)** - rust ai sdk for building across cloud and local providers with one async-first api with on-device runtimes through `rs_ai_local` — including gemini nano on android and google chrome (browser prompt api), foundationmodels on macos, and phi silica on windows and microsoft edge (browser prompt api).
- **[rs_poke](https://github.com/undivisible/rs_poke)** - [poke by interaction's](https://poke.com) sdk in rust.
- **[rs_peekaboo](https://github.com/undivisible/rs_peekaboo)** - peter steinberger's [peekaboo](https://github.com/openclaw/Peekaboo) rewritten in rust with a shell tool and usable as a crate library for embedding into applications.
- **[rs_gbrain](https://github.com/undivisible/rs_gbrain)** - [garry tan's gbrain](https://github.com/garrytan/gbrain) for openclaw rewritten in rust.
- **[rs_imessage](https://github.com/undivisible/rs_imessage)** - rust imessage crate and cli.
- **[rs_facetime](https://github.com/undivisible/rs_facetime)** - rust facetime crate and cli.
- **[stalwart lite](https://github.com/arkiecompany/stalwart-lite)** — stalwart fork that runs in-process as a rust crate. imap, smtp, management api — no web admin, no overhead. built for embedding and local-first setups.
- **[crosspost-rs](https://github.com/arkiecompany/crosspost-rs)** - a rust crossposting library for multiple social media platforms.
- **[svelte-streamdown](https://sveltestreamdown.undivisible.dev/)** - a svelte version of [vercel's streamdown](https://github.com/vercel/streamdown) for streamable markdown rendering with interactive codeblocks and math rendering.
- **[ditherkit_flutter](https://ditherkit-flutter.undivisible.dev/)** - a flutter version of [boring software inc's dither kit](https://tripwire.sh/dither-kit) for data visual representations with dither effects.
- **[flowtoken_flutter](https://flowtoken-flutter.undivisible.dev/)** — a flutter version of [ephibb's flowtoken](https://github.com/Ephibbs/flowtoken) for clean streaming animations with blur and opacity transitions.
- **[flowtoken-svelte](https://flowtoken-svelte.undivisible.dev/)** — a svelte version of [ephibb's flowtoken](https://github.com/Ephibbs/flowtoken) for clean streaming animations with blur and opacity transitions.
- **[flowtoken-swift](https://github.com/undivisible/flowtoken-swift/)** — a swiftui version of [ephibb's flowtoken](https://github.com/Ephibbs/flowtoken) for clean streaming animations with blur and opacity transitions.
- **[tree-sitter-v](https://github.com/undivisible/tree-sitter-v)** - tree sitter parsing and grammars for [v](https://github.com/vlang/v).
- **[tree-sitter-holyc](https://github.com/undivisible/tree-sitter-holyc)** - tree sitter parsing and grammars for the [holiest programming language on earth](https://github.com/Jamesbarford/holyc-lang).
- **[ark-protocol](https://github.com/arkiecompany/ark-protocol)** - open protocol and reference implementation for exposing many local vps services behind one standardized https/websocket ingress. defines a manifest-based routing layer, adapter apis, and cloudflare-compatible edge integration for multiplexing internal ports through a single public endpoint.
- **[monoprotocol](https://github.com/atechnology-company/monoprotocol)** — normative draft sync protocol: wire format, crypto (hkdf, aes256gcm), replicated object model, journals, capabilities; rust reference crate on crates.io with golden conformance vectors (json/cbor).

and yes im scared of uppercase letters
