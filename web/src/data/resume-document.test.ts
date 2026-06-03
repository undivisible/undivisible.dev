import { expect, test } from "bun:test";
import { resumeDoc, resumeSectionsNotInReadme } from "./resume-document";
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

test("resume document includes experience dates and B1 product links", () => {
  expect(resumeDoc.experience.map((job) => job.time)).toEqual([
    "2026–present",
    "2023–present",
    "late 2024",
  ]);

  const gizzmo = resumeDoc.experience.find(
    (job) => job.org === "Gizzmo Electronics",
  );
  const b1 = gizzmo?.subsections
    .flatMap((section) => section.items)
    .find((item) => item.name === "B1");

  expect(b1?.href).toBe("https://gizzmoelectronics.com/b1");
  expect(b1?.desc).toContain(
    "recreated as an online version with instructions",
  );
  expect(b1?.descSegments).toContainEqual({
    type: "link",
    label: "instructions",
    href: "https://gizzmoelectronics.com/b1/instructions",
  });
});

test("resume document extracts underscore stack emphasis", () => {
  const studio = resumeDoc.experience[0]?.subsections
    .flatMap((section) => section.items)
    .find((item) => item.name === "Studio of Optimisations");

  expect(studio?.desc).not.toContain("_Built with");
  expect(studio?.stack).toBe(
    "SvelteKit 5, TypeScript, Tailwind CSS v4, Cloudflare Workers, Arkie API proxy, Bun.",
  );
});

test("resume linked description segments strip emphasis markers", () => {
  const arkie = resumeDoc.experience[0]?.subsections
    .flatMap((section) => section.items)
    .find((item) => item.name === "Arkie");

  expect(arkie?.descSegments).not.toContainEqual({
    type: "text",
    value: "**",
  });
  expect(
    arkie?.descSegments.some(
      (segment) => segment.type === "text" && segment.value.includes("**"),
    ),
  ).toBe(false);
});
