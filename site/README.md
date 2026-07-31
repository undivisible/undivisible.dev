# undivisible.dev (moonshine)

Personal site rewritten on **[moonshine 0.3.1](https://github.com/tschk/moonshine)** —
Bun HTTP, signals, and WebGL shaders. No Next.js runtime.

```bash
cd site
bun install
bun run dev
# → http://localhost:3000
```

| Piece | Tech |
|-------|------|
| HTTP + static | `@tschk/moonshine-deploy-bun` (`createBunServer`) |
| Request pipeline | `@tschk/moonshine-server` (`createRequestHandler`) |
| Route definitions | `@tschk/moonshine-framework` (`RouteDefinition`) |
| Renderer | `@tschk/moonshine-react` (`reactRenderer`) |
| UI + count/list state | `@tschk/moonshine/react` (`createApp`, `createSignal`, `useSignal`) |
| Sky background | `@tschk/moonshine-shaders` (`useFragmentShader`) |
| Projects | synced from `undivisible/undivisible` README |

Routes: `/` (SPA shell), `/api/health` (API). Footer credits **made with moonshine**.

Legacy Next app remains under `web/` until cutover.
