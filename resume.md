# Max Carter · 祁明思

**Software systems builder** · [undivisible.dev](https://undivisible.dev/)

I make things for people. Part-time language learner, part-time philosopher, full-time schemer. I build systems, runtimes, interfaces, developer tools, and small pieces of software that feel inevitable. Self-taught full-stack and low-level developer; building production software since age 8.

## Contact

| | |
|---|---|
| Email | max@undivisible.dev |
| Phone | +61 481 729 894 |
| Instagram | @undivisible.dev |
| Twitter | @makethings4ppl |
| GitHub | github.com/undivisible |
| Location | Melbourne / Sydney / Hong Kong |

## Experience

### Technical Cofounder — The Arkie Company

*2024–present*

- Engineering leadership, product direction, and hands-on delivery across web surfaces, automation, and internal systems.
- Build custom AI automation systems, product prototypes, client-facing web surfaces, and internal tooling.

**SaaS products built**

*Status*

- **[Studio of Optimisations](https://optimisations.studio)** · **[Graft AI](https://graftai.com.au)** · **Production** · **[+61 3 8828 9225](tel:+61388289225)** — Dual-brand sales funnels (same codebase): Arkie-backed chat, live voice, calendar booking, lead capture, Notion connect portal. *Built with: SvelteKit 5, TypeScript, Tailwind CSS v4, Cloudflare Workers, Arkie API proxy, Bun.*
- **[Arkie](https://arkie.company)** · **Production** · Centralized MCP/AI backend for all Arkie apps: per-app system prompts, tool sets, chat/stream, calendar booking, Stripe/Calendly/Notion webhooks, Gemini Live voice, embeddings, admin console, OAuth for Claude MCP. *Built with: Rust, Axum, Tokio, Google Gemini, Supabase (PostgREST, Auth, pgvector), Cloudflare Workers/Containers, DigitalOcean SIP edge.*
- **[Pava](https://pava.studio)** · **Closed beta** (approaching release) · AI content strategist and crossposting: brand chat, idea generation, AI-negotiated Stripe pricing, competitor analysis, video review, enterprise/agency workspaces, 13+ platforms via Late API. *Built with: Next.js 16, TypeScript, Supabase, Stripe, Google Gemini, Late API, Tailwind CSS v4, Capacitor, Bun.*
- **[Unthought](https://unthought.arkie.company)** · **Alphas** · Business platforming: custom domain, AI-generated site, professional email, Cloudflare edge deploy, Stripe checkout, Stalwart mail provisioning, Tangent integration hooks. *Built with: Next.js 16, TypeScript, Supabase, Cloudflare (OpenNext, D1, R2, Queues), Arkie, Stripe, Porkbun, Bun.*
- **[Tangent](https://tangent.undivisible.dev)** · **Alpha** · Discord automation for digital product sellers: Stripe payment webhooks, order fulfillment (keys, roles, content), ticketing, purchase-linked profiles, Gemini RAG support and image verification, event-driven workflows, admin dashboard, MCP tools for store ops. *Built with: Go (discordgo), SQLite/Postgres, Google Gemini, Astro 4, Alpine.js, htmx, UnoCSS, Cloudflare Workers (MCP, D1, Durable Objects).*
- **Currant** · **Work in progress** · Multi-tenant AI sales agents and job management for trades businesses; autonomous agents across WhatsApp, Telegram, SMS, Instagram, Slack, email, and native SIP/RTP phone; leads → quotes → jobs → invoices. *Built with: Go, Python (FastAPI), Elixir (Phoenix), Rust (telephony), Vlang (filter), SvelteKit, React Native (Expo), Tauri, SurrealDB, Redis, Gemini, Stripe, Square.*
- **Waarom** · **Work in progress** · AI step-by-step in-product guidance: GPUI desktop companion, `@waarom/embed` SDK, Crepuscularity static portal and knowledge base. *Built with: Rust, GPUI, Crepuscularity, Gemini, TypeScript (embed SDK), MV3 web extension runtime.*

**Client work**

- **[AJ Stafford Property Advocates](https://www.ajstafford.com.au)** — Chrome MV3 extension for realestate.com.au: finds comparable listings (bedrooms, ±15% price), on-page results widget, tab groups, CSV/TXT export; Buyer Ready Report print mockups and buyer-ready campaign assets. *Built with: JavaScript, Chrome Extensions MV3, Leaflet, Alpine.js, UnoCSS.*

### Founder, Artificer — The Software Company of Hong Kong, atechnology company

*2023–present*

- Freelance developer since 2024.
- Maintain 32+ public GitHub repositories across systems, runtimes, interfaces, developer tools, AI SDKs, and miniapps.
- Primary open-source work includes Crepuscularity, Aurorality, Wax, Equilibrium, and Soliloquy.

**Platforms built**

- **Ark** — Ultra-simple hosted app platform (Vercel-style ergonomics, Railway-style flexibility): Rust control-plane API, V language CLI (`deploy`, `logs`, `rollback`), Svelte dashboard, YAML app manifests, `ark-protocol` edge ingress. *Built with: Rust (Axum), V, Svelte 5, SurrealDB, Docker Compose, Bun.*
- **[Mono](https://github.com/atechnology-company/mono)** — Post-web computing infrastructure: object-centric, identity-addressed encrypted replication; mesh gossip, gateway relay, using `unthinkclaw` agent runtime, mono-browser shell (Crepuscularity/GPUI). *Built with: Rust (`mono-protocol`, `mono-mesh`, `mono-gateway`, `mono-agent`, `mono-browser`).*

### Systems and Product Architect — Gizzmo Electronics

*late 2024*

- Created websites and companion apps; inspired direction for hardware products across product surfaces, packaging, manuals, and marketing.
- Redesigned brand and design in entirety.

**Client deliverable**

- **[Gizzmo Electronics](https://gizzmoelectronics.com)** — Product marketing site with Stripe pre-order checkout, brand redesign, and hardware/product narrative across the full customer journey; online product demo and manuals in progress. *Built with: SvelteKit 5, TypeScript, Vite, Tailwind CSS, Stripe, Netlify.*

**Product packaging** *(unreleased hardware)*

- **B1** — Boost controller (precision boost control, 2D mapping, real-time display, engine protection); retail box packaging and brand-aligned print artwork for pre-launch SKU.
- **F1** — Unreleased product; full retail packaging design to match Gizzmo brand system (not yet public).

## Platforms & frameworks

### [Crepuscularity](https://crepuscularity.undivisible.dev) · [GitHub](https://github.com/tschk/crepuscularity)

Cross-platform application framework from a single web-based codebase — React + Tailwind CSS with a JS/TS or Rust backend. Targets GPUI desktop apps, SwiftUI and Jetpack Compose mobile, Ratatui TUIs, websites, and MV3 browser extensions.

*Built with: Rust (workspace), React, Tailwind CSS, V8, GPUI, Ratatui, WebExtensions.*

### [Aurorality](https://github.com/tschk/aurorality)

Turns web frontends into native SwiftUI for macOS and iOS; backends in Swift, JavaScript/TypeScript, or Rust. Crepuscularity Lite and Aurorality-JS drop into existing sites to connect native frontends to JS backends.

*Built with: Rust, Swift, SwiftUI, Eqswift, JavaScript/TypeScript.*

### Subprojects

- **[Inauguration (WIP)](https://github.com/tschk/inauguration)** — Experimental multi-frontend compiler/runtime targeting Core IR, SIL analysis, hot reload, and ultrafast incremental workflows. *Built with: Rust.*
- **[Equilibrium](https://github.com/tschk/equilibrium)** — Load C-compatible code into Rust with one call; auto-detects sources, compiles, exposes as Rust modules. *Built with: Rust, C FFI.*
- **[Eqswift](https://github.com/tschk/eqswift)** — Rust → Swift FFI with minimal boilerplate (companion to Equilibrium). *Built with: Rust, Swift.*
- **[Wax](https://github.com/tschk/wax)** — Fast Homebrew-compatible package manager; formulae, bottles, casks, lockfiles, async parallel installs; experimental WinGet/Scoop/Nix-like support. *Built with: Rust.*

## Operating systems & runtimes

### [Soliloquy](https://github.com/tschk/soliloquy)

Experimental web-native operating system model — immutable, browser-native, on a modified Alpine base.

*Built with: Rust, Alpine Linux, Servo, V8.*

### [RV8](https://github.com/tschk/rv8)

Custom browser engine for Soliloquy combining Servo rendering with V8 JavaScript.

*Built with: Rust, Servo, V8.*

### Other

- **Experiences** — Spatial web exploration on Unity WASM. *Built with: Unity, WebAssembly, TypeScript, Kotlin, Swift and Rust.*
- **Atmosphere** — Native sync and ecosystem layer for every device; local-first and homelab support. *Built with: Rust (in development; no public repo yet).*

## macOS tooling · [semitechnological](https://github.com/semitechnological)

- **[Tile (WIP)](https://github.com/semitechnological/tile)** — Mosaic-style tiling window manager, canvas, and multiplexer for macOS. *Built with: Rust, macOS APIs.*
- **Otto (WIP)** — AI-powered ottocomplete anywhere on your Mac. *Built with SwiftUI and Rust + Eqswift.*
- **Rover (WIP)** — Utilities and plugin system for Mac, inspired by Raycast + Ghostty. *Built with Crepuscularity, SwiftUI and Rust.*

## Websites

- **[Standpoint](https://standpoint.undivisible.dev)** · [GitHub](https://github.com/undivisible/standpoint) — Opinion platform for tier lists, polls, and Spectrum (party game on a prompt-based spectrum). *Built with: SvelteKit, TypeScript, Tailwind CSS, Cloudflare Workers/Durable Objects, Vite, Bun.*
- **[Unthinkmail](https://unthinkmail.undivisible.dev)** · [GitHub](https://github.com/undivisible/unthinkmail) — MCP server for IMAP-supported email. *Built with: Cloudflare Workers, Hono, Wrangler, MCP, Bun.*
- **[Notes](https://notes.undivisible.dev)** · [GitHub](https://github.com/undivisible/notes) — Minimal note taker with Google Fonts, code highlighting, and Notion-style markdown editing. *Built with: Svelte 5, Vite, Tailwind CSS, CodeMirror, Bun.*
- **[Bublik](https://bublik.undivisible.dev)** · [GitHub](https://github.com/undivisible/bublik) — Canvas tool for custom frequency soundscapes. *Built with: Rust, Leptos (CSR/WASM), Web Audio API.*
- **[Alphabets](https://alphabets.undivisible.dev)** · [GitHub](https://github.com/undivisible/alphabets) — Learn any Unicode-supported alphabet via cards, quizzes, and completion tables. *Built with: React, TypeScript, Vite, Tailwind CSS, Capacitor (iOS/Android), Bun.*
- **[Infrastruct](https://infrastruct.undivisible.dev)** · [GitHub](https://github.com/undivisible/infrastruct) — Belief-agnostic jurisprudence local AI search (SearXNG, DuckDuckGo, Transformers.js, Browser Prompt API). *Built with: Next.js 15, React 19, TypeScript, Tailwind CSS, Transformers.js, Bun.*
- **[AKH (archived)](https://akh.undivisible.dev)** · [GitHub](https://github.com/undivisible/akh) — Islamic uniplatform (archived). *Built with: Svelte, TypeScript.*

## Programs

- **[Drift](https://github.com/undivisible/drift-wallpaper)** — macOS Drift screensaver as live wallpaper on Linux, macOS, and Windows; Spotify and Apple Music now playing. *Built with: Rust.*
- **[Vro](https://github.com/undivisible/vro)** — Ultraminimal micro-inspired text editor. *Built with: V.*
- **[Unthinkclaw](https://github.com/undivisible/unthinkclaw)** — OpenClaw-scale local agent runtime at a fraction of the size; agent swarms, multi-channel messaging. *Built with: Rust.*
- **[Poke Around](https://github.com/undivisible/poke-around)** — Lets [Poke](https://poke.com) interact with your computer on major OSes. *Built with: Zig and Typescript.*
- **[Unelaborate](https://github.com/undivisible/unelaborate)** — Minecraft client in native SwiftUI with Modrinth modpack, shader, and resource-pack loading. *Built with: Swift, SwiftUI.*
- **[YCYEStim](https://github.com/undivisible/YCYEStim)** — iOS controller for YCY-YOKONEX Gen 1 and 2 electrostimulation hardware over Bluetooth LE (optional user-owned HTTP/WebSocket bridge); dual-channel waveforms, presets and programs, safety limits, HealthKit and watchOS heart-rate adaptive output. *Built with: Swift 6, SwiftUI, CoreBluetooth, HealthKit, watchOS.*
- **[Anywhere](https://github.com/undivisible/anywhere)** — Browser extension that turns AI chat responses into interactive UIs (widgets, panels, forms, charts) via custom response tags. *Built with: Rust, Crepuscularity WebExt, MV3.*

## Libraries & infrastructure

- **[rs_ai](https://github.com/undivisible/rs_ai)** — Async-first Rust AI SDK for cloud and on-device providers (`rs_ai_local`: Gemini Nano, Foundation Models, Phi Silica, Browser Prompt API). *Built with: Rust.*
- **[rs_imessage](https://github.com/undivisible/rs_imessage)** — Rust iMessage library and CLI for macOS. *Built with: Rust.*
- **[rs_facetime](https://github.com/undivisible/rs_facetime)** — Rust FaceTime library and CLI for macOS. *Built with: Rust.*
- **[Stalwart Lite](https://github.com/arkiecompany/stalwart-lite)** — Stalwart mail server as an in-process Rust crate; IMAP, SMTP, management API; embedding and local-first. *Built with: Rust.*
- **[crosspost-rs](https://github.com/arkiecompany/crosspost-rs)** — Crossposting library for multiple social platforms. *Built with: Rust.*
- **[ark-protocol](https://github.com/arkiecompany/ark-protocol)** — Open protocol and reference implementation for exposing many local VPS services behind one HTTPS/WebSocket ingress; manifest routing, adapter APIs, Cloudflare-compatible edge multiplexing. *Built with: JavaScript/TypeScript, Cloudflare.*
- **[monoprotocol](https://github.com/atechnology-company/monoprotocol)** — Normative draft sync protocol: wire format, crypto (HKDF, AES-256-GCM), replicated object model, journals, capabilities; Rust reference crate on crates.io with golden conformance vectors (JSON/CBOR). *Built with: Rust, Markdown spec, conformance fixtures.*

## Skills

| Area | |
|---|---|
| Languages | Rust, Swift, TypeScript/JavaScript, Python, Go, V, Zig, C / C# |
| Frontend | React, Next.js, SvelteKit, Solid, Tailwind, Leptos, Imba, Astro WebGL, SwiftUI, Crepuscularity |
| Systems | GPUI, Ratatui, MV3 extensions, FFI, UniFFI, Servo, V8, WASM, Linux |
| AI / Data | OpenAI, MCP, RAG, Transformers.js, local models, Hugging Face, Supabase, PostgreSQL, SurrealDB |
| Infra | Cloudflare Workers, Docker, GitHub Actions, CI/CD, SQLite |

## Education

- Certificate III in Information Technology coursework, Box Hill Institute. Completing unfinished units this year.
- VCE coursework at Eltham High School, including Information Technology, Applied Computing, Politics, Philosophy, Extended Investigation, Linguistics, and Indonesian; left before Year 12 completion to build full time.

## Languages

Cantonese · English · Russian · Mandarin · Indonesian · Learning Japanese and German

## Community

- Volunteer English teacher for Russian speakers online, 2022–present.
- Barbie CTF 2023, Petrozavodsk: 12th place in Russian exploit competition.
- PECAN CTF 2025: 15th nationally, 4th in division.

## Interests

Learning · Travel · Cooking · Photography · Phenomenology · Existentialism · Consciousness hacking · Language learning · Computer systems · Science-based lifting · UFC & Wrestling
