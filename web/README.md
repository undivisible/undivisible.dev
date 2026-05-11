# undivisible (Next.js app)

Production site for undivisible.dev. Built with Next.js 16 (App Router), React 19, Tailwind v4, Bun.

## User-facing features

- **Home** — Scroll-snap sections, full-viewport Ascii + WebGL backdrop, Last.fm “now playing / last listened” block with links, Hong Kong day/night **Light** shader tied to clock scrubber.
- **Clock / weather** — Open‑Meteo weather link, HKG / MEL / local clock links (timeanddate), wheel scrub to shift displayed time, “scroll to change time” hint on desktop hover, **now** opens local `now.md` overlay (Escape / back to close); **now** is a visible control on small screens.
- **Navigation** — `SiteNav` in-page anchors (`#start`, `#services`, `#outcomes`, `#work`, `#pillars`, `#world`, `#contact`), resume print, `/brief` link.
- **Services** — Embedded “What I do” + four service rows (motion on view).
- **Portfolio** — Case studies (`#outcomes`) and flagship pillars (`#pillars`) from readme data.
- **Info slices** — Hero (`#start`), work grid + readme utilities (`#work`), bio / resume / contact (`#world`, `#contact`).
- **Print** — `HomePrintRoot` + brief `PrintRoot` for print layouts.
- **Profile data** — `getProfileReadmeProjects()` fetches `now.md` (fallback `README.md`), normalizes utilities (e.g. aurorality, eqswift). `PROFILE_README_URL` overrides fetch URL. `bun run sync:readme` writes `readme-projects.generated.ts`.
- **Last.fm** — Client fetch + optional `public/lastfm-recent.json` from `bun run sync:lastfm` when `NEXT_PUBLIC_LASTFM_API_KEY` is set.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Next dev server |
| `bun run build` | Sync readme + optional Last.fm snapshot, then `next build` |
| `bun run sync:readme` | Regenerate `src/data/readme-projects.generated.ts` |
| `bun run sync:lastfm` | Write `public/lastfm-recent.json` (skipped without API key) |
| `bun run typecheck` | `tsc --noEmit` |

## Env (public)

- `NEXT_PUBLIC_LASTFM_USERNAME`, `NEXT_PUBLIC_LASTFM_API_KEY`
- `PROFILE_README_URL` (optional readme / now.md raw URL)

## Content source

Repo root `README.md` documents the upstream `now.md` / README profile sync for this workspace.
