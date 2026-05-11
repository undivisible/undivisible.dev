# undivisible.dev

The Next.js site reads profile project lists from [`now.md`](https://github.com/undivisible/undivisible/blob/main/now.md) on `undivisible/undivisible` (same Markdown shape as the old README). If `now.md` is missing, sync and runtime fetch fall back to `README.md` on that repo. Set `PROFILE_README_URL` to override the raw URL when syncing or running locally.

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
