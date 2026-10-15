# undivisible.dev web

Moonshine, React 19, Tailwind v4 and Bun prerender the site to static HTML.

- `/` and `/lab/` — boot the full-screen Alpenglow browser desktop. Startup errors or 12 seconds without readiness fall back to `/main/`.
- `/main/` — the regular animated portfolio. Startup errors or 5 seconds without hydration fall back to `/simple/`.
- `/simple/` — the static profile and eight curated projects. No JavaScript required. Zinc surfaces, monospace typography and `#ff5705` accents.
- `/agent` — direct links to the public Markdown snapshots.

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

## Linux image

`public/v86/` contains the committed kernel, initramfs, emulator, BIOS and WebAssembly files. The existing i686 Alpenglow kernel boots a Zig framebuffer desktop (`os-image/de/`) and packaged offline pages. Ordinary site releases do not need the full `scripts/build-de.sh` desktop rebuild.

After a static build, run `bun run scripts/bake-os-content.ts`, then `sh scripts/build-os-initramfs.sh`. The latter repacks the upstream initramfs with the overlay and calls `prepare-os-web.ts` to use the static profile for both Home and Simple with guest-local stylesheet and navigation URLs. The guest has no network. Its `web` app opens NetSurf; `links` is the smaller fallback. The host browser escape control returns to the desktop.

Type `nexnet` in the desktop launcher to open the Nexnet terminal chat. It reads Updates and Public chat from a gateway and lets you create an identity, sign in and post; set `NEXT_PUBLIC_NEXNET_GATEWAY_URL` at build time (unset means unconfigured and read/post stay off). Press q outside the editor or Ctrl+C to return to the desktop. See [the bridge, provenance and gateway notes](os-image/NEXNET.md).

## Deployment

`wrangler.production.jsonc` deploys `out/` to Worker `undivisible` in the personal Cloudflare account, serving `undivisible.dev/*`. `wrangler.jsonc` remains the separate `undivisible-next` preview at `next.undivisible.dev`.

Production: `SITE_URL=https://undivisible.dev bun run build`, then `bunx wrangler deploy --config wrangler.production.jsonc`. Rebuild the native desktop and initramfs when their inputs change. Roll back with `bunx wrangler rollback <previous-version-id> --config wrangler.production.jsonc`.

Kernel and initramfs URLs revalidate on every load. Hashed `/assets/` files are immutable. BIOS/emulator/WebAssembly caches stay unchanged when those files stay unchanged. Check live headers and verify the image after a release.

The browser desktop is Undesk, a Zig framebuffer compositor. Latest Alpenglowed upstream checked on 15 October 2026: `c386c6cf4c1191f39b1e0a6a7ad55835ab17f464`. It uses Wayland and Vulkan/GLES; its integration into this i686 v86 image is not implemented.
