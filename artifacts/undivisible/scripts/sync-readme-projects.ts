import { parseReadme } from "../src/lib/profile-readme.ts";

const README_URL =
  process.env.PROFILE_README_URL ??
  "https://raw.githubusercontent.com/undivisible/undivisible/main/README.md";

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

const res = await fetch(README_URL);
if (!res.ok) {
  console.error(`fetch ${README_URL}: ${res.status}`);
  process.exit(1);
}
const md = await res.text();
const { mainHeroQuote, mainProjects, utilities, miniapps } = parseReadme(md);
await Bun.write(OUT_FILE, emitTs(mainHeroQuote, mainProjects, utilities, miniapps));
console.log(
  `wrote ${OUT_FILE.pathname} (${mainProjects.length} main, ${utilities.length} utilities, ${miniapps.length} miniapps)`,
);
