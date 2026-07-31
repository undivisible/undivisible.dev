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
});
