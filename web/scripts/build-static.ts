import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import {
  analyzeModule,
  classifyRoute,
  discoverRoutes,
  type RouteConvention,
} from "@tschk/moonshine-compiler";
import {
  MANIFEST_VERSION,
  type MoonshineManifest,
  type RouteArtifact,
} from "@tschk/moonshine-framework";
import { createStaticRenderer } from "@/moonshine/renderer";
import type { Metadata } from "@/moonshine/next";
import config from "../moonshine.config";

const projectDir = resolve(import.meta.dir, "..");
const rootDir = resolve(projectDir, "..");
const outDir = join(projectDir, "out");
const assetsDir = join(outDir, "assets");
const moonshineDir = join(projectDir, ".moonshine");

const PUBLIC_ENV = [
  "NEXT_PUBLIC_LASTFM_API_KEY",
  "NEXT_PUBLIC_LASTFM_USERNAME",
  "NEXT_PUBLIC_NOW_STATUS_URL",
  "NEXT_PUBLIC_PROFILE_README_URL",
  "NEXT_PUBLIC_RESUME_MARKDOWN_URL",
] as const;

async function loadRootEnv(): Promise<void> {
  let text: string;
  try {
    text = await readFile(join(rootDir, ".env"), "utf8");
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    if (process.env[name] !== undefined) continue;
    process.env[name] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
}

function clientDefine(): Record<string, string> {
  const define: Record<string, string> = {
    "process.env.NODE_ENV": JSON.stringify("production"),
  };
  for (const name of PUBLIC_ENV) {
    const value = process.env[name];
    define[`process.env.${name}`] =
      value === undefined ? "undefined" : JSON.stringify(value);
  }
  return define;
}

type ClientEntry = { name: string; entry: string };

const CLIENT_ENTRIES: ClientEntry[] = [
  { name: "home", entry: join(projectDir, "src/client/home.tsx") },
  { name: "not-found", entry: join(projectDir, "src/client/not-found.tsx") },
  { name: "lab", entry: join(projectDir, "src/client/lab.tsx") },
];

async function buildClient(): Promise<Record<string, string>> {
  const result = await Bun.build({
    entrypoints: CLIENT_ENTRIES.map((e) => e.entry),
    outdir: assetsDir,
    target: "browser",
    format: "esm",
    splitting: true,
    minify: true,
    sourcemap: "none",
    naming: {
      entry: "[dir]/[name]-[hash].[ext]",
      chunk: "[name]-[hash].[ext]",
    },
    define: clientDefine(),
  });
  if (!result.success) {
    throw new Error(
      `client build failed:\n${result.logs.map((log) => String(log)).join("\n")}`,
    );
  }
  const byName: Record<string, string> = {};
  for (const output of result.outputs) {
    if (output.kind !== "entry-point") continue;
    const file = output.path.split("/").pop()!;
    const name = file.replace(/-[^-]+\.js$/, "");
    byName[name] = `/assets/${file}`;
  }
  for (const { name } of CLIENT_ENTRIES) {
    if (!byName[name]) throw new Error(`missing client entry output: ${name}`);
  }
  return byName;
}

async function buildCss(): Promise<string> {
  const target = join(assetsDir, "site.css");
  const proc = Bun.spawn(
    [
      "bunx",
      "@tailwindcss/cli",
      "--input",
      join(projectDir, "src/index.css"),
      "--output",
      target,
      "--minify",
    ],
    { cwd: projectDir, stdout: "inherit", stderr: "inherit" },
  );
  const code = await proc.exited;
  if (code !== 0) throw new Error(`tailwind build failed with code ${code}`);
  const bytes = await Bun.file(target).bytes();
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(bytes);
  const hash = hasher.digest("hex").slice(0, 8);
  const hashed = join(assetsDir, `site-${hash}.css`);
  await Bun.write(hashed, bytes);
  await rm(target);
  return `/assets/site-${hash}.css`;
}

function toArtifact(
  route: { id: string; path: string; file: string; layouts?: string[] },
  clientEntry: string | undefined,
  staticOutput: string,
): RouteArtifact {
  const facts = analyzeModule(route.file);
  const decision = classifyRoute({ facts });
  return {
    ...route,
    mode: clientEntry ? "island" : "static",
    runtime: config.runtime as RouteArtifact["runtime"],
    decision: clientEntry
      ? "hydrated client boundary below the route root"
      : decision.reason,
    clientEntries: clientEntry ? [clientEntry] : [],
    staticOutput,
  };
}

async function metadataOf(file: string): Promise<Metadata> {
  const mod = (await import(file)) as { metadata?: Metadata };
  return mod.metadata ?? {};
}

async function main(): Promise<void> {
  await loadRootEnv();
  await rm(outDir, { recursive: true, force: true });
  await mkdir(assetsDir, { recursive: true });

  const discovered = await discoverRoutes({
    routesDir: join(projectDir, config.routesDir),
    convention: config.convention as RouteConvention,
  });

  const clientBundles = await buildClient();
  const stylesheet = await buildCss();

  const layoutFile = join(projectDir, config.routesDir, "layout.tsx");
  const layout = (await import(layoutFile)) as {
    fontVariableCss: string;
    metadata?: Metadata;
  };

  const notFoundRoute = {
    id: "not-found",
    path: "/404",
    file: join(projectDir, config.routesDir, "not-found.tsx"),
    layouts: [layoutFile],
  };

  const entryForRoute: Record<string, string | undefined> = {
    index: clientBundles.home,
    agent: undefined,
    "not-found": clientBundles["not-found"],
  };

  const outputForRoute: Record<string, string> = {
    index: "index.html",
    agent: "agent.html",
    "not-found": "404.html",
    lab: "lab/index.html",
  };

  entryForRoute.lab = clientBundles.lab;

  const routes: RouteArtifact[] = [];
  for (const route of [...discovered, notFoundRoute]) {
    routes.push(
      toArtifact(
        route,
        entryForRoute[route.id],
        outputForRoute[route.id] ?? `${route.id}.html`,
      ),
    );
  }

  const metadata: Record<string, Metadata> = {
    root: layout.metadata ?? {},
  };
  for (const route of routes) {
    metadata[route.id] = await metadataOf(route.file);
  }
  metadata["not-found"] = { ...metadata.root, robots: "noindex" };

  const clientEntries: Record<string, string> = {};
  for (const route of routes) {
    const entry = entryForRoute[route.id];
    if (entry) clientEntries[route.id] = entry;
  }

  const renderer = createStaticRenderer({
    lang: "en",
    fontVariableCss: layout.fontVariableCss,
    stylesheet,
    clientEntries,
    metadata,
  });

  for (const route of routes) {
    const controller = new AbortController();
    const html = await renderer.prerender({
      request: new Request(`https://undivisible.dev${route.path}`),
      route,
      params: {},
      data: undefined,
      signal: controller.signal,
    });
    const target = join(outDir, route.staticOutput!);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
  }

  await cp(join(projectDir, "public"), outDir, { recursive: true });

  const manifest: MoonshineManifest = {
    version: MANIFEST_VERSION,
    frameworkVersion: (
      await Bun.file(
        join(
          projectDir,
          "node_modules/@tschk/moonshine-framework/package.json",
        ),
      ).json()
    ).version,
    routes: routes.map((route) => ({
      ...route,
      file: relative(projectDir, route.file),
      ...(route.layouts && {
        layouts: route.layouts.map((l) => relative(projectDir, l)),
      }),
    })),
    assets: [],
    entries: {},
    capabilities: ["islands", "streaming"],
  };
  await mkdir(moonshineDir, { recursive: true });
  await writeFile(
    join(moonshineDir, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  console.log(
    `Prerendered ${routes.length} routes into web/out (${routes
      .map((r) => r.staticOutput)
      .join(", ")})`,
  );
}

await main();
