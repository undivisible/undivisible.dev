import { expect, test } from "bun:test";
import { resumeSectionsNotInReadme } from "./resume-document";
import { normalizeReadmeBundle, type ReadmeBundle } from "@/lib/profile-readme";

function bundleWithUtilities(names: string[]): ReadmeBundle {
  return normalizeReadmeBundle({
    mainHeroQuote: "",
    mainProjects: [],
    utilities: names.map((name) => ({
      key: name.toLowerCase(),
      name,
      href: "#",
      desc: "",
    })),
    miniapps: [],
  });
}

test("resume fallback sections render plain titles", () => {
  const sections = resumeSectionsNotInReadme(bundleWithUtilities([]));

  expect(sections.map((section) => section.section)).toContain(
    "macOS tooling · semitechnological",
  );
  expect(sections.map((section) => section.section)).not.toContain(
    "macOS tooling · [semitechnological](https://github.com/semitechnological)",
  );
});

test("resume fallback skips readme projects with status suffixes", () => {
  const sections = resumeSectionsNotInReadme(
    bundleWithUtilities(["otto", "tabyrus (wip)", "tile (shelved)"]),
  );
  const names = sections.flatMap((section) =>
    section.projects.map((project) => project.name),
  );

  expect(names).not.toContain("Otto (WIP)");
  expect(names).not.toContain("Tile (WIP)");
  expect(names).not.toContain("Tabyrus (WIP)");
});
