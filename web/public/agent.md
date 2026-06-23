# undivisible.dev — agent index

> Static site (GitHub Pages). Use **direct file URLs** — not HTML from `/`.

## Fetch these (plain text)

| URL | Content |
|-----|---------|
| https://example.test/llms.txt | Curated link index ([llms.txt](https://llmstxt.org/) spec) |
| https://example.test/llms-full.txt | Full agent-readable bundle: agent guide, now/profile, resume |
| https://example.test/agent.md | Agent guide and fetch order |
| https://example.test/now.md | Profile, project list, now |
| https://example.test/resume.md | Resume / CV |

Best first request for full context: `curl -sL https://example.test/llms-full.txt`

## Not available here

- No `Accept: text/markdown` on HTML routes (unlike Cloudflare markdown for agents on dynamic hosts).
- Do not scrape `https://example.test/` (WebGL UI); use `.md` paths above.

## Humans

- https://example.test/agent — this index as HTML
- https://example.test/ — portfolio
