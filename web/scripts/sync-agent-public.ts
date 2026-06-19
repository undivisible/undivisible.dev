import { DEFAULT_PROFILE_MARKDOWN_URL } from "../src/lib/profile-readme.ts";

const PUBLIC_DIR = new URL("../public/", import.meta.url);
const SITE = process.env.SITE_URL ?? "https://undivisible.dev";

async function fetchNow(): Promise<string | null> {
  const urls = process.env.PROFILE_README_URL
    ? [process.env.PROFILE_README_URL]
    : [
        DEFAULT_PROFILE_MARKDOWN_URL,
        "https://raw.githubusercontent.com/undivisible/undivisible/main/README.md",
      ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const raw = (await res.text()).trim();
        if (raw.length > 0) return raw;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

const now = await fetchNow();
const resume = await Bun.file(new URL("../../resume.md", import.meta.url)).text();

if (now) {
  await Bun.write(new URL("now.md", PUBLIC_DIR), now);
  console.log(`wrote public/now.md (${now.length} chars)`);
} else {
  console.warn("now.md not fetched; skipping public/now.md");
}

await Bun.write(new URL("resume.md", PUBLIC_DIR), resume);
console.log(`wrote public/resume.md (${resume.length} chars)`);

const agentMd = `# undivisible.dev — agent index

> Static site (GitHub Pages). Use **direct file URLs** — not HTML from \`/\`.

## Fetch these (plain text)

| URL | Content |
|-----|---------|
| ${SITE}/llms.txt | Curated link index ([llms.txt](https://llmstxt.org/) spec) |
| ${SITE}/now.md | Profile, project list, now |
| ${SITE}/resume.md | Resume / CV |

Example: \`curl -sL ${SITE}/now.md\`

## Not available here

- No \`Accept: text/markdown\` on HTML routes (unlike Cloudflare markdown for agents on dynamic hosts).
- Do not scrape \`${SITE}/\` (WebGL UI); use \`.md\` paths above.

## Humans

- ${SITE}/agent — this index as HTML
- ${SITE}/ — portfolio
`;

await Bun.write(new URL("agent.md", PUBLIC_DIR), agentMd);
console.log("wrote public/agent.md");

const llms = `# undivisible.dev

> Max Carter (undivisible) — software systems, AI automation, low-level tooling. **Agents: GET the markdown files below** (static hosting; same bytes as curl).

Hosted on GitHub Pages: \`/now.md\` and \`/resume.md\` are real files in the deploy bundle, not HTML wrappers.

## Markdown (fetch directly)

- [Now / profile](${SITE}/now.md): Projects and current focus.
- [Resume](${SITE}/resume.md): Experience, skills, contact.
- [Agent how-to](${SITE}/agent.md): Which URLs to use; static vs Cloudflare-style negotiation.

## Index

- [llms.txt](${SITE}/llms.txt): This file.
- [Agent page](${SITE}/agent): HTML link list only (no inlined content).

## Optional

- [Upstream now.md](https://raw.githubusercontent.com/undivisible/undivisible/main/now.md): GitHub source before deploy sync.
`;

await Bun.write(new URL("llms.txt", PUBLIC_DIR), llms);
console.log("wrote public/llms.txt");

const robots = `User-agent: *
Allow: /

# llms.txt: ${SITE}/llms.txt
`;

await Bun.write(new URL("robots.txt", PUBLIC_DIR), robots);
console.log("wrote public/robots.txt");