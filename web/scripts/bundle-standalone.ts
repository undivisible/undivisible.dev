/**
 * Inline a prerendered route into one self-contained HTML file.
 *
 * Used to share a layout study as a single link — stylesheet, client bundle,
 * fonts and images all folded into the document, so it renders anywhere
 * without the rest of `out/`. Not part of the site build.
 *
 *   bun run scripts/bundle-standalone.ts lab/ledger out/standalone/ledger.html
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const projectDir = resolve(import.meta.dir, "..");
const outDir = join(projectDir, "out");

const [route, target] = process.argv.slice(2);
if (!route || !target) {
  throw new Error("usage: bundle-standalone.ts <route> <target.html>");
}

const asset = (url: string) => join(outDir, url.replace(/^\//, ""));

async function dataUri(url: string, mime: string): Promise<string> {
  const bytes = await readFile(asset(url));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

/** Fold every url(/fonts/*.woff2) in a stylesheet into the document. */
async function inlineFonts(css: string): Promise<string> {
  const urls = [
    ...new Set([...css.matchAll(/url\((\/fonts\/[^)]+)\)/g)].map((m) => m[1]!)),
  ];
  let out = css;
  for (const url of urls) {
    const uri = await dataUri(url, "font/woff2");
    out = out.replaceAll(url, () => uri);
  }
  return out;
}

let html = await readFile(join(outDir, route, "index.html"), "utf8");

// stylesheet → <style>
const cssHref = html.match(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/);
if (cssHref) {
  const css = await inlineFonts(await readFile(asset(cssHref[1]!), "utf8"));
  // Function replacers throughout: `$&` and friends are live in a replacement
  // string, and both minified JS and base64 payloads contain them.
  html = html.replace(cssHref[0], () => `<style>${css}</style>`);
}

// the font-variable block carries the @font-face rules
html = await inlineFonts(html);

// Client module → inline module. The site build splits shared code into
// sibling chunks, which cannot be inlined, so the entry is recompiled here as
// a single file.
const script = html.match(/<script type="module" src="([^"]+)"><\/script>/);
if (script) {
  const entry = join(
    projectDir,
    "src/client",
    `${route.replace("/", "-")}.tsx`,
  );
  const built = await Bun.build({
    entrypoints: [entry],
    target: "browser",
    format: "esm",
    splitting: false,
    minify: true,
    // Same substitutions as the site build; without them the bundle keeps a
    // bare `process` reference and dies on load.
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
      ...Object.fromEntries(
        [
          "NEXT_PUBLIC_LASTFM_API_KEY",
          "NEXT_PUBLIC_LASTFM_USERNAME",
          "NEXT_PUBLIC_NOW_STATUS_URL",
          "NEXT_PUBLIC_PROFILE_README_URL",
          "NEXT_PUBLIC_RESUME_MARKDOWN_URL",
        ].map((name) => [
          `process.env.${name}`,
          process.env[name] === undefined
            ? "undefined"
            : JSON.stringify(process.env[name]),
        ]),
      ),
    },
  });
  if (!built.success) {
    throw new Error(built.logs.map(String).join("\n"));
  }
  const code = await built.outputs[0]!.text();
  const safe = code.replaceAll("</script", "<\\/script");
  html = html.replace(
    script[0],
    () => `<script type="module">${safe}</script>`,
  );
}

// preload of a now-inlined font is dead weight
html = html.replace(/<link rel="preload"[^>]*\/?>/g, "");

// images referenced from the page and from the reference-card data
for (const [url, mime] of [
  ["/refs/terry-davis.jpg", "image/jpeg"],
  ["/favicon.svg", "image/svg+xml"],
] as const) {
  if (!html.includes(url)) continue;
  const uri = await dataUri(url, mime);
  html = html.replaceAll(url, () => uri);
}

// `--fragment` emits head-and-body content only, mounted on its own element
// rather than on document.body, so the file can be embedded in a host page.
if (process.argv.includes("--fragment")) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "";
  const shell = `${head.replace(/<meta[^>]*charSet[^>]*>|<meta charset[^>]*>/gi, "")}<div id="lab-mount">${body}</div>`;
  // the bundle is minified, so the import alias in front of hydrateRoot varies
  html = shell.replace(
    /hydrateRoot\(document\.body,/,
    () => 'hydrateRoot(document.getElementById("lab-mount"),',
  );
  if (!html.includes('getElementById("lab-mount")')) {
    throw new Error("could not repoint hydration off document.body");
  }
}

await mkdir(dirname(target), { recursive: true });
await writeFile(target, html);
console.log(`${route} → ${target} (${(html.length / 1024).toFixed(0)} KB)`);
