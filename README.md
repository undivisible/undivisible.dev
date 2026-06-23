# undivisible.dev

Profile and CV markdown live on [`undivisible/undivisible`](https://github.com/undivisible/undivisible): [`now.md`](https://github.com/undivisible/undivisible/blob/main/now.md) (project list; falls back to `README.md` if missing) and [`resume.md`](https://github.com/undivisible/undivisible/blob/main/resume.md) (CV and contact). This repo does not author those files; `web` sync scripts fetch raw GitHub URLs at build time and write deploy copies under `web/public/`. Override with `PROFILE_README_URL` or `RESUME_MARKDOWN_URL` when syncing locally.

## Structure

- `web/` - Next.js 16 application (current site); see `web/README.md` for shipped features and env vars
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
  - `nine/` - Next.js 16 app snapshot (same layout as `web/` at archive time; not wired in turbo)

## Development

```bash
bun install
bun run dev
```

## Building

```bash
bun run build:web
```
