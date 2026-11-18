import { expect, test } from "bun:test";
import {
  applyReadmeStackFallbacks,
  githubRepoPathFromHref,
  normalizeReadmeBundle,
  parseReadme,
} from "./profile-readme";

test("language repository extraction canonicalizes verified legacy links", () => {
  expect(
    githubRepoPathFromHref("https://github.com/tschk/eqts.git/tree/main"),
  ).toBe("softwarecorporation/eqts");
  expect(githubRepoPathFromHref("https://github.com/tschk/ark-protocol")).toBe(
    "arkiecompany/ark-protocol",
  );
  expect(githubRepoPathFromHref("https://eqts.tsc.hk")).toBeUndefined();
  expect(githubRepoPathFromHref("https://github.com/tschk/unknown")).toBe(
    "tschk/unknown",
  );
  expect(
    githubRepoPathFromHref("https://github.com/softwarecorporation/oil"),
  ).toBe("semitechnological/oil");
  expect(githubRepoPathFromHref("https://github.com/tschk/websurfx")).toBe(
    "undivisible/websurfx",
  );
  expect(
    githubRepoPathFromHref("https://softwarecorporation.github.io/darash"),
  ).toBe("softwarecorporation/darash");
});

test("Darash site and source links retain a distinct verified language repository", () => {
  for (const href of [
    "https://darash.tsc.hk",
    "https://darash.tsc.hk/",
    "https://softwarecorporation.github.io/darash/",
    "https://github.com/softwarecorporation/darash",
    "https://github.com/tschk/darash",
  ])
    expect(githubRepoPathFromHref(href)).toBe("softwarecorporation/darash");
  expect(githubRepoPathFromHref("https://darash.tsc.hk/other")).toBeUndefined();
  expect(
    githubRepoPathFromHref("https://darash.tsc.hk.evil.test/"),
  ).toBeUndefined();
  expect(
    githubRepoPathFromHref("https://github.com/undivisible/drift-wallpaper"),
  ).toBe("undivisible/drift-wallpaper");
});

test("owner migrations retain cached language stacks", () => {
  const previous = parseReadme(
    "### other\n- **[eqts](https://github.com/tschk/eqts)** — Same description.",
  );
  previous.utilities[0]!.stack = "Rust, TypeScript.";
  const fresh = normalizeReadmeBundle(
    parseReadme(
      "### other\n- **[eqts](https://github.com/softwarecorporation/eqts)** — Same description.",
    ),
  );
  const filled = applyReadmeStackFallbacks(fresh, previous);
  expect(
    filled.utilities.find((project) => project.key === "eqts")?.stack,
  ).toBe("Rust, TypeScript.");
  expect(filled.utilities.find((project) => project.key === "eqts")?.desc).toBe(
    "Same description.",
  );
});
