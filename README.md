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
  - `9.1/` - moonshine site source as it shipped at v9.1, before the machine redesign (`src/`, `scripts/`, configs)
- `web/os-image/` - the `/lab` machine: the alpenglowed desktop (`de/`, Zig) and the initramfs overlay baked onto the real alpenglow v86 image

## Next.js to moonshine

`web/` ran on Next.js 15 (App Router, static export) before moving to
moonshine. Same three routes, same 60 source files, same rendered output —
only the framework changed, and both were served from GitHub Pages, so the
hosting is identical.

Measured over the network against the deployed site, not a local build. Bytes
are uncompressed transfer sizes of the HTML plus every script and stylesheet it
references.

| Route    | Metric              |            Next.js |   moonshine |    Change |
| -------- | ------------------- | -----------------: | ----------: | --------: |
| `/`      | HTML                |             99,931 |      79,899 |      −20% |
| `/`      | JS                  | 894,470 (11 files) | 183,265 (1) |  **−80%** |
| `/`      | CSS                 |             53,509 |      41,166 |      −23% |
| `/agent` | HTML                |             13,195 |       3,923 |      −70% |
| `/agent` | JS                  | 654,653 (10 files) |       **0** | **−100%** |
| build    | compile + prerender |             3.06 s |      0.46 s |  **−85%** |

Build timing is the median of five local production builds on Bun 1.3.14 and
Apple arm64, with remote content-sync hooks omitted; it measures framework
compiler and prerender work, not browser loading. (The moonshine build was
0.29 s at migration; it is 0.46 s now that the redesign added `/lab` and its
components — still an order of magnitude under Next.js.)

### Since the migration: the machine (`/lab`)

The site is now also a computer. `/lab` boots a real 32-bit i686 Linux in the
browser under [v86](https://github.com/copy/v86) — the real
[alpenglow](https://github.com/tschk/alpenglow) image — and its screen is the
page: a hand-written **Zig 0.16** framebuffer desktop (compositor, bar,
draggable widgets with wikipedia-style hover cards, resizable panels) plus a
real browser ([NetSurf](https://www.netsurf-browser.org/), framebuffer, real
CSS) rendering the site offline. It adds one 5.3 KB page (`/lab`); the site CSS
grew to ~70 KB with the desktop's host-side styles; the ~27 MB of v86
kernel/initrd/wasm are vendored static assets loaded at runtime, cached
immutably, and are not part of any page bundle. See `web/README.md` for the
machine's internals.

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
