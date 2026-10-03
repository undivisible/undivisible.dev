# undivisible.dev web

Moonshine, React 19, Tailwind v4 and Bun prerender the site to static HTML.

- `/` — redirects to `/lab/`, the primary Alpenglow Linux experience.
- `/simple/` — profile and six curated projects in the existing dark terminal palette and monospace type; no application JavaScript.
- `/lab/` — automatically boots the existing Alpenglow Linux desktop with v86. Stop releases the emulator and pending download; Start machine restarts after Stop. Simple version and résumé remain available during boot and while running. Startup failure and disabled JavaScript offer a static fallback. The machine uses about 512 MB.
- `/agent` — direct links to the public Markdown snapshots.

Project copy is curated in `src/data/profile.ts`. The résumé sync scripts normally read `undivisible/undivisible/resume.md`. `RESUME_MARKDOWN_URL` can pin an approved source; a code-only release may preserve the exact current public résumé while a separate copy update remains pending. Public résumé, agent files and offline copies must all use that same approved content. Do not silently publish a local draft.

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

After a static build, run `bun run scripts/bake-os-content.ts`, then `sh scripts/build-os-initramfs.sh`. The latter repacks the upstream initramfs with the overlay and calls `prepare-os-web.ts` to include main/simple pages with guest-local stylesheet and navigation URLs. The guest has no network. Its `web` app opens NetSurf; `links` is the smaller fallback. The host browser escape control returns to the desktop.

Type `nexnet` in the desktop launcher to open the native offline Updates/Public chat shell. It is not signed in; Updates is read-only and a Public chat draft cannot be submitted. Press q outside the editor or Ctrl+C to return to the desktop. See [binary provenance and console limits](os-image/NEXNET.md). No wrapper replaces `/usr/bin/nexnet`.

## Deployment

`wrangler.jsonc` owns only Worker `undivisible-next` and its existing custom domain `next.undivisible.dev`; assets come from `out/`. Confirm the personal Cloudflare account and reviewed source before `wrangler deploy`. The apex site has a separate config in `old/9.1`.

Kernel and initramfs URLs revalidate on every load. Hashed `/assets/` files are immutable. BIOS/emulator/WebAssembly caches stay unchanged when those files stay unchanged. Check live headers and verify the image after a release.
