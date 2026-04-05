# undivisible.dev (Rust / Crepuscularity)

This repository builds **one static site** from structured data with **[Crepuscularity](https://github.com/semitechnological/crepuscularity)** (`crepus web build` on branch **`web-v3`**). There is **no Next.js or Node** in the deployment path—only Rust (plus a clone of the upstream Crepuscularity workspace in CI).

## Why this repo exists

- **`crepuscularity-site/site.json`** — content for the static generator (hero + feature grid).
- **`site-tools`** — `expand-site-links` replaces `__TOKEN__` placeholders in the generated HTML with `<a>` tags (because `crepus web` HTML-escapes JSON strings).
- **`scripts/build-static.sh`** — clones `semitechnological/crepuscularity` @ `web-v3`, builds `crepus` with `--no-default-features` (Linux-friendly), emits **`dist/index.html`**.

## Build locally

Requirements: **Rust stable** recent enough for Crepuscularity’s vendored GPUI (typically **1.94+**), **Git**, **`rustup` optional** (the script prefers `rustup run stable cargo` when available).

```bash
./scripts/build-static.sh
# output: dist/index.html
```

Or manually:

```bash
cargo build --release -p site-tools
# clone crepuscularity web-v3, then:
/path/to/crepus web build --site crepuscularity-site -o dist/index.html
./target/release/expand-site-links dist/index.html
```

## GitHub Actions

`.github/workflows/deploy.yml` uploads **`dist/`** to GitHub Pages after the same steps.

## Historical note

Older Next.js sources lived in this repo previously; the live pipeline is **Rust-only** as described above. Legacy experiments remain under `old/` for reference only.
