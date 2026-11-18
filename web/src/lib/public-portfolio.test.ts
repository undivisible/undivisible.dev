import { expect, test } from "bun:test";
import { createPublicPortfolioFilter } from "./public-portfolio";
import { parseLandingReadme } from "./parse-readme-markdown";

test("only explicitly curated, anonymously public repositories survive, including website associations", async () => {
  const filter = createPublicPortfolioFilter({
    fetchUpstream: async (input, init) => {
      expect(init?.method).toBe("HEAD");
      expect(new Headers(init?.headers).get("Authorization")).toBeNull();
      expect(new Headers(init?.headers).get("Cookie")).toBeNull();
      return new Response(null, {
        status: String(input).endsWith("/public") ? 200 : 404,
      });
    },
  });
  const md = `## tools
- **[visible](https://github.com/example/public)** — public description.
- **[private alias](https://github.com/example/private)** — must disappear.
- **[private site](https://private-site.test)** — private source.
- **unlinked** — cannot establish public destination.

Related [not curated](https://github.com/example/other).
## libraries
- **[visible](https://github.com/example/public)** — duplicate.`;
  const output = await filter(
    md,
    new Map([["https://private-site.test", "example/private"]]),
  );
  expect(
    parseLandingReadme(output).map((project) => [
      project.name,
      project.category,
    ]),
  ).toEqual([["visible", "tools"]]);
  expect(output).not.toContain("must disappear");
  expect(output).not.toContain("private source");
  expect(output).not.toContain("not curated");
});

test("visibility expires and a repository made private disappears; errors never count as public", async () => {
  let now = 0;
  let status = 200;
  const filter = createPublicPortfolioFilter({
    now: () => now,
    fetchUpstream: async () => new Response(null, { status }),
  });
  const md =
    "## tools\n- **[tool](https://github.com/example/tool)** — description.";
  expect(parseLandingReadme(await filter(md))).toHaveLength(1);
  now = 60_000;
  status = 404;
  expect(await filter(md)).toBe("");
  now += 60_000;
  status = 429;
  await expect(filter(md)).rejects.toThrow("verification failed (429)");
});

test("repository moves stay anonymous and external/login redirects are rejected", async () => {
  const filter = createPublicPortfolioFilter({
    fetchUpstream: async (input) =>
      String(input).endsWith("/moved")
        ? new Response(null, {
            status: 301,
            headers: { Location: "https://github.com/new/public" },
          })
        : new Response(null, { status: 200 }),
  });
  expect(
    parseLandingReadme(
      await filter(
        "## tools\n- **[move](https://github.com/old/moved)** — moved.",
      ),
    ),
  ).toHaveLength(1);
  const rejected = createPublicPortfolioFilter({
    fetchUpstream: async () =>
      new Response(null, {
        status: 302,
        headers: { Location: "https://other.test/private" },
      }),
  });
  await expect(
    rejected(
      "## tools\n- **[tool](https://github.com/example/tool)** — description.",
    ),
  ).rejects.toThrow("redirect rejected");
});
