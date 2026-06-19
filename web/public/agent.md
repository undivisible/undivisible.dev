# undivisible.dev — agent index

> Static site (GitHub Pages). Use **direct file URLs** — not HTML from `/`.

## Fetch these (plain text)

| URL | Content |
|-----|---------|
| https://undivisible.dev/llms.txt | Curated link index ([llms.txt](https://llmstxt.org/) spec) |
| https://undivisible.dev/now.md | Profile, project list, now |
| https://undivisible.dev/resume.md | Resume / CV |

Example: `curl -sL https://undivisible.dev/now.md`

## Not available here

- No `Accept: text/markdown` on HTML routes (unlike Cloudflare markdown for agents on dynamic hosts).
- Do not scrape `https://undivisible.dev/` (WebGL UI); use `.md` paths above.

## Humans

- https://undivisible.dev/agent — this index as HTML
- https://undivisible.dev/ — portfolio
