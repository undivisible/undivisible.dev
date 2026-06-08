import { expect, test } from "bun:test";
import {
  applyReadmeStackFallbacks,
  fetchProfileReadmeProjects,
  getProfileReadmeProjects,
  getReadmeBundleFromGenerated,
  parseReadme,
  type ReadmeBundle,
} from "@/lib/profile-readme";

test("readme stack fallback keeps previous stacks when fresh sync has none", () => {
  const previous: ReadmeBundle = {
    mainHeroQuote: "",
    mainProjects: [],
    utilities: [
      {
        key: "rs_ai",
        name: "rs_ai",
        href: "https://github.com/undivisible/rs_ai",
        desc: "old",
        stack: "Rust, Swift.",
      },
    ],
    miniapps: [],
    libraries: [],
  };
  const fresh: ReadmeBundle = {
    mainHeroQuote: "",
    mainProjects: [],
    utilities: [
      {
        key: "rs_ai",
        name: "rs_ai",
        href: "https://github.com/undivisible/rs_ai",
        desc: "new",
      },
    ],
    miniapps: [],
    libraries: [],
  };

  expect(applyReadmeStackFallbacks(fresh, previous).utilities[0]?.stack).toBe(
    "Rust, Swift.",
  );
});

test("client readme fetch falls back to the next markdown URL", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = Object.assign(async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (url === "https://example.com/missing.md") {
      return new Response("missing", { status: 404 });
    }
    if (url === "https://example.com/profile.md") {
      return new Response(
        [
          "## [semitechnological](https://github.com/semitechnological)",
          "- **[tool](https://github.com/undivisible/tool)** - useful thing",
          "***",
        ].join("\n"),
        { status: 200 },
      );
    }
    return new Response("unexpected", { status: 500 });
  }, originalFetch);

  try {
    const bundle = await fetchProfileReadmeProjects({
      includeRepoLanguageStacks: false,
      urls: [
        "https://example.com/missing.md",
        "https://example.com/profile.md",
      ],
    });
    expect(calls).toEqual([
      "https://example.com/missing.md",
      "https://example.com/profile.md",
    ]);
    expect(
      bundle.utilities.find((project) => project.key === "tool"),
    ).toMatchObject({
      key: "tool",
      desc: "useful thing",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("parseReadme captures libraries after miniapps", () => {
  const bundle = parseReadme(
    [
      "## miniapps",
      "### developer tools",
      "- **[tool](https://github.com/undivisible/tool)** - handy",
      "## libraries",
      "- **[rs_ai](https://github.com/undivisible/rs_ai)** - rust ai sdk",
      "- **[rs_poke](https://github.com/undivisible/rs_poke)** - poke sdk",
    ].join("\n"),
  );

  expect(bundle.miniapps).toHaveLength(1);
  expect(bundle.libraries).toHaveLength(2);
  expect(bundle.libraries[0]?.key).toBe("rs_ai");
});

test("runtime readme bundle reads the generated snapshot", () => {
  const generated = getReadmeBundleFromGenerated();
  const runtime = getProfileReadmeProjects();
  expect(runtime.mainProjects).toEqual(generated.mainProjects);
  expect(runtime.utilities).toEqual(generated.utilities);
  expect(runtime.miniapps).toEqual(generated.miniapps);
  expect(runtime.libraries).toEqual(generated.libraries);
});
