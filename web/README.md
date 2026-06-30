# undivisible (Next.js app)

Production site for undivisible.dev. Built with Next.js 16 (App Router), React 19, Tailwind v4, Bun.

## User-facing features

- **Home** — Scroll-snap sections, full-viewport Ascii + WebGL backdrop, Last.fm “now playing / last listened” block with links, Hong Kong day/night **Light** shader tied to clock scrubber.
- **Clock / weather** — Open‑Meteo weather link, HKG / MEL / local clock links (timeanddate), wheel scrub to shift displayed time, “scroll to change time” hint on desktop hover, **now** opens local `now.md` overlay (Escape / back to close); **now** is a visible control on small screens.
- **Navigation** — `SiteNav` in-page anchors (`#start`, `#services`, `#outcomes`, `#work`, `#pillars`, `#world`, `#contact`), **agent** link to `/agent`, generated resume and brief PDF downloads.
- **Services** — Embedded “What I do” + four service rows (motion on view).
- **Portfolio** — Case studies (`#outcomes`) and flagship pillars (`#pillars`) from readme data.
- **Info slices** — Hero (`#start`), work grid + readme utilities (`#work`), bio / resume / contact (`#world`, `#contact`).
- **Print / PDF** — Browser print (`window.print`) from DOM layers: resume (`HomePrintRoot`) and brief (`PrintRoot`); not `@react-pdf`.
- **Profile / projects** — Parsed from **`undivisible/undivisible` `README.md`** (not `now.md`). SSR seed: `getProfileReadmeProjects()` reads build-time `readme-projects.generated.ts`. After load, `useRemoteReadme` refetches README (then `now.md` only if README fails) from GitHub raw URLs and keeps the parse with the most projects. `bun run sync:readme` regenerates the generated file from the same README-first order. Normalizes utilities (e.g. aurorality, eqswift). `PROFILE_README_URL` / `NEXT_PUBLIC_PROFILE_README_URL` override the project-list URL.
- **Resume** — `fetchResumeMarkdown()` pulls `resume.md` from `undivisible/undivisible`; `bun run sync:resume` parses contact/experience into `resume-from-markdown.generated.ts`. Email and social links on the site come from the resume Contact table. `RESUME_MARKDOWN_URL` overrides the raw URL.
- **Last.fm** — Client fetch + optional `public/lastfm-recent.json` from `bun run sync:lastfm` when `NEXT_PUBLIC_LASTFM_API_KEY` is set.
- **Now status** — `useNowMarkdown` fetches upstream **`now.md`** (status line / article). Deploy snapshot: `public/now.md` and `now-markdown.generated.ts` via `sync:now` / `sync:agent`.
- **Agent mode** — `/agent` lists direct URLs; `public/llms.txt`, `llms-full.txt`, `agent.md`, `now.md`, `resume.md`, `robots.txt` are **prebuild snapshots** only (`bun run sync:agent`). Live home UI: **README** for projects, **now.md** for status, **resume.md** for CV (localStorage cache on raw fetches).

## Commands

| Command               | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `bun run dev`         | Next dev server                                                   |
| `bun run build`       | Sync readme + optional Last.fm snapshot, then `next build`        |
| `bun run sync:readme` | Regenerate `src/data/readme-projects.generated.ts`                |
| `bun run sync:lastfm` | Write `public/lastfm-recent.json` (skipped without API key)       |
| `bun run sync:agent`  | Write agent markdown + `llms.txt`/`llms-full.txt` under `public/` |
| `bun run typecheck`   | `tsc --noEmit`                                                    |

## Env (public)

- `NEXT_PUBLIC_LASTFM_USERNAME`, `NEXT_PUBLIC_LASTFM_API_KEY`
- `PROFILE_README_URL` / `NEXT_PUBLIC_PROFILE_README_URL` (optional override for **project-list** markdown URL; default is upstream `README.md`)
- `RESUME_MARKDOWN_URL` (optional resume.md raw URL)

## Content source (`undivisible/undivisible`)

- **Projects / work grid / pillars** → upstream **`README.md`** (`profileMarkdownUrls()`, `REMOTE_README_URLS`).
- **Now line / article overlay** → upstream **`now.md`** (`NOW_STATUS_URL`, `NEXT_PUBLIC_NOW_STATUS_URL`).
- **Resume / contact** → upstream **`resume.md`**.

Repo root `README.md` summarizes the same split. Do not treat `now.md` as the project list.
