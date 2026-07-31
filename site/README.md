# undivisible.dev (moonshine)

Personal site rewritten on **[moonshine](https://github.com/tschk/moonshine)** —
Bun HTTP, signals, and WebGL shaders. No Next.js runtime.

```bash
cd site
bun install
bun run dev
# → http://localhost:3000
```

| Piece | Tech |
|-------|------|
| HTTP + static | `@tschk/moonshine/server` |
| UI + count/list state | `@tschk/moonshine/react` |
| Sky background | `@tschk/moonshine-shaders` (`useFragmentShader`) |
| Projects | synced from `undivisible/undivisible` README |

Footer credits **made with moonshine**.

Legacy Next app remains under `web/` until cutover.
