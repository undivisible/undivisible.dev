import { expect, test } from "bun:test";
import { resumeDoc } from "./resume-document";
import {
  formatLinguistLanguages,
  githubRepoPathFromHref,
} from "@/lib/profile-readme";

test("resume markdown does not provide standalone project sections", () => {
  expect(resumeDoc.projectSections).toEqual([]);
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

test("readme project stacks use GitHub Linguist language order", () => {
  expect(
    githubRepoPathFromHref("https://github.com/undivisible/svelte-streamdown"),
  ).toBe("undivisible/svelte-streamdown");
  expect(
    formatLinguistLanguages({
      TypeScript: 1526090,
      MDX: 175302,
      HTML: 19505,
      CSS: 11732,
      JavaScript: 4073,
      Svelte: 3060,
    }),
  ).toBe("TypeScript, MDX, HTML, CSS, JavaScript, Svelte.");
});
