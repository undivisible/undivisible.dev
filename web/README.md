# undivisible (moonshine app)

Production site for undivisible.dev. Built on moonshine 0.3 (App Router conventions via `@tschk/moonshine-compiler`, `@tschk/moonshine-next` for the `next/*` API surface), React 19, Tailwind v4, Bun. Every route is prerendered to static HTML at build time; only the interactive subtrees ship JavaScript.

## User-facing features

- **Home** — Scroll-snap sections, full-viewport Ascii + WebGL backdrop, Last.fm “now playing / last listened” block with links, Hong Kong day/night **Light** shader tied to clock scrubber.
- **Clock / weather** — Open‑Meteo weather link, HKG / MEL / local clock links, wheel scrub to shift displayed time; **now** opens `now.md` overlay (Escape to close).
- **Navigation** — `SiteNav`: **agent** link to `/agent`, resume PDF download.
- **Info slices** — Hero + social links (`#start`), work grid + readme utilities (`#work`), bio / resume / contact (`#world`, `#contact`).
- **Print / PDF** — Browser print (`window.print`) from DOM layer: resume (`HomePrintRoot`); not `@react-pdf`.
- **Profile / projects** — Parsed from **`undivisible/undivisible` `README.md`** (not `now.md`). SSR seed: `getProfileReadmeProjects()` reads build-time `readme-projects.generated.ts`. After load, `useRemoteReadme` refetches README (then `now.md` only if README fails) from GitHub raw URLs and keeps the parse with the most projects. `bun run sync:readme` regenerates the generated file from the same README-first order. Normalizes utilities (e.g. aurorality, eqswift). `PROFILE_README_URL` / `NEXT_PUBLIC_PROFILE_README_URL` override the project-list URL.
- **Resume** — `fetchResumeMarkdown()` pulls `resume.md` from `undivisible/undivisible`; `bun run sync:resume` parses contact/experience into `resume-from-markdown.generated.ts`. Email and social links on the site come from the resume Contact table. `RESUME_MARKDOWN_URL` overrides the raw URL.
- **Last.fm** — Client fetch + optional `public/lastfm-recent.json` from `bun run sync:lastfm` when `NEXT_PUBLIC_LASTFM_API_KEY` is set.
- **Now status** — `useNowMarkdown` fetches upstream **`now.md`** (status line / article). Deploy snapshot: `public/now.md` and `now-markdown.generated.ts` via `sync:now` / `sync:agent`.
- **Agent mode** — `/agent` lists direct URLs; `public/llms.txt`, `llms-full.txt`, `agent.md`, `now.md`, `resume.md`, `robots.txt` are **prebuild snapshots** only (`bun run sync:agent`). Live home UI: **README** for projects, **now.md** for status, **resume.md** for CV (localStorage cache on raw fetches).
- **The machine (`/lab`)** — the page is a real i686 PC. `MachineRoot` (`src/components/os/`, `src/lib/os/vm.ts`) boots [v86](https://github.com/copy/v86) on the real [alpenglow](https://github.com/tschk/alpenglow) image (Linux 7.1.3, rebuilt with bochs-drm/fbcon/PS-2 for a framebuffer), 512 MB, at the window's native resolution. Its screen is a hand-written **Zig 0.16** desktop, **undesk** (`os-image/de/`, named to avoid confusion with tschk/alpenglowed): `undeskd`, a compositor + everything-bar, draggable widgets (Hong Kong clock, `/proc` machine monitor, name card with the almanac's wikipedia-style hover cards) as separate client programs (`unwall`/`unclock`/`unmachine`/`uncard`/`unpanel`) over a `/run/undesk/wm.sock` protocol, anti-aliased Geist Mono, resizable panels, content baked from `src/data/lab-facts.ts`, and a `sites` app that opens host tabs via `@@open` on ttyS0. `web` launches **NetSurf** (framebuffer, real CSS, `/dev/input/mice`) rendering the site offline; `links` is the small fallback; `sh` hands over the real console. Build the desktop with `scripts/build-de.sh` (`zig build`, static i686); repack the initramfs with `scripts/build-os-initramfs.sh`. VM assets are vendored under `public/v86/` cached for the browser.

## Commands

| Command               | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `bun run dev`         | Build and serve `out/` locally                                    |
| `bun run build`       | Sync readme + optional Last.fm snapshot, then prerender to `out/` |
| `bun run sync:readme` | Regenerate `src/data/readme-projects.generated.ts`                |
| `bun run sync:lastfm` | Write `public/lastfm-recent.json` (skipped without API key)       |
| `bun run sync:agent`  | Write agent markdown + `llms.txt`/`llms-full.txt` under `public/` |
| `bun run typecheck`   | `tsc --noEmit`                                                    |

The `/lab` machine has its own build (see the machine feature above): `sh scripts/build-de.sh` (Zig desktop, static i686) then `sh scripts/build-os-initramfs.sh` (repack the alpenglow initramfs with the overlay). Both output committed artifacts, so the site build never needs Zig or cpio.

## Env (public)

- `NEXT_PUBLIC_LASTFM_USERNAME`, `NEXT_PUBLIC_LASTFM_API_KEY`
- `PROFILE_README_URL` / `NEXT_PUBLIC_PROFILE_README_URL` (optional override for **project-list** markdown URL; default is upstream `README.md`)
- `RESUME_MARKDOWN_URL` (optional resume.md raw URL)

## Content source (`undivisible/undivisible`)

- **Projects / work grid** → upstream **`README.md`** (`profileMarkdownUrls()`, `REMOTE_README_URLS`).
- **Now line / article overlay** → upstream **`now.md`** (`NOW_STATUS_URL`, `NEXT_PUBLIC_NOW_STATUS_URL`).
- **Resume / contact** → upstream **`resume.md`**.

Repo root `README.md` summarizes the same split. Do not treat `now.md` as the project list.
