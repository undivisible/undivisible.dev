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
  expect(resumeDoc.experience.map((job) => job.time)).toEqual(
    expect.arrayContaining([
      "October 2026 - present",
      "August 2026 - present",
      "July 2026 - October 2026",
      "February 2026 - June 2026",
      "January 2023 - present",
      "October 2024 - present",
    ]),
  );

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
  const gizzmo = resumeDoc.experience
    .flatMap((job) => job.subsections)
    .flatMap((section) => section.items)
    .find((item) => item.name === "Gizzmo Electronics");

  expect(gizzmo?.desc).not.toContain("_Built with");
  expect(gizzmo?.stack).toBe(
    "SvelteKit 5, TypeScript, Vite, Tailwind CSS, Stripe, Netlify.",
  );
});

test("resume linked description segments strip emphasis markers", () => {
  const b1 = resumeDoc.experience
    .flatMap((job) => job.subsections)
    .flatMap((section) => section.items)
    .find((item) => item.name === "B1");

  expect(b1?.descSegments).not.toContainEqual({
    type: "text",
    value: "**",
  });
  expect(
    b1?.descSegments.some(
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

test("Arkie experience keeps the role summary without the detailed product list", () => {
  const arkie = resumeDoc.experience.find(
    (job) => job.org === "The Arkie Company",
  );
  expect(arkie?.bullets.length).toBe(3);
  expect(arkie?.subsections).toEqual([]);
});
