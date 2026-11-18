import { expect, test } from "bun:test";
import {
  normalizeReadmeBundle,
  normalizeProjectHref,
  parseLandingReadme,
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

test("standard Markdown separators preserve project categories", () => {
  const bundle = parseReadme(`### other
- **[tool](https://github.com/tschk/tool)** — utility.

---

## miniapps
### web apps
- **[app](https://github.com/undivisible/app)** — web app.

## libraries
- **[lib](https://github.com/undivisible/lib)** — library.`);
  expect(bundle.utilities.map((project) => project.name)).toEqual(["tool"]);
  expect(bundle.miniapps.map((project) => project.name)).toEqual(["app"]);
  expect(bundle.libraries.map((project) => project.name)).toEqual(["lib"]);
});

test("landing membership is explicit, not inferred from related projects or repository owner", () => {
  const projects = parseLandingReadme(`
[hardware](https://github.com/undivisible/undivisible/blob/main/hardware.md)
### [alpenglow](https://alpenglow.tsc.hk)
A Linux distro. Its [alpenglowed](https://github.com/tschk/alpenglowed) shell and [soliloquy](https://github.com/tschk/soliloquy) variant.
### other
- **[rv8](https://github.com/tschk/rv8)** — a browser.
- **[telekinesis](https://github.com/tschk/telekinesis)** — agent. [telekinesis.tsc.hk](https://telekinesis.tsc.hk).
- **[crates download history](https://cratesdownloadhistory.undivisible.dev/)** — charts. [github](https://github.com/undivisible/cratesdownloadhistory).
## libraries
- **[rs_poke](https://github.com/undivisible/rs_poke)** — [poke](https://poke.com) SDK, not [upstream](https://github.com/someone/other).
`);
  expect(projects.map((project) => project.key).sort()).toEqual([
    "alpenglow",
    "crates-download-history",
    "rs_poke",
    "rv8",
    "telekinesis",
  ]);
  expect(projects.some((project) => project.key === "soliloquy")).toBe(false);
});

test("project links use only verified GitHub migrations and preserve URL suffixes", () => {
  expect(
    normalizeProjectHref(
      "https://github.com/tschk/rotary/tree/main?tab=readme#usage",
    ),
  ).toBe(
    "https://github.com/softwarecorporation/rotary/tree/main?tab=readme#usage",
  );
  expect(normalizeProjectHref("https://github.com/tschk/ark-protocol")).toBe(
    "https://github.com/arkiecompany/ark-protocol",
  );
  expect(normalizeProjectHref("https://github.com/tschk/eqts.git")).toBe(
    "https://github.com/softwarecorporation/eqts.git",
  );
  for (const href of [
    "https://github.com/tschk/unknown-project",
    "https://github.com/undivisible/rotary",
    "https://github.com.evil.test/tschk/rotary",
    "https://rotary.tsc.hk/",
    "https://www.npmjs.com/package/@tschk/moonshine",
  ])
    expect(normalizeProjectHref(href)).toBe(href);
  expect(normalizeProjectHref("javascript:alert(1)")).toBe("#");
});

test("bundle normalization preserves inventory, copy and stacks while migrating links", () => {
  const before = parseReadme(SUBPROJECTS_SNIPPET);
  const normalized = normalizeReadmeBundle(before);
  const inauguration = before.utilities.find(
    (project) => project.key === "inauguration",
  )!;
  expect(
    normalized.utilities.find((project) => project.key === "inauguration"),
  ).toEqual({
    ...inauguration,
    href: "https://github.com/softwarecorporation/inauguration",
    stack: "Rust.",
  });
  expect(normalizeReadmeBundle(normalized)).toEqual(normalized);
  expect(
    normalized.utilities.find((project) => project.key === "eqswift")?.href,
  ).toBe("https://github.com/softwarecorporation/eqswift");
});

test("authorized project corrections normalize only verified repository destinations", () => {
  const destinations = [
    ["oil", "semitechnological/oil"],
    ["rs_vimium", "undivisible/rs_vimium"],
    ["anywhere", "undivisible/anywhere"],
    ["ark", "atechnology-company/ark"],
    ["arkie", "arkiecompany/arkie"],
    ["ark-protocol", "arkiecompany/ark-protocol"],
    ["websurfx", "undivisible/websurfx"],
    ["stalwart-lite", "arkiecompany/stalwart-lite"],
    ["darash", "softwarecorporation/darash"],
    ["drift", "undivisible/drift-wallpaper"],
    ["drift-wallpaper", "undivisible/drift-wallpaper"],
  ];
  for (const [name, destination] of destinations) {
    for (const owner of ["tschk", "softwarecorporation", "arkiecompany"]) {
      expect(
        normalizeProjectHref(
          `https://github.com/${owner}/${name}/tree/main?tab=readme#usage`,
        ),
      ).toBe(`https://github.com/${destination}/tree/main?tab=readme#usage`);
    }
    expect(normalizeProjectHref(`https://github.com/someone/${name}`)).toBe(
      `https://github.com/someone/${name}`,
    );
  }
  expect(
    normalizeProjectHref("https://softwarecorporation.github.io/darash/"),
  ).toBe("https://darash.tsc.hk");
  expect(
    normalizeProjectHref("https://softwarecorporation.github.io/other/"),
  ).toBe("https://softwarecorporation.github.io/other/");
  expect(normalizeProjectHref("https://github.com/arkiecompany/arkie")).toBe(
    "https://github.com/arkiecompany/arkie",
  );
  expect(
    normalizeProjectHref("https://github.com/arkiecompany/ark-protocol"),
  ).toBe("https://github.com/arkiecompany/ark-protocol");
});

test("Darash project links prefer the public site without rewriting source subpaths", () => {
  expect(
    normalizeProjectHref("https://github.com/softwarecorporation/darash"),
  ).toBe("https://darash.tsc.hk");
  expect(normalizeProjectHref("https://github.com/tschk/darash/")).toBe(
    "https://darash.tsc.hk",
  );
  expect(
    normalizeProjectHref("https://github.com/softwarecorporation/darash.git"),
  ).toBe("https://github.com/softwarecorporation/darash.git");
  expect(normalizeProjectHref("https://darash.tsc.hk")).toBe(
    "https://darash.tsc.hk",
  );
});

test("public landing parser retains games, private-source links and distinct subspace projects", () => {
  const projects = parseLandingReadme(`### other
- **[subspace](https://github.com/softwarecorporation/subspace)** — embedded realtime operating system.
- **[ark](https://github.com/atechnology-company/ark)** — hosted app platform prototype.

***

## miniapps
### mobile & desktop
- **[subspace notes](https://github.com/atechnology-company/subspace)** — a separate note-taking app; not the realtime operating system.

### games & experiments
- **[autophobia](https://github.com/chertlabs/autophobia)** — a week-long psychological horror.
- **[duplex](https://github.com/undivisible/duplex)** — a unity game-design project from 2023.

## libraries
- **[chertlabs engine](https://github.com/chertlabs/engine)** — shared backend for texting games.`);
  expect(projects.map((project) => project.key)).toEqual([
    "subspace",
    "ark",
    "subspace-notes",
    "autophobia",
    "duplex",
    "chertlabs-engine",
  ]);
  expect(
    projects.find((project) => project.key === "subspace-notes"),
  ).toMatchObject({
    name: "subspace notes",
    href: "https://github.com/atechnology-company/subspace",
    desc: "a separate note-taking app; not the realtime operating system.",
    category: "mobile & desktop",
  });
  expect(
    projects.find((project) => project.key === "autophobia")?.category,
  ).toBe("games & experiments");
  expect(projects.find((project) => project.key === "ark")?.href).toBe(
    "https://github.com/atechnology-company/ark",
  );
});

test("reviewed public source is explicitly curated, categorized and free of rejected projects", async () => {
  const projects = parseLandingReadme(
    await Bun.file(new URL("../../../projects.md", import.meta.url)).text(),
  );
  expect(new Set(projects.map((project) => project.key)).size).toBe(
    projects.length,
  );
  for (const name of [
    "chertlabs engine",
    "kairo",
    "omi v4",
    "lyceus",
    "subspace notes",
    "atmosphere",
  ])
    expect(projects.some((project) => project.name === name)).toBe(false);
  for (const project of projects) {
    expect(project.desc).not.toBe("");
    expect(project.category).toBeTruthy();
    expect(project.href).toStartWith("https://");
  }
  for (const category of new Set(projects.map((project) => project.category))) {
    const names = projects
      .filter((project) => project.category === category)
      .map((project) => project.name.toLowerCase());
    expect(names).toEqual([...names].sort());
  }
});
