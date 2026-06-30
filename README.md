# undivisible.dev

Profile and CV markdown live on [`undivisible/undivisible`](https://github.com/undivisible/undivisible). This repo does not author those files; `web` sync scripts fetch raw GitHub URLs at build time and write deploy copies under `web/public/`.

| Upstream file | Role |
|---------------|------|
| [`README.md`](https://github.com/undivisible/undivisible/blob/main/README.md) | **Project list** and portfolio sections parsed into the site (`parseReadme` / `readme-projects.generated.ts`). |
| [`now.md`](https://github.com/undivisible/undivisible/blob/main/now.md) | **Now status** (short line; optional `---` + article). Clock overlay and `public/now.md` snapshot only—not the project list. |
| [`resume.md`](https://github.com/undivisible/undivisible/blob/main/resume.md) | CV, contact, experience. |

Override sync URLs with `PROFILE_README_URL` (project-list source) or `RESUME_MARKDOWN_URL` when syncing locally.

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
  - `nine/` - Next.js 16 source snapshot only (`src/`, `app/`, configs); no `public/` bundle

## Development

```bash
bun install
bun run dev
```

## Building

```bash
bun run build:web
```
