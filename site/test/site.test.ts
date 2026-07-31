import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { normalizeReadmeBundle, parseReadme } from "../src/parse-readme";

const root = join(import.meta.dir, "..");

describe("undivisible moonshine site", () => {
  test("parses sample readme projects", () => {
    const md = `
## Projects
- **[moonshine](https://github.com/tschk/moonshine)** — hyperminimal UI runtime
- **[alpenglow](https://github.com/tschk/alpenglow)** — diskless linux
`;
    const bundle = normalizeReadmeBundle(parseReadme(md));
    expect(
      bundle.mainProjects.length + bundle.utilities.length,
    ).toBeGreaterThan(0);
  });

  test("client builds with moonshine + shaders", async () => {
    const genDir = join(root, "src/generated");
    if (!existsSync(join(genDir, "readme-projects.ts"))) {
      const procSync = Bun.spawn(["bun", "run", "scripts/sync-content.ts"], {
        cwd: root,
        stdout: "pipe",
        stderr: "pipe",
      });
      expect(await procSync.exited).toBe(0);
    }
    const proc = Bun.spawn(
      [
        "bun",
        "build",
        "./src/client.tsx",
        "--outdir=public",
        "--target=browser",
        "--format=esm",
      ],
      { cwd: root, stdout: "pipe", stderr: "pipe" },
    );
    const code = await proc.exited;
    const err = await new Response(proc.stderr).text();
    expect(code, err).toBe(0);
    const js = await Bun.file(join(root, "public/client.js")).text();
    expect(js.length).toBeGreaterThan(500);
    expect(js.toLowerCase()).toMatch(/moonshine|undivisible/);
  });

  test("server serves home, health, and static assets", async () => {
    const proc = Bun.spawn(["bun", "run", "src/server.ts"], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, PORT: "0" },
    });

    const reader = proc.stdout!.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let port: string | null = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const match = buf.match(/localhost:(\d+)/);
      if (match) {
        port = match[1]!;
        break;
      }
    }
    reader.releaseLock();
    expect(port, buf).not.toBeNull();

    try {
      const home = await fetch(`http://localhost:${port}/`);
      expect(home.status).toBe(200);
      const homeHtml = await home.text();
      expect(homeHtml).toMatch(/<!doctype html>/i);
      expect(homeHtml).toMatch(/client\.js/);

      const health = await fetch(`http://localhost:${port}/api/health`);
      expect(health.status).toBe(200);
      const healthJson = await health.json();
      expect(healthJson.ok).toBe(true);
      expect(healthJson.engine).toBe("moonshine");

      const css = await fetch(`http://localhost:${port}/site.css`);
      expect(css.status).toBe(200);

      const favicon = await fetch(`http://localhost:${port}/favicon.svg`);
      expect(favicon.status).toBe(200);

      const client = await fetch(`http://localhost:${port}/client.js`);
      expect(client.status).toBe(200);

      const notFound = await fetch(`http://localhost:${port}/nonexistent`);
      expect(notFound.status).toBe(404);
    } finally {
      proc.kill();
      await proc.exited;
    }
  });
});
