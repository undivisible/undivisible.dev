# Max Carter · 祁明思

**Software systems builder** · [undivisible.dev](https://undivisible.dev/)

I build software, from compilers and operating systems to web and desktop apps. Self-taught engineer working across systems, applications and developer tools.

## Contact

|           |                        |
| --------- | ---------------------- |
| Email     | max@tsc.hk             |
| Phone     | +61 481 729 894        |
| LinkedIn  | linkedin.com/in/tschk  |
| GitHub    | github.com/undivisible |
| Location  | Kuala Lumpur, Malaysia |
| Instagram | @undivisible.dev       |
| Twitter   | @makethings4ppl        |

## Experience

### Software Engineer — Chert (YC P26)

_October 2026 - present_

- Built major foundations of Chert's FaceTime stack, which lets developers connect AI agents through an API.
- Built rootless jailbreak tweaks for iOS 15-18 that hook FaceTime call and media daemons to observe and control calls, capture video and inject live video, backed by Rust and C++ media code.
- Developed multi-person FaceTime calling on macOS with private-API dylib injection, virtual microphone and camera drivers, and multi-account call control.
- Prototyped a VM-per-account orchestrator in Rust and Swift for concurrent lines.
- Refactored the production Swift worker and added CI and operations tooling.

### CTO — Twenify / MOMO GLOBAL LLC

_August 2026 - present_

- Sole engineer responsible for product development and production operations across payments, subscriptions, AI builders, communities, custom domains, security, and Arabic/English interfaces.
- Delivered 1,208 non-merge commits as of early October 2026.
- Migrated backend services to Cloudflare Workers and D1, and the frontend to Moonshine, my React runtime. Built deployment, recovery and monitoring tooling.
- Reduced running costs to less than one-thirtieth of the previous level.

### Systems and Product Architect — Gizzmo Electronics

_October 2024 - present_

- Built the website and Bluetooth companion app for automotive electronics, including unreleased hardware, at my father's company.
- Work spans iOS/Android development, firmware integration, e-commerce and product documentation.
- Redesigned the brand, packaging, manuals and unboxing experience.

**Client deliverable**

- **[Gizzmo Electronics](https://gizzmoelectronics.com)** — Product marketing site with Stripe pre-order checkout, brand redesign, and hardware/product narrative across the full customer journey; online product demo and manuals in progress. _Built with: SvelteKit 5, TypeScript, Vite, Tailwind CSS, Stripe, Netlify._

**Product packaging** _(unreleased hardware)_

- **[B1](https://gizzmoelectronics.com/b1)** — Boost controller (precision boost control, 2D mapping, real-time display, engine protection); retail box packaging and brand-aligned print artwork for pre-launch SKU, recreated as an online version with [instructions](https://gizzmoelectronics.com/b1/instructions).
- **F1** — Unreleased product; full retail packaging design to match Gizzmo brand system (not yet public).

### Artificer — The Software Company of Hong Kong

_January 2023 - present_

- Independent software development and open-source work across systems, applications and developer tools.
- Published 88 Rust crates with 110,783 combined downloads on crates.io as of 12 October 2026.
- Building Cupboard and the tschk projects, including cross-platform application tooling, language interoperability, AI runtimes, compilers and operating systems.

**Platforms being built**

- **[Cupboard](https://cupboard.tsc.hk)** — A local-first home hub for syncing files, photos and clipboard history between paired devices. _Built with: Alpenglow, Rust, Crepuscularity._

### Member of Technical Staff — Omi (Based Hardware)

_July 2026 - October 2026_

- Travelled to New York at 17 to work with Omi, then continued remotely. Worked across desktop, backend, device SDKs, security and infrastructure.
- Developed the v5 app rewrite, consolidated shared native/backend functionality, and built design spikes and interface scaffolds for capture, memory and assistant workflows.
- Worked with a colleague on optimisations that reduced monthly compute and app-hosting charges by approximately $11,800, or 37%.
- Fixed private account context leaking into group chats, unsafe database-query permissions and desktop chat stalls.
- Revamped the web platform, added current features and mobile support, and migrated it to Moonshine.
- Created 340 pull requests, with 186 merged, according to GitHub as of 12 October 2026. Also handled 263 pull requests, as reported in October 2026.

### Co-Founder CTO — The Arkie Company

_February 2026 - June 2026_

- Owned technical direction and development for AI SaaS products, from product design through deployment: business automation, content tools, communication services and shared AI infrastructure.
- Ran an agency building custom AI software for small and medium businesses, covering onboarding, internal workflows, data processing and client-facing applications.
- Closed the company after moving on to other opportunities.

**SaaS products built**

_Status_

- **Studio of Optimisations** — Dual-brand sales funnels (same codebase): Arkie-backed chat, live voice, calendar booking, lead capture, Notion connect portal. _Built with: SvelteKit 5, TypeScript, Tailwind CSS v4, Cloudflare Workers, Arkie API proxy, Bun._
- **Arkie** — Centralized MCP/AI backend for all Arkie apps: per-app system prompts, tool sets, chat/stream, calendar booking, Stripe/Calendly/Notion webhooks, Gemini Live voice, embeddings, admin console, OAuth for Claude MCP. _Built with: Rust, Axum, Tokio, Google Gemini, Supabase (PostgREST, Auth, pgvector), Cloudflare Workers/Containers, DigitalOcean SIP edge._
- **Pava** — AI content strategist and crossposting: brand chat, idea generation, AI-negotiated Stripe pricing, competitor analysis, video review, enterprise/agency workspaces, 13+ platforms via Late API. _Built with: Next.js 16, TypeScript, Supabase, Stripe, Google Gemini, Late API, Tailwind CSS v4, Capacitor, Bun._
- **Graft Mail** — Built on top of Unthinkmail: Send Emails (singular and bulk to 100000+ recipients) through MCP. _Built with: Qwik, TypeScript, Javascript, Stripe, Cloudflare Workers + Email, Tailwind CSS v4, Bun._
- **Unthought** — Business platforming: custom domain, AI-generated site, professional email, Cloudflare edge deploy, Stripe checkout, Stalwart mail provisioning (made with my own custom lightened Stalwart crate), Tangent integration hooks. _Built with: Next.js 16, TypeScript, Supabase, Cloudflare (OpenNext, D1, R2, Queues), Arkie, Stripe, Porkbun, Bun._
- **Tangent** — Discord automation for digital product sellers: Stripe payment webhooks, order fulfillment (keys, roles, content), ticketing, purchase-linked profiles, Gemini RAG support and image verification, event-driven workflows, admin dashboard, MCP tools for store ops. _Built with: Go (discordgo), SQLite/Postgres, Google Gemini, Astro 4, Alpine.js, htmx, UnoCSS, Cloudflare Workers (MCP, D1, Durable Objects)._
- **Currant** — Multi-tenant AI sales agents and job management for trades businesses; autonomous agents across WhatsApp, Telegram, SMS, Instagram, Slack, email, and native SIP/RTP phone; leads → quotes → jobs → invoices. _Built with: Go, Python (FastAPI), Elixir (Phoenix), Rust (telephony), Vlang (filter), SvelteKit, React Native (Expo), Tauri, SurrealDB, Redis, Gemini, Stripe, Square._
- **Waarom** — AI step-by-step in-product guidance: GPUI desktop companion, `@waarom/embed` SDK, Crepuscularity static portal and knowledge base. _Built with: Rust, GPUI, Crepuscularity, Gemini, TypeScript (embed SDK), MV3 web extension runtime._

**Client work**

- **[AJ Stafford Property Advocates](https://www.ajstafford.com.au)** — Chrome MV3 extension for realestate.com.au: finds comparable listings (bedrooms, ±15% price), on-page results widget, tab groups, CSV/TXT export; Buyer Ready Report print mockups and buyer-ready campaign assets. _Built with: JavaScript, Chrome Extensions MV3, Leaflet, Alpine.js, UnoCSS._

## Skills

| Area      |                                                                                          |
| --------- | ---------------------------------------------------------------------------------------- |
| Languages | Rust, Swift, TypeScript/JavaScript, Python, Go, V, Zig, C, C++, C#, Inauguration         |
| Frontend  | React + Native, Next.js, Solid, SvelteKit, Tailwind, SwiftUI, Crepuscularity             |
| Systems   | GPUI, Ratatui, MV3 extensions, FFI, UniFFI, Servo, V8, WASM, Linux                       |
| AI / Data | OpenAI, MCP, RAG, Transformers.js, Hugging Face, Supabase, PostgreSQL, SQLite, SurrealDB |
| Infra     | Cloudflare, Docker, GCP, Vercel, Netlify, Railway, GitHub Actions, CI/CD                 |

## Education

- Box Hill Institute - Certificate III in Information Technology, January 2024 - March 2026. Partially completed.
- Eltham High School - VCE, January 2024 - February 2026. Left before completion to build full time.
- Various online cybersecurity courses

## Languages

Cantonese · English · Russian · Mandarin · Indonesian · Learning Japanese

## Community

- Volunteer English teacher for Russian and other ESL speakers online, 2022–present.
- Barbie CTF 2023, Petrozavodsk: 12th place in Russian exploit competition.
- PECAN CTF 2025: 15th nationally, 4th in division.
- Participated in HackerOne, HackTheBox and related organisations.

## Interests

Learning · Travel · Cooking · Photography · Phenomenology · Existentialism · Language learning · Science-based lifting · UFC & Wrestling
