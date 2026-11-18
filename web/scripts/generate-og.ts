import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const projectDir = resolve(import.meta.dir, "..");

async function snapshotArtwork(): Promise<ArrayBuffer | null> {
  try {
    const snapshot: unknown = await Bun.file(
      join(projectDir, "public/lastfm-recent.json"),
    ).json();
    if (!snapshot || typeof snapshot !== "object" || !("track" in snapshot))
      return null;
    const track = snapshot.track;
    if (
      !track ||
      typeof track !== "object" ||
      !("albumArt" in track) ||
      typeof track.albumArt !== "string"
    )
      return null;
    const url = new URL(track.albumArt);
    if (
      url.protocol !== "https:" ||
      !["lastfm-img.freetls.fastly.net", "lastfm.freetls.fastly.net"].includes(
        url.hostname,
      )
    )
      return null;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return response.ok ? await response.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function generateOgBanner({
  outDir,
  stylesheet,
  fallback = false,
}: {
  outDir: string;
  stylesheet: string;
  fallback?: boolean;
}) {
  const executable = Bun.which("agent-browser");
  if (!executable)
    throw new Error(
      "OG generation needs agent-browser and its Chromium installation; see web/README.md",
    );
  const result = await Bun.build({
    entrypoints: [join(projectDir, "src/client/og-banner.tsx")],
    target: "browser",
    format: "esm",
    minify: true,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
  });
  if (!result.success)
    throw new Error(`OG client build failed: ${result.logs.join("\n")}`);
  const bundle = result.outputs[0];
  if (!bundle) throw new Error("OG client bundle missing");
  const artwork = fallback ? null : await snapshotArtwork();
  const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/site.css"><style>
@font-face {font-family:"JetBrains Mono";font-style:normal;font-weight:100 800;src:url('/font.woff2') format('woff2');font-display:block}
:root {--font-jetbrains-mono:"JetBrains Mono"}
html,body,#banner {margin:0;width:1200px;height:630px;overflow:hidden;background:#0a0b0e}
.landing {width:1200px;height:630px;min-height:630px;display:block;font:30px/42px "JetBrains Mono",monospace}
.landing-content {position:absolute;top:210px;left:90px;width:1008px;margin:0;z-index:1}
.landing-content p {margin:0 0 42px}
.landing-field>div {position:relative;width:100%;height:100%}
.landing-field canvas {position:absolute;inset:0}
.landing-field canvas:first-child {visibility:hidden}
</style></head><body><div id="banner"></div><script type="module" src="/banner.js"></script></body></html>`;
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      switch (new URL(request.url).pathname) {
        case "/":
          return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        case "/banner.js":
          return new Response(bundle, {
            headers: { "Content-Type": "text/javascript" },
          });
        case "/site.css":
          return new Response(Bun.file(join(outDir, stylesheet)));
        case "/font.woff2":
          return new Response(
            Bun.file(
              join(
                projectDir,
                "public/fonts/jetbrains-mono-normal-latin.woff2",
              ),
            ),
          );
        case "/artwork":
          if (artwork) return new Response(artwork);
          break;
      }
      return new Response("Not found", { status: 404 });
    },
  });
  const session = `og-${process.pid}`;
  const run = async (args: string[]) => {
    const process = Bun.spawn([executable, "--session", session, ...args], {
      stdout: "pipe",
      stderr: "pipe",
      signal: AbortSignal.timeout(30000),
    });
    const [stdout, stderr, code] = await Promise.all([
      new Response(process.stdout).text(),
      new Response(process.stderr).text(),
      process.exited,
    ]);
    if (code !== 0)
      throw new Error(`OG browser ${args[0]} failed: ${stderr.trim()}`);
    return stdout.trim();
  };
  try {
    await run(["open", "about:blank"]);
    await run(["set", "viewport", "1200", "630", "2"]);
    await run(["set", "media", "dark", "reduced-motion"]);
    await run(["open", server.url.origin]);
    await run(["wait", "canvas[data-reveal-state=complete]"]);
    const encoded: unknown = JSON.parse(
      await run([
        "eval",
        `(() => {
      const page = document.querySelector('.landing');
      const source = document.querySelector('canvas[data-reveal-state=complete]');
      const field = document.querySelector('canvas');
      if (!document.fonts.check('30px "JetBrains Mono"') || source.dataset.contentCells !== '61' || field.width !== 67 || field.height !== 15)
        throw new Error('OG font, content or selected grid did not render');
      if (![...document.querySelectorAll('main p')].every(p => getComputedStyle(p).color === 'rgba(0, 0, 0, 0)'))
        throw new Error('OG text must be composed into the canvas');
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 630;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = getComputedStyle(page).backgroundColor;
      ctx.fillRect(0, 0, 1200, 630);
      ctx.drawImage(source, 0, 0, 1200, 630);
      return canvas.toDataURL('image/png');
    })()`,
      ]),
    );
    const prefix = "data:image/png;base64,";
    if (typeof encoded !== "string" || !encoded.startsWith(prefix))
      throw new Error("OG PNG export failed");
    const bytes = Buffer.from(encoded.slice(prefix.length), "base64");
    await mkdir(join(outDir, "og"), { recursive: true });
    await Bun.write(join(outDir, "og/home.png"), bytes);
    console.log(
      `OG banner: 1200×630, ${bytes.length} bytes, sha256=${new Bun.CryptoHasher("sha256").update(bytes).digest("hex")}`,
    );
  } finally {
    await run(["close"]).catch(() => {});
    await server.stop(true);
  }
}

if (import.meta.main) {
  const outDir = join(projectDir, "out");
  const stylesheet = [...new Bun.Glob("assets/site-*.css").scanSync(outDir)][0];
  if (!stylesheet)
    throw new Error("Build the site before generating an OG banner");
  await generateOgBanner({
    outDir,
    stylesheet,
    fallback: process.argv.includes("--fallback"),
  });
}
