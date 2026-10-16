# undivisible.dev web

Moonshine, React 19, UnoCSS and Bun prerender the site to static HTML.

- `/` and `/lab/` — boot the full-screen Alpenglow browser desktop. Startup errors or 12 seconds without readiness fall back to `/main/`.
- `/main/` — the regular animated portfolio. Startup errors or 5 seconds without hydration fall back to `/simple/`.
- `/simple/` — the static profile and eight curated projects. No JavaScript required. Monospace typography and album-derived colors, with `#ff5705` as the offline fallback.
- `/agent` — direct links to the public Markdown snapshots.

Choosing OS, Main or Simple remembers the choice in local storage, bypasses fallback checks for that mode, while `/` always starts the OS. Only required first-party application assets trigger resource-error fallback; blocked analytics and optional album theming are ignored.

`NEXT_PUBLIC_LASTFM_USERNAME` and `NEXT_PUBLIC_LASTFM_API_KEY` in the repository-root `.env` enable live album-art colors. The browser refreshes every minute and on returning to the tab. The latest scrobbled album is used when playback is inactive. Eight distinct artwork swatches drive Main and the archived pre-redesign sky/ASCII renderer, including its original opaque WebGL blending and day palettes; five validated colors also theme Simple, host controls and the guest framebuffer palette. Track title, artist and accurate listening/last-played status appear under the name in Main and the native guest card, and on Simple. On desktop, Main replaces Unicode field cells with the actual profile text and builds the name from block characters in the same canvas. The view waits for its self-hosted fonts before revealing content. Transparent semantic HTML preserves links, focus and text selection; mobile and reduced-motion views retain visible HTML. Main places live HKG/KUL, MEL, NYC and TYO clocks plus a final LOCAL row from the visitor browser timezone when it is not already one of those cities under the left wordmark, with Hong Kong weather, clock links, wheel scrubbing with leave-to-reset, and the current-status article. New York uses its IANA timezone so daylight-saving changes follow the selected date. Simple assigns all eight artwork swatches to contrast-safe heading, link, label and supporting roles. Music and palette changes fade in; reduced-motion browsers skip web transitions. The OS shows live keycaps for Esc, Tab and Ctrl+C and a boot-only bars indicator; the original desktop wallpaper geometry stays intact. Window close controls have a shared 32×28 target that takes precedence over titlebar dragging. Music/artwork failures retain the last usable colors.

Selected project copy is curated in `src/data/profile.ts`; the full portfolio is reviewed in root `projects.md`. The résumé sync scripts read the published `undivisible/undivisible/resume.md`. `RESUME_MARKDOWN_URL` can pin an approved source; a code-only release may preserve the exact current public résumé while a separate copy update remains pending. Public résumé, agent files and offline copies must all use that same approved content. Do not silently publish a local draft.

## Commands

| Command                           | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `bun run build`                   | Sync public content, then prerender `out/`      |
| `bun run scripts/build-static.ts` | Prerender using already prepared public content |
| `bun run serve`                   | Serve `out/`; `PORT` defaults to 4321           |
| `bun test`                        | Tests                                           |
| `bun run typecheck`               | TypeScript; also the lint gate                  |
| `bun run format`                  | Prettier check                                  |

## Styling and rendering

`uno.config.ts` owns utility generation and the shared font theme. `src/index.css`
imports feature styles from `src/styles/`; common layout declarations use UnoCSS
`@apply`. Gradients, keyframes, print rules and canvas states remain explicit CSS.
`styles/studies.css` preserves the retired layout studies without shipping them.
`scripts/build-css.ts` compiles directives and utilities, then minifies and hashes
one static stylesheet. There is no CSS engine in the browser.

`src/lib/visuals/` separates the hidden artwork shader and DOM-to-character layout.
The hidden shader renders one pixel per character cell, and a single animation
loop repaints the visible field. Decorative frames are capped at 15 fps; content,
focus and clock changes repaint without waiting for that interval. The sky stays
at normal brightness and uses a 1× backing buffer, separate from the text canvas.
Contrast sampling lives in `hooks/use-sky-contrast.ts` and pauses in hidden tabs.

## Internal Nexnet

The same Worker serves `/v1/*` through a SQLite-backed Durable Object. Static
files continue through the assets binding. Preview and production each have their
own Worker, storage, origin and WebAuthn RP ID. This uses Nexnet's existing signed
protocol and a persistent site-backed authority, not its future consensus chain.
See [the integration notes](os-image/NEXNET.md) for storage, passkeys and ownership.

Local Worker development: `bun run dev:worker`, then open `http://localhost:8790`.
Browser integration checks use an isolated browser and virtual authenticator:
`python3 tests/nexnet-browser.py http://localhost:8790` (Playwright tooling required).
The test refuses production and never registers a real user's passkey.

## Linux image

`public/v86/` contains the committed kernel, initramfs, emulator, BIOS and WebAssembly files. The existing i686 Alpenglow kernel boots a Zig framebuffer desktop (`os-image/de/`) and packaged offline pages. Ordinary site releases do not need the full `scripts/build-de.sh` desktop rebuild.

After a static build, run `bun run scripts/bake-os-content.ts`, then `sh scripts/build-os-initramfs.sh`. The latter repacks the upstream initramfs with the overlay and calls `prepare-os-web.ts` to use the static profile for both Home and Simple with guest-local stylesheet and navigation URLs. The guest has no network. Its `web` app opens NetSurf; `links` is the smaller fallback. The host browser escape control returns to the desktop.

Type `nexnet` in the desktop launcher to open the Nexnet terminal chat. It reads Updates and Public chat from a gateway and lets you create an identity, sign in and post; set `NEXT_PUBLIC_NEXNET_GATEWAY_URL` at build time only to override the internal same-origin gateway (an empty string disables it). Press q outside the editor or Ctrl+C to return to the desktop. See [the bridge, provenance and gateway notes](os-image/NEXNET.md).

## Deployment

`wrangler.production.jsonc` deploys `out/` to Worker `undivisible` in the personal Cloudflare account, serving `undivisible.dev/*`. `wrangler.jsonc` remains the separate `undivisible-next` preview at `next.undivisible.dev`.

For a code-only release preserve the currently approved public Markdown snapshots
and use `SITE_URL=https://undivisible.dev bun run scripts/build-static.ts`. A full
content refresh remains `SITE_URL=https://undivisible.dev bun run build`.

Deploy preview with `bunx wrangler deploy --config wrangler.jsonc`. Validate sign-in,
posting and passkeys there before approving authentication changes for production.

Production: prepare the static output, then `bunx wrangler deploy --config wrangler.production.jsonc`. Rebuild the native desktop and initramfs when their inputs change. Roll back with `bunx wrangler rollback <previous-version-id> --config wrangler.production.jsonc`.

Kernel and initramfs URLs revalidate on every load. Hashed `/assets/` files are immutable. BIOS/emulator/WebAssembly caches stay unchanged when those files stay unchanged. Check live headers and verify the image after a release.

The browser desktop is Undesk, a Zig framebuffer compositor. Latest Alpenglowed upstream checked on 15 October 2026: `c386c6cf4c1191f39b1e0a6a7ad55835ab17f464`. It uses Wayland and Vulkan/GLES; its integration into this i686 v86 image is not implemented.
