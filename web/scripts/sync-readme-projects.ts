import {
  parseReadme,
  applyReadmeStackFallbacks,
  fillReadmeBundleMissingStacks,
  fetchProfileMarkdown,
  normalizeReadmeBundle,
  profileMarkdownUrls,
  type ReadmeBundle,
} from "../src/lib/profile-readme.ts";

const OUT_FILE = new URL(
  "../src/data/readme-projects.generated.ts",
  import.meta.url,
);

function previousBundle(): Promise<ReadmeBundle | undefined> {
  try {
    // eslint-disable-next-line unicorn/no-require-postinstall
    // @ts-expect-error - dynamic require
    const mod = require(OUT_FILE.pathname);
    return Promise.resolve({
      mainHeroQuote:
        typeof mod.mainHeroQuoteFromReadme === "string"
          ? mod.mainHeroQuoteFromReadme
          : "",
      mainProjects: Array.isArray(mod.mainProjectsFromReadme)
        ? mod.mainProjectsFromReadme
        : [],
      utilities: Array.isArray(mod.utilitiesFromReadme)
        ? mod.utilitiesFromReadme
        : [],
      miniapps: Array.isArray(mod.miniappsFromReadme)
        ? mod.miniappsFromReadme
        : [],
      libraries: Array.isArray(mod.librariesFromReadme)
        ? mod.librariesFromReadme
        : [],
    });
  } catch {
    return Promise.resolve(undefined);
  }
}

function emitTs(bundle: ReadmeBundle): string {
  return `export type ReadmeProject = {
  key: string;
  name: string;
  href: string;
  desc: string;
  stack?: string;
  category?: string;
};

export const mainHeroQuoteFromReadme: string = ${JSON.stringify(bundle.mainHeroQuote)};

export const mainProjectsFromReadme: ReadmeProject[] = ${JSON.stringify(bundle.mainProjects, null, 2)};

export const utilitiesFromReadme: ReadmeProject[] = ${JSON.stringify(bundle.utilities, null, 2)};

export const miniappsFromReadme: ReadmeProject[] = ${JSON.stringify(bundle.miniapps, null, 2)};

export const librariesFromReadme: ReadmeProject[] = ${JSON.stringify(bundle.libraries, null, 2)};
`;
}

let md: string;
try {
  md = await fetchProfileMarkdown({ urls: profileMarkdownUrls() });
} catch (error) {
  console.error(error);
  process.exit(1);
}

const freshBundle = normalizeReadmeBundle(parseReadme(md));
const previous = await previousBundle();
const withFallbacks = previous
  ? applyReadmeStackFallbacks(freshBundle, previous)
  : freshBundle;
const bundle = await fillReadmeBundleMissingStacks(withFallbacks);

await Bun.write(OUT_FILE, emitTs(bundle));

// Patch email: upstream README still has old address
const generated = await Bun.file(OUT_FILE.pathname).text();
await Bun.write(
  OUT_FILE,
  generated.replaceAll("max@undivisible.dev", "max@tsc.hk"),
);

console.log(
  `wrote ${OUT_FILE.pathname} (${bundle.mainProjects.length} main, ${bundle.utilities.length} utilities, ${bundle.miniapps.length} miniapps, ${bundle.libraries.length} libraries)`,
);
