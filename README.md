# undivisible.dev

Static site built with **[Crepuscularity](https://github.com/semitechnological/crepuscularity)** **`crepus web build`** on branch **`web-v3`**.

## How it works (current upstream)

- **Source**: `crepuscularity-site/index.crepus` (and any other `*.crepus` you add).
- **Runtime**: `crepuscularity-site/runtime/` — wasm32 crate that calls `crepuscularity_web::render_bundle` (same pattern as `examples/web-site` and the repo’s **`docs-site/`**).
- **Optional `site.json`**: SEO (`title`, `description`) and **CSS variables** for the HTML shell only — **not** page structure. See [WEB_BUILD_MIGRATION.md](https://github.com/semitechnological/crepuscularity/blob/web-v3/docs/WEB_BUILD_MIGRATION.md) in Crepuscularity.
- **Output**: `dist/` contains `index.html`, `app.js`, `crepus-bundle.json`, `pkg/runtime*.wasm`, `vendor/unocss.js`, etc.

First paint is **`.crepus` → WASM** in the browser; open **`index.html` over HTTP** (GitHub Pages is fine). `file://` will fail `fetch` for the bundle.

## Prerequisites

- Rust **stable** (recent enough for Crepuscularity’s vendored GPUI, typically **1.94+**)
- `rustup target add wasm32-unknown-unknown --toolchain stable` (nested `cargo` inside `crepus` must see the same toolchain)
- `cargo install wasm-bindgen-cli`

## Build locally

```bash
./scripts/build-static.sh
```

Or, with a local clone of Crepuscularity at `$CREPUSCULARITY_DIR`:

```bash
CREPUSCULARITY_DIR=/path/to/crepuscularity ./scripts/build-static.sh
```

Preview:

```bash
cd dist && python3 -m http.server 8080
```

Dev loop (hot reload, no WASM):

```bash
# from a machine with crepus installed from the crepuscularity repo:
crepus web serve --site crepuscularity-site
```

## Legacy pipeline

The old **`site.json` → single HTML file** build still exists upstream as:

`crepus web build --legacy-site-json …`

This repo no longer uses it.

## Historical note

Older experiments live under `old/` and are not part of the build.
