# undivisible.dev

Personal website for Max Carter.

## Structure

- `src/` - Next.js 16 application
- `old/` - Previous versions of the site:
  - `one/` - HTML/CSS site
  - `two/` - HTML/CSS site
  - `three/` - HTML/CSS site  
  - `four/` - HTML/CSS site
  - `five/` - HTML/CSS site
  - `six/` - HTML/CSS site
  - `six.five/r1/` - Previous Next.js version
  - `seven/` - Rust/Leptos WASM site
  - `eight/` - Previous version with ASCII art

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

## Old Sites

Old versions are built and served at `/old/{name}.html` (e.g., `/old/eight.html`).

To rebuild all old sites:

```bash
npm run build:old
```
