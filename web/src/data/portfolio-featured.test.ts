import { expect, test } from "bun:test";
import { resolvePillars } from "./portfolio-featured";
import { projects } from "./profile";
import type { ReadmeBundle } from "@/lib/profile-readme";

test("featured project copy stays curated when the remote README changes", () => {
  const readme = {
    mainProjects: [
      {
        key: "inauguration",
        name: "Inauguration",
        href: "https://inauguration.tsc.hk",
        desc: "an ultra-fast compiler",
      },
    ],
    utilities: [],
    miniapps: [],
    libraries: [],
    mainHeroQuote: "",
  } as ReadmeBundle;
  const pillars = resolvePillars(readme);
  for (const pillar of pillars) {
    expect(pillar.narrative).toBe(
      projects.find((project) => project.name.toLowerCase() === pillar.key)
        ?.description,
    );
  }
  expect(pillars.find((pillar) => pillar.key === "inauguration")?.href).toBe(
    "https://inauguration.tsc.hk",
  );
});
