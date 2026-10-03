import { join, resolve } from "node:path";

const outDir = resolve(import.meta.dir, "..", "out");
const port = Number(process.env.PORT) || 4321;
// Match the production homepage redirect during local browser checks.
const linuxHomepage = (await Bun.file(join(outDir, "_redirects")).text())
  .split(/\r?\n/)
  .some((line) => /^\/\s+\/lab\/\s+302$/.test(line.trim()));

async function fileFor(pathname: string) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const candidates =
    clean === "/"
      ? ["index.html"]
      : [
          clean.slice(1),
          `${clean.slice(1)}.html`,
          `${clean.slice(1)}/index.html`,
        ];
  for (const candidate of candidates) {
    const file = Bun.file(join(outDir, candidate));
    if (await file.exists()) return file;
  }
  return null;
}

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    if (linuxHomepage && url.pathname === "/") {
      return Response.redirect(new URL("/lab/", url), 302);
    }
    const file = await fileFor(url.pathname);
    if (file) return new Response(file);
    const notFound = Bun.file(join(outDir, "404.html"));
    return new Response((await notFound.exists()) ? notFound : "Not found", {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
});

console.log(server.url.origin);
