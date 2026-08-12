import { expect, test } from "bun:test";
import {
  normalizeReadmeBundle,
  parseReadme,
  readmeBundleProjectCount,
} from "@/lib/parse-readme-markdown";

const SUBPROJECTS_SNIPPET = `
## [crepuscularity](https://crepuscularity.undivisible.dev) · [aurorality](https://github.com/tschk/aurorality)

> hero quote line

body text

### subprojects

- **[inauguration](https://github.com/tschk/inauguration)** - compiler
- **[wax](https://github.com/plyght/wax)** — package manager

***
`;

const MINIAPPS_SNIPPET = `
## miniapps

### web apps
– **[crates download history](https://cratesdownloadhistory.undivisible.dev/)** - charts
- **[infrastruct](https://infrastruct.undivisible.dev)** — search

### mobile & desktop
- **[drift](https://github.com/undivisible/drift-wallpaper)** — wallpaper
`;

const LIBRARIES_SNIPPET = `
## libraries

- **[rs_ai](https://github.com/undivisible/rs_ai)** - sdk
- **[svelte-streamdown](https://sveltestreamdown.undivisible.dev/)** - markdown
`;

const FRAMEWORK_H3_SNIPPET = `
## [crepuscularity](https://crepuscularity.undivisible.dev) · [aurorality](https://github.com/tschk/aurorality)

> hero quote line

body text

### **[inauguration](https://inauguration.tsc.hk)**
inauguration desc

### [rv8](https://github.com/tschk/rv8)
rv8 desc

### other
- **[wax](https://github.com/plyght/wax)** — package manager

***
`;

test("parseReadme subprojects and framework headline", () => {
  const b = normalizeReadmeBundle(parseReadme(SUBPROJECTS_SNIPPET));
  expect(b.mainProjects.map((p) => p.key)).toEqual(["crepuscularity"]);
  expect(b.utilities.some((p) => p.key === "aurorality")).toBe(true);
  expect(b.utilities.some((p) => p.key === "inauguration")).toBe(true);
  expect(b.utilities.some((p) => p.key === "wax")).toBe(true);
});

test("parseReadme framework h3 utilities without subprojects heading", () => {
  const b = normalizeReadmeBundle(parseReadme(FRAMEWORK_H3_SNIPPET));
  expect(b.mainHeroQuote).toContain("hero quote");
  expect(b.mainProjects.map((p) => p.key)).toEqual(["crepuscularity"]);
  expect(b.utilities.some((p) => p.key === "inauguration")).toBe(true);
  expect(b.utilities.some((p) => p.key === "rv8")).toBe(true);
  expect(b.utilities.some((p) => p.key === "wax")).toBe(true);
});

test("parseReadme en-dash web app bullet", () => {
  const b = normalizeReadmeBundle(parseReadme(MINIAPPS_SNIPPET));
  expect(b.miniapps.some((p) => p.key === "crates-download-history")).toBe(
    true,
  );
  expect(b.miniapps.find((p) => p.key === "drift")?.href).toBe(
    "https://github.com/undivisible/drift-wallpaper",
  );
});

test("parseReadme libraries section", () => {
  const b = normalizeReadmeBundle(parseReadme(LIBRARIES_SNIPPET));
  expect(b.libraries.map((p) => p.key).sort()).toEqual([
    "rs_ai",
    "svelte-streamdown",
  ]);
});

test("normalizeReadmeBundle blocks javascript hrefs", () => {
  const b = normalizeReadmeBundle(
    parseReadme(`## miniapps\n\n- **[evil](javascript:alert(1))** — nope\n`),
  );
  expect(b.miniapps[0]?.href).toBe("#");
});

test("normalizeReadmeBundle applies hardcoded linguist stacks", () => {
  const b = normalizeReadmeBundle(
    parseReadme(FRAMEWORK_H3_SNIPPET + MINIAPPS_SNIPPET),
  );
  expect(b.utilities.find((p) => p.key === "inauguration")?.stack).toBe(
    "Rust.",
  );
  expect(b.utilities.find((p) => p.key === "rv8")?.stack).toBeUndefined();
});

test("readmeBundleProjectCount", () => {
  const b = normalizeReadmeBundle(
    parseReadme(SUBPROJECTS_SNIPPET + MINIAPPS_SNIPPET),
  );
  expect(readmeBundleProjectCount(b)).toBeGreaterThan(4);
});
