import { DEFAULT_PROFILE_MARKDOWN_URL } from "../src/lib/profile-readme.ts";
import { fetchResumeMarkdown } from "../src/lib/resume-source.ts";

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
let resume: string;
try {
  resume = await fetchResumeMarkdown();
} catch {
  console.warn("resume.md not fetched; skipping public/resume.md");
  resume = "";
}

if (now) {
  await Bun.write(new URL("now.md", PUBLIC_DIR), now);
  console.log(`wrote public/now.md (${now.length} chars)`);
} else {
  console.warn("now.md not fetched; skipping public/now.md");
}

if (resume) {
  await Bun.write(new URL("resume.md", PUBLIC_DIR), resume);
  console.log(`wrote public/resume.md (${resume.length} chars)`);
}

const agentMd = `# undivisible.dev — agent index

> Static site (GitHub Pages). Use **direct file URLs** — not HTML from \`/\`.

## Fetch these (plain text)

| URL | Content |
|-----|---------|
| ${SITE}/llms.txt | Curated link index ([llms.txt](https://llmstxt.org/) spec) |
| ${SITE}/llms-full.txt | Full agent-readable bundle: agent guide, now/profile, resume |
| ${SITE}/agent.md | Agent guide and fetch order |
| ${SITE}/now.md | Profile, project list, now |
| ${SITE}/resume.md | Resume / CV |

Best first request for full context: \`curl -sL ${SITE}/llms-full.txt\`

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

Hosted on GitHub Pages: these are real files in the deploy bundle, not HTML wrappers.

## Markdown (fetch directly)

- [Full bundle](${SITE}/llms-full.txt): Agent guide, profile/current projects, and resume in one Markdown request.
- [Now / profile](${SITE}/now.md): Projects and current focus.
- [Resume](${SITE}/resume.md): Experience, skills, contact.
- [Agent how-to](${SITE}/agent.md): Which URLs to use; static vs Cloudflare-style negotiation.

## Index

- [llms.txt](${SITE}/llms.txt): This file.
- [Agent page](${SITE}/agent): HTML link list only (no inlined content).

## Optional

- [Upstream now.md](https://raw.githubusercontent.com/undivisible/undivisible/main/now.md): GitHub source before deploy sync.
- [Upstream resume.md](https://raw.githubusercontent.com/undivisible/undivisible/main/resume.md): GitHub source before deploy sync.
`;

await Bun.write(new URL("llms.txt", PUBLIC_DIR), llms);
console.log("wrote public/llms.txt");

const llmsFull = `${llms}

---

${agentMd}

---

# Now / profile

${now ?? "No profile markdown was fetched during this build."}

---

# Resume

${resume || "No resume markdown was fetched during this build."}
`;

await Bun.write(new URL("llms-full.txt", PUBLIC_DIR), llmsFull);
console.log("wrote public/llms-full.txt");

const robots = `User-agent: *
Allow: /

# llms.txt: ${SITE}/llms.txt
# llms-full.txt: ${SITE}/llms-full.txt
`;

await Bun.write(new URL("robots.txt", PUBLIC_DIR), robots);
console.log("wrote public/robots.txt");
