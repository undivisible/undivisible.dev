# Agent notes — undivisible.dev

## Build pipeline

1. Clone or use **`semitechnological/crepuscularity`** branch **`web-v3`**.
2. Build CLI: `cargo build --release -p crepuscularity-cli --no-default-features`.
3. Run **`crepus web build --site crepuscularity-site --out-dir dist`**.
4. Requires **`wasm32-unknown-unknown`** and **`wasm-bindgen-cli`**.

Do **not** use `crepus web build -o index.html` without **`--legacy-site-json`** — that was the pre-WASM pipeline.

## Site layout

| Path | Role |
|------|------|
| `crepuscularity-site/index.crepus` | Page markup (primary source) |
| `crepuscularity-site/runtime/` | WASM shim → `render_bundle` |
| `crepuscularity-site/site.json` | Optional: `<head>` SEO + theme CSS vars only |
| `crepuscularity-site/web.toml` | Site metadata for `web.toml` merge |
| `dist/` | Build output (gitignored) |

## Reference upstream

- **Docs site** in Crepuscularity: `docs-site/` (also built with `crepus web build` — see their `.github/workflows/pages.yml`).
- **Migration doc**: `docs/WEB_BUILD_MIGRATION.md`
- **CLI doc**: `docs/cli.md` § Static web sites

## Editing copy

Change **`index.crepus`**. Use normal `.crepus` text nodes (`"..."`) and real `<a href="...">` tags where the HTML backend supports them (same as `docs-site/index.crepus`).
