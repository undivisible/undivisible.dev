import { expect, test } from "bun:test";
import { copyFile, mkdir, mkdtemp, symlink } from "node:fs/promises";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const markdown = `# Projects

## Libraries

- **[public-fixture](https://github.com/fixture/public-fixture)** — Fresh curated copy.
- **[private-fixture](https://github.com/fixture/private-fixture)** — Private copy must disappear.
`;

async function fixture(
  script: string,
  failure = "",
  input = markdown,
  fetchedAt = Date.now(),
) {
  const backup = join(root, ".amp/in/orb-backup");
  await mkdir(backup, { recursive: true });
  const dir = await mkdtemp(join(backup, "portfolio-sync-"));
  const scripts = join(dir, "web/scripts");
  await mkdir(scripts, { recursive: true });
  await mkdir(join(dir, "web/src/data"), { recursive: true });
  await symlink(join(root, "web/src/lib"), join(dir, "web/src/lib"));
  await Bun.write(
    join(dir, "web/src/data/readme-projects.generated.ts"),
    `
export const landingProjectsFromReadme = [
  { href: "https://cached.example.test/", github: { repository: "fixture/cached", languages: { Rust: 98765 } } },
  { href: "https://github.com/fixture/deleted", github: { repository: "fixture/deleted", languages: { Rust: 111 } } }
];
export const githubLanguagesFetchedAt = { "fixture/cached": ${fetchedAt}, "fixture/deleted": ${fetchedAt} };
`,
  );
  for (const name of [script, "fetch-resume-markdown.ts"]) {
    await copyFile(join(import.meta.dirname, name), join(scripts, name));
  }
  await Bun.write(join(dir, "projects.md"), input);
  await Bun.write(
    join(dir, "web/tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        baseUrl: join(root, "web"),
        paths: { "@/*": ["./src/*"] },
      },
    }),
  );
  const preload = join(dir, "preload.ts");
  await Bun.write(
    preload,
    `
const write = Bun.write;
Bun.write = (target, ...args) => {
  if (String(target).endsWith("readme-projects.generated.ts")) target = ${JSON.stringify(join(dir, "output.ts"))};
  return write(target, ...args);
};
globalThis.fetch = async (input, options) => {
  const url = String(input);
  const headers = new Headers(options?.headers);
  if (headers.has("Authorization") || headers.has("Cookie")) throw new Error("Authenticated portfolio request");
  if (url.includes("api.github.com")) {
    if (!url.endsWith("/languages")) throw new Error("Repository discovery forbidden");
    if (${JSON.stringify(failure)} === "languages") return new Response("rate limited", { status: 403 });
    const response = Response.json({ Rust: 12345, TypeScript: 678 });
    Object.defineProperty(response, "url", { value: url });
    return response;
  }
  if (url.startsWith("https://github.com/")) {
    if (options?.method !== "HEAD" || options?.credentials === "include") throw new Error("Expected anonymous visibility HEAD");
    if (${JSON.stringify(failure)} === "visibility") return new Response("rate limited", { status: 429 });
    return new Response(null, { status: url.includes("private-fixture") ? 404 : 200 });
  }
  if (url.includes("README.md")) {
    if (${JSON.stringify(failure)} === "readme") return new Response("unavailable", { status: 503 });
    return new Response(${JSON.stringify(input)});
  }
  if (url.includes("resume")) return new Response("# Test résumé\\nExperience.");
  return new Response("Working on software.");
};
`,
  );
  const proc = Bun.spawn({
    cmd: ["bun", "--preload", preload, join(scripts, script)],
    cwd: join(dir, "web"),
    env: {
      ...process.env,
      PROFILE_README_URL: "",
      AGENT_PUBLIC_DIR: join(dir, "public"),
      GH_TOKEN: "test-must-not-be-sent",
      GITHUB_TOKEN: "test-must-not-be-sent",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stderr).text(),
  ]);
  return { dir, exitCode, stderr };
}

test("README sync filters both inventories, keeps exact public bytes, and never restores previous members", async () => {
  const run = await fixture("sync-readme-projects.ts");
  expect(run.stderr).toBe("");
  expect(run.exitCode).toBe(0);
  const generated = await import(join(run.dir, "output.ts"));
  expect(generated.landingProjectsFromReadme).toHaveLength(1);
  expect(generated.landingProjectsFromReadme[0]).toMatchObject({
    name: "public-fixture",
    desc: "Fresh curated copy.",
    github: {
      repository: "fixture/public-fixture",
      languages: { Rust: 12345, TypeScript: 678 },
    },
  });
  expect(JSON.stringify(generated)).not.toContain("private-fixture");
  expect(JSON.stringify(generated)).not.toContain("crepuscularity");
  expect(JSON.stringify(generated)).not.toContain("fixture/deleted");
  expect(Object.keys(generated.githubLanguagesFetchedAt)).toEqual([
    "fixture/public-fixture",
  ]);
});

test("recent public bytes preserve website source associations but still require anonymous visibility", async () => {
  const input =
    "## Libraries\n\n- **[cached](https://cached.example.test)** — Curated website.\n";
  const fetchedAt = Date.now() - 60_000;
  const run = await fixture(
    "sync-readme-projects.ts",
    "languages",
    input,
    fetchedAt,
  );
  expect(run.exitCode).toBe(0);
  const generated = await import(join(run.dir, "output.ts"));
  expect(generated.landingProjectsFromReadme[0].github).toEqual({
    repository: "fixture/cached",
    languages: { Rust: 98765 },
  });
  expect(generated.githubLanguagesFetchedAt["fixture/cached"]).toBe(fetchedAt);
  const privateRun = await fixture(
    "sync-readme-projects.ts",
    "visibility",
    input,
    fetchedAt,
  );
  expect(privateRun.exitCode).not.toBe(0);
  expect(await Bun.file(join(privateRun.dir, "output.ts")).exists()).toBe(
    false,
  );
});

test("expired public bytes are refreshed instead of extending their timestamp", async () => {
  const input =
    "## Libraries\n\n- **[cached](https://cached.example.test)** — Curated website.\n";
  const fetchedAt = Date.now() - 25 * 60 * 60 * 1000;
  const run = await fixture("sync-readme-projects.ts", "", input, fetchedAt);
  expect(run.exitCode).toBe(0);
  const generated = await import(join(run.dir, "output.ts"));
  expect(generated.landingProjectsFromReadme[0].github.languages).toEqual({
    Rust: 12345,
    TypeScript: 678,
  });
  expect(generated.githubLanguagesFetchedAt["fixture/cached"]).toBeGreaterThan(
    fetchedAt,
  );
});

test("agent sync filters projects.md and the full LLM bundle before writing", async () => {
  const run = await fixture("sync-agent-public.ts");
  expect(run.stderr).toBe("");
  expect(run.exitCode).toBe(0);
  for (const name of ["projects.md", "llms-full.txt"]) {
    const output = await Bun.file(join(run.dir, "public", name)).text();
    expect(output).toContain("public-fixture");
    expect(output).not.toContain("private-fixture");
  }
});

for (const failure of ["visibility", "languages", "readme"]) {
  test(`README sync fails closed on ${failure} failure without overwriting generated output`, async () => {
    const run = await fixture("sync-readme-projects.ts", failure);
    expect(run.exitCode).not.toBe(0);
    expect(await Bun.file(join(run.dir, "output.ts")).exists()).toBe(false);
  });
}

test("agent sync writes nothing when public verification fails", async () => {
  const run = await fixture("sync-agent-public.ts", "visibility");
  expect(run.exitCode).not.toBe(0);
  expect(await Bun.file(join(run.dir, "public/projects.md")).exists()).toBe(
    false,
  );
  expect(await Bun.file(join(run.dir, "public/llms-full.txt")).exists()).toBe(
    false,
  );
});
