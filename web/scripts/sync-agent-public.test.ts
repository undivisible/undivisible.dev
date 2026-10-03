import { expect, test } from "bun:test";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

test("sync-agent-public writes fetchable markdown without changing deploy content", async () => {
  const pub = await mkdtemp(path.join(tmpdir(), "site-agent-test-"));
  try {
    const now = path.join(pub, "input-now.md");
    const resume = path.join(pub, "input-resume.md");
    await Bun.write(now, "Working on software.");
    await Bun.write(resume, "# Test résumé\n\nTest experience and contact.");
    const proc = Bun.spawn({
      cmd: [
        "bun",
        "run",
        path.join(import.meta.dirname, "sync-agent-public.ts"),
      ],
      cwd: path.join(import.meta.dirname, ".."),
      env: {
        ...process.env,
        SITE_URL: "https://example.test",
        AGENT_PUBLIC_DIR: pub,
        NOW_MARKDOWN_URL: pathToFileURL(now).href,
        RESUME_MARKDOWN_URL: pathToFileURL(resume).href,
      },
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await proc.exited).toBe(0);
    for (const name of [
      "resume.md",
      "llms.txt",
      "llms-full.txt",
      "agent.md",
      "robots.txt",
    ]) {
      expect(
        (await Bun.file(path.join(pub, name)).text()).length,
      ).toBeGreaterThan(10);
    }
    const llms = await Bun.file(path.join(pub, "llms.txt")).text();
    expect(llms).toContain("https://example.test/now.md");
    expect(llms).toContain("Cloudflare Workers");
    expect(llms).not.toContain("GitHub Pages");
    const agent = await Bun.file(path.join(pub, "agent.md")).text();
    expect(agent).toContain("https://example.test/simple/");
    expect(agent).not.toContain("GitHub Pages");
    expect(await Bun.file(path.join(pub, "llms-full.txt")).text()).toContain(
      "# Test résumé",
    );
  } finally {
    await rm(pub, { recursive: true, force: true });
  }
});
