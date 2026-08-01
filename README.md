# undivisible.dev

Profile and CV markdown live on [`undivisible/undivisible`](https://github.com/undivisible/undivisible). This repo does not author those files; `web` sync scripts fetch raw GitHub URLs at build time and write deploy copies under `web/public/`.

| Upstream file                                                                 | Role                                                                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [`README.md`](https://github.com/undivisible/undivisible/blob/main/README.md) | **Project list** and portfolio sections parsed into the site (`parseReadme` / `readme-projects.generated.ts`).               |
| [`now.md`](https://github.com/undivisible/undivisible/blob/main/now.md)       | **Now status** (short line; optional `---` + article). Clock overlay and `public/now.md` snapshot only—not the project list. |
| [`resume.md`](https://github.com/undivisible/undivisible/blob/main/resume.md) | CV, contact, experience.                                                                                                     |

Override sync URLs with `PROFILE_README_URL` (project-list source) or `RESUME_MARKDOWN_URL` when syncing locally.

## Structure

- `web/` - the production site, built on [moonshine](https://github.com/tschk/moonshine) (React renderer, prerendered to static HTML, hydrated islands); see `web/README.md` for shipped features and env vars
- `old/` - Previous versions of the site:
  - `one/` - HTML/CSS site
  - `two/` - HTML/CSS site
  - `three/` - HTML/CSS site
  - `four/` - HTML/CSS site
  - `five/` - HTML/CSS site
  - `six/` - HTML/CSS site
  - `six.five/r1/` - Svelte site
  - `six.five/r2/` - Imba site
  - `seven/` - Rust/Leptos WASM site
  - `eight/` - Next.js site
  - `nine/` - Next.js 16 source snapshot only (`src/`, `app/`, configs); no `public/` bundle

## Next.js to moonshine

`web/` ran on Next.js 15 (App Router, static export) before moving to
moonshine. Same three routes, same 60 source files, same rendered output —
only the framework changed, and both were served from GitHub Pages, so the
hosting is identical.

Measured over the network against the deployed site, not a local build. Bytes
are uncompressed transfer sizes of the HTML plus every script and stylesheet it
references.

| Route    | Metric |            Next.js |   moonshine |    Change |
| -------- | ------ | -----------------: | ----------: | --------: |
| `/`      | HTML   |             99,931 |      79,899 |      −20% |
| `/`      | JS     | 894,470 (11 files) | 183,265 (1) |  **−80%** |
| `/`      | CSS    |             53,509 |      41,166 |      −23% |
| `/agent` | HTML   |             13,195 |       3,923 |      −70% |
| `/agent` | JS     | 654,653 (10 files) |       **0** | **−100%** |

`/agent` ships no JavaScript because nothing on it is interactive; under
Next.js it still received the framework runtime. The interactive parts of `/`
— canvas shaders, the clock, the ASCII field — hydrate as islands and are
unchanged.

Only four of the 60 source files imported from Next (`next/link` ×2,
`next/font/google`, `next/dynamic`); the rest is plain React, which moonshine
renders directly. The trade: no Next client router, so in-app navigation is a
full page load. On three static routes that costs nothing, but it would matter
on a larger app.

## Development

```bash
bun install
bun run dev
```

## Building

```bash
bun run build:web
```
