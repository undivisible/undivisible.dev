import { join } from "node:path";
import { createRequestHandler } from "@tschk/moonshine-server";
import { reactRenderer } from "@tschk/moonshine-react";
import { createBunServer } from "@tschk/moonshine-deploy-bun";
import type { RouteDefinition } from "@tschk/moonshine-framework";

const publicDir = join(import.meta.dir, "..", "public");

const routes: RouteDefinition[] = [
  { id: "home", path: "/", file: "home.tsx", mode: "spa" },
  { id: "health", path: "/api/health", file: "health.ts", mode: "api" },
];

function html(body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>undivisible</title>
  <meta name="description" content="undivisible — systems, compilers, interfaces. Made with moonshine." />
  <meta name="generator" content="moonshine" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/site.css" />
</head>
<body>
${body}
</body>
</html>`;
}

const SHELL = html(`
  <div id="app"></div>
  <noscript>
    <main style="font-family:system-ui;padding:2rem;max-width:40rem">
      <h1>undivisible</h1>
      <p>Enable JavaScript for the full site.</p>
      <p>Made with <a href="https://github.com/tschk/moonshine">moonshine</a>.</p>
    </main>
  </noscript>
  <script type="module" src="/client.js"></script>
`);

const handler = createRequestHandler({
  routes,
  renderer: reactRenderer,
  staticDir: publicDir,
  modules: {
    "home.tsx": {
      loader: async () => ({ shell: true }),
    },
    "health.ts": {
      loader: async () => ({ ok: true, engine: "moonshine" }),
    },
  },
  notFound: () =>
    new Response("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    }),
});

const port = process.env.PORT !== undefined ? Number(process.env.PORT) : 3000;

const server = createBunServer({
  fetch: async (request) => {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "GET" && pathname === "/") {
      return new Response(SHELL, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    if (pathname === "/api/health") {
      return Response.json({ ok: true, engine: "moonshine" });
    }

    return handler(request);
  },
  port,
  staticDir: publicDir,
});

console.log(
  `undivisible.dev (moonshine 0.3.1) → http://localhost:${server.port}`,
);
