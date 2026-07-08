# undivisible.dev — agent index

> Static site (GitHub Pages). Use **direct file URLs** — not HTML from `/`.

## Fetch these (plain text)

| URL | Content |
|-----|---------|
| https://undivisible.dev/llms.txt | Curated link index ([llms.txt](https://llmstxt.org/) spec) |
| https://undivisible.dev/llms-full.txt | Full agent-readable bundle: agent guide, now/profile, resume |
| https://undivisible.dev/agent.md | Agent guide and fetch order |
| https://undivisible.dev/now.md | Now status snapshot (upstream now.md; not the project list) |
| https://undivisible.dev/resume.md | Resume / CV |

Best first request for full context: `curl -sL https://undivisible.dev/llms-full.txt`

## Not available here

- No `Accept: text/markdown` on HTML routes (unlike Cloudflare markdown for agents on dynamic hosts).
- Do not scrape `https://undivisible.dev/` (WebGL UI); use `.md` paths above.

## Humans

- https://undivisible.dev/agent — this index as HTML
- https://undivisible.dev/ — portfolio
