import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function buildOgPage({
  outDir,
  stylesheet,
  entry,
}: {
  outDir: string;
  stylesheet: string;
  entry: string;
}) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="stylesheet" href="${stylesheet}"><style>
@font-face {font-family:"JetBrains Mono";font-style:normal;font-weight:100 800;src:url('/fonts/jetbrains-mono-normal-latin.woff2') format('woff2');font-display:block}
:root {--font-jetbrains-mono:"JetBrains Mono"}
html,body,#banner {margin:0;width:1200px;height:630px;overflow:hidden;background:#0a0b0e}
.landing {width:1200px;height:630px;min-height:630px;display:block;font:30px/42px "JetBrains Mono",monospace}
.landing-content {position:absolute;top:210px;left:90px;width:1008px;margin:0;z-index:1}
.landing-content p {margin:0 0 42px}
.landing-field>div {position:relative;width:100%;height:100%}
.landing-field canvas {position:absolute;inset:0}
.landing-field canvas:first-child {visibility:hidden}
</style></head><body><div id="banner"></div><script type="module" src="${entry}"></script></body></html>`;
  await mkdir(join(outDir, "og"), { recursive: true });
  await Bun.write(join(outDir, "og/render.html"), html);
}
