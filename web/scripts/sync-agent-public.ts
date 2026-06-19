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
const agents = await Bun.file(new URL("../../AGENTS.md", import.meta.url)).text();

if (now) {
  await Bun.write(new URL("now.md", PUBLIC_DIR), now);
  console.log(`wrote public/now.md (${now.length} chars)`);
} else {
  console.warn("now.md not fetched; skipping public/now.md");
}

await Bun.write(new URL("resume.md", PUBLIC_DIR), resume);
console.log(`wrote public/resume.md (${resume.length} chars)`);

await Bun.write(new URL("agents.md", PUBLIC_DIR), agents);
console.log(`wrote public/agents.md (${agents.length} chars)`);

const llms = `# undivisible.dev

> Portfolio and contact site for Max Carter (undivisible): software systems, AI automation, and low-level tooling. Human UI is visual; agents should use plain markdown URLs below.

This site follows the [llms.txt](https://llmstxt.org/) convention: curated links to markdown sources. Fetch \`text/markdown\` or \`text/plain\` at each path. The interactive site is at ${SITE}/; agent-readable bundle at ${SITE}/agent.

## Primary markdown

- [Now / profile](${SITE}/now.md): Current focus, project list, and short bio (synced from GitHub \`now.md\` or README).
- [Resume](${SITE}/resume.md): Full CV — experience, skills, contact.
- [AGENTS.md](${SITE}/agents.md): Repo agent instructions for contributors and coding agents.

## Pages

- [Agent mode](${SITE}/agent): Single HTML page listing the same markdown with direct download links (no WebGL UI).
- [Home](${SITE}/): Full portfolio (not optimized for token use).

## Optional

- [GitHub profile README source](https://raw.githubusercontent.com/undivisible/undivisible/main/now.md): Upstream \`now.md\` when you need the latest before deploy sync.
`;

await Bun.write(new URL("llms.txt", PUBLIC_DIR), llms);
console.log("wrote public/llms.txt");

const ai = `User-Agent: *
Allow: /

# LLM-friendly index: ${SITE}/llms.txt
# Markdown: ${SITE}/now.md ${SITE}/resume.md ${SITE}/agents.md
# Agent HTML index: ${SITE}/agent
`;

await Bun.write(new URL("ai.txt", PUBLIC_DIR), ai);
console.log("wrote public/ai.txt");

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml

# LLM agent index (llms.txt spec)
# llms.txt: ${SITE}/llms.txt
`;

await Bun.write(new URL("robots.txt", PUBLIC_DIR), robots);
console.log("wrote public/robots.txt");