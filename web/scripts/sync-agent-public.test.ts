import { expect, test } from "bun:test";
import path from "node:path";

test("sync-agent-public writes fetchable markdown under public/", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", path.join(import.meta.dirname, "sync-agent-public.ts")],
    cwd: path.join(import.meta.dirname, ".."),
    env: { ...process.env, SITE_URL: "https://example.test" },
    stdout: "pipe",
    stderr: "pipe",
  });
  const code = await proc.exited;
  expect(code).toBe(0);

  const pub = path.join(import.meta.dirname, "../public");
  for (const name of ["resume.md", "llms.txt", "agent.md", "robots.txt"]) {
    const text = await Bun.file(path.join(pub, name)).text();
    expect(text.length).toBeGreaterThan(10);
  }
  const llms = await Bun.file(path.join(pub, "llms.txt")).text();
  expect(llms).toContain("https://example.test/now.md");
});
