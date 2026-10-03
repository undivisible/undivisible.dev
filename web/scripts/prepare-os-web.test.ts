import { expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { offlineHtml, prepareOfflineWeb } from "./prepare-os-web";

test("offline pages resolve navigation and styles inside the guest", () => {
  expect(
    offlineHtml(
      '<a href="/simple/">Simple</a><link href="/assets/site.css"><a href="https://example.com">External</a>',
    ),
  ).toBe(
    '<a href="file:///usr/share/undesk/web/simple/index.html">Simple</a><link href="file:///usr/share/undesk/web/assets/site.css"><a href="https://example.com">External</a>',
  );
});

test("offline package contains the simple page, CSS and published résumé without client JavaScript", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "undesk-offline-"));
  try {
    const source = join(temporary, "source");
    const destination = join(temporary, "guest");
    for (const folder of ["simple", "assets", "fonts"])
      await mkdir(join(source, folder), { recursive: true });
    for (const name of ["index.html", "agent.html", "simple/index.html"])
      await writeFile(
        join(source, name),
        '<link href="/assets/site.css"><a href="/">Home</a>',
      );
    for (const name of [
      "resume.md",
      "agent.md",
      "llms.txt",
      "llms-full.txt",
      "now.md",
      "favicon.svg",
    ])
      await writeFile(join(source, name), "published content\n");
    await writeFile(join(source, "assets/site.css"), "body { color: black; }");
    await writeFile(join(source, "assets/lab.js"), "not needed offline");
    await prepareOfflineWeb(source, destination);
    expect(
      await readFile(join(destination, "simple/index.html"), "utf8"),
    ).toContain("file:///usr/share/undesk/web/assets/site.css");
    expect(await readFile(join(destination, "resume.md"), "utf8")).toBe(
      "published content\n",
    );
    expect(await Bun.file(join(destination, "assets/site.css")).exists()).toBe(
      true,
    );
    expect(await Bun.file(join(destination, "assets/lab.js")).exists()).toBe(
      false,
    );
    expect(
      await readFile(join(destination, "lab/index.html"), "utf8"),
    ).toContain("already inside the Linux machine");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
