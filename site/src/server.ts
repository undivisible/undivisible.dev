import { join } from "node:path";
import { createMoonshineServer, definePage } from "@tschk/moonshine/server";

const publicDir = join(import.meta.dir, "..", "public");

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

const server = createMoonshineServer({
  port: Number(process.env.PORT) || 3000,
  staticDir: publicDir,
  pages: {
    "/": definePage({
      render: () =>
        html(`
  <div id="app"></div>
  <noscript>
    <main style="font-family:system-ui;padding:2rem;max-width:40rem">
      <h1>undivisible</h1>
      <p>Enable JavaScript for the full site.</p>
      <p>Made with <a href="https://github.com/tschk/moonshine">moonshine</a>.</p>
    </main>
  </noscript>
  <script type="module" src="/client.js"></script>
`),
    }),
    "/api/health": definePage({
      render: () => ({ ok: true, engine: "moonshine" }),
    }),
  },
});

const handle = server.listen() as { port?: number };
console.log(`undivisible.dev (moonshine) → http://localhost:${handle?.port ?? server.port}`);
