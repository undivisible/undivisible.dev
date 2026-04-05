# Agent notes — undivisible.dev repository

## What this repo is

A **Rust-only** static site:

1. **`crepus web build`** (from `semitechnological/crepuscularity`, branch **`web-v3`**) reads `crepuscularity-site/site.json` and writes HTML.
2. **`expand-site-links`** (`site-tools` crate) post-processes `dist/index.html`, replacing tokens like `__CREPUS__` with anchor tags.

There is **no** Next.js in the production build. Do not reintroduce Node for the main site without an explicit request.

## Tokens

All placeholders live in `site-tools/src/main.rs` (`replacements()`). Any new `__NAME__` in `site.json` must have a matching entry there.

## Crepuscularity facts (avoid mislabeling)

- **`crepus web`** → static HTML from `site.json` (not WASM).
- **`crepus webext`** → MV3 extensions with WASM + manifests (`crepuscularity-webext`).
- User-facing claims in copy should match what the upstream README says, extended only when the user explicitly asks.

## Layout

| Path | Role |
|------|------|
| `crepuscularity-site/site.json` | Page content |
| `site-tools/` | `expand-site-links` binary |
| `scripts/build-static.sh` | Local full pipeline |
| `.github/workflows/deploy.yml` | Pages deploy |
| `old/` | Archived site iterations — not part of build |

## After edits

```bash
cargo fmt
cargo clippy -p site-tools -- -D warnings
./scripts/build-static.sh
```
