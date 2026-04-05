# Repository context for Claude / coding agents

## Scope

This repository is **only** the undivisible.dev Next.js app plus the **Crepuscularity static site** inputs and glue scripts. It is not the Crepuscularity monorepo; CI clones that separately.

## Layout

| Path | Role |
|------|------|
| `app/` | Next.js App Router; `page.tsx` and `about/page.tsx` are shells; UI is in `SiteShell` |
| `components/SiteShell.tsx` | Client UI: bio paragraph, `ProjectLink` tooltips, nav |
| `crepuscularity-site/site.json` | Structured content for `crepus web build` |
| `scripts/build-static.sh` | Clone/build `crepus`, emit `out/index.html` |
| `scripts/apply-crepus-link-placeholders.mjs` | Replace `__GH_*__` tokens with `<a>` tags after HTML generation |
| `.github/workflows/deploy.yml` | GitHub Pages: Rust + cloned crepuscularity `web-v3` → `dist/` |

## Editing the “paragraph”

The visible bio is the block starting at “hi, i'm max carter” in `components/SiteShell.tsx`. Each `ProjectLink` needs a matching entry in the `PROJECTS` map (id → url, description, stack).

## Crepuscularity `web-v3` note

On branch `web-v3`, `crepus web build` produces **static HTML from `site.json`**. WASM is central to **`crepus webext`** (extensions), not to `crepus web`. The README describes the static pipeline accurately; avoid calling `crepus web` output “WASM” unless you add a wasm client yourself.

## Constraints

- Prefer minimal diffs; match existing Tailwind + Framer patterns.
- Do not remove `.gitignore` rules for `out/` (Next export) or `dist/` (Crepuscularity static) unless deployment changes.
- After substantive edits, run `npm run lint` and `npm run build`.
