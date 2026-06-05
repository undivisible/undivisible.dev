import {
  parseReadme,
  applyReadmeStackFallbacks,
  normalizeReadmeBundleWithGithubLinguist,
  DEFAULT_PROFILE_MARKDOWN_URL,
  LEGACY_PROFILE_MARKDOWN_URL,
  type ReadmeBundle,
} from "../src/lib/profile-readme.ts";

const PROFILE_URLS = process.env.PROFILE_README_URL
  ? [process.env.PROFILE_README_URL]
  : [DEFAULT_PROFILE_MARKDOWN_URL, LEGACY_PROFILE_MARKDOWN_URL];

const OUT_FILE = new URL(
  "../src/data/readme-projects.generated.ts",
  import.meta.url,
);

async function previousBundle(): Promise<ReadmeBundle | undefined> {
  try {
    const mod = await import(`${OUT_FILE.href}?t=${Date.now()}`);
    return {
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
    };
  } catch {
    return undefined;
  }
}

function emitTs(
  mainHeroQuote: string,
  mainProjects: ReturnType<typeof parseReadme>["mainProjects"],
  utilities: ReturnType<typeof parseReadme>["utilities"],
  miniapps: ReturnType<typeof parseReadme>["miniapps"],
): string {
  return `export type ReadmeProject = {
  key: string;
  name: string;
  href: string;
  desc: string;
  stack?: string;
  category?: string;
};

export const mainHeroQuoteFromReadme: string = ${JSON.stringify(mainHeroQuote)};

export const mainProjectsFromReadme: ReadmeProject[] = ${JSON.stringify(mainProjects, null, 2)};

export const utilitiesFromReadme: ReadmeProject[] = ${JSON.stringify(utilities, null, 2)};

export const miniappsFromReadme: ReadmeProject[] = ${JSON.stringify(miniapps, null, 2)};
`;
}

let res: Response | undefined;
for (const url of PROFILE_URLS) {
  res = await fetch(url);
  if (res.ok) break;
}
if (!res?.ok) {
  console.error(
    `fetch failed (${res?.status ?? "?"}): ${PROFILE_URLS.join(" -> ")}`,
  );
  process.exit(1);
}
const md = await res.text();
const freshBundle = await normalizeReadmeBundleWithGithubLinguist(
  parseReadme(md),
);
const previous = await previousBundle();
const bundle = previous
  ? applyReadmeStackFallbacks(freshBundle, previous)
  : freshBundle;
await Bun.write(
  OUT_FILE,
  emitTs(
    bundle.mainHeroQuote,
    bundle.mainProjects,
    bundle.utilities,
    bundle.miniapps,
  ),
);
console.log(
  `wrote ${OUT_FILE.pathname} (${bundle.mainProjects.length} main, ${bundle.utilities.length} utilities, ${bundle.miniapps.length} miniapps)`,
);
