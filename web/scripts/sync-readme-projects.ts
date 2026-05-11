import {
  parseReadme,
  normalizeReadmeBundle,
  DEFAULT_PROFILE_MARKDOWN_URL,
  LEGACY_PROFILE_MARKDOWN_URL,
} from "../src/lib/profile-readme.ts";

const PROFILE_URLS = process.env.PROFILE_README_URL
  ? [process.env.PROFILE_README_URL]
  : [DEFAULT_PROFILE_MARKDOWN_URL, LEGACY_PROFILE_MARKDOWN_URL];

const OUT_FILE = new URL("../src/data/readme-projects.generated.ts", import.meta.url);

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
const bundle = normalizeReadmeBundle(parseReadme(md));
await Bun.write(
  OUT_FILE,
  emitTs(bundle.mainHeroQuote, bundle.mainProjects, bundle.utilities, bundle.miniapps),
);
console.log(
  `wrote ${OUT_FILE.pathname} (${bundle.mainProjects.length} main, ${bundle.utilities.length} utilities, ${bundle.miniapps.length} miniapps)`,
);
