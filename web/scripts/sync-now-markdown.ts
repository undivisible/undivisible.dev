import { DEFAULT_PROFILE_MARKDOWN_URL } from "../src/lib/profile-readme.ts";

const NOW_URL = process.env.NOW_MARKDOWN_URL ?? DEFAULT_PROFILE_MARKDOWN_URL;
const LOCAL_NOW = new URL("../public/now.md", import.meta.url);

const OUT_FILE = new URL(
  "../src/data/now-markdown.generated.ts",
  import.meta.url,
);

let content: string | null = null;

try {
  const res = await fetch(NOW_URL);
  if (res.ok) {
    const raw = (await res.text()).trim();
    content = raw.length > 0 ? raw : null;
  }
} catch {
  content = null;
}

if (!content) {
  try {
    const raw = (await Bun.file(LOCAL_NOW).text()).trim();
    content = raw.length > 0 ? raw : null;
  } catch {
    content = null;
  }
}

const emitTs = `export const nowMarkdownFromRepo: string | null = ${JSON.stringify(content)};
`;

await Bun.write(OUT_FILE, emitTs);
console.log(
  `wrote ${OUT_FILE.pathname} (${content ? `${content.length} chars` : "empty"})`,
);
