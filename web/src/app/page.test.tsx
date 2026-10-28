import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createStaticRenderer } from "@/moonshine/renderer";
import Page from "./page";

test("the canonical homepage keeps the old identity and concise contact options", () => {
  const html = renderToStaticMarkup(createElement(Page));

  expect(html).toContain("<main");
  expect(html).toContain("Max Carter");
  expect(html).toContain("i make things for people.");
  expect(html).toContain("Reach out!");
  expect(html).toContain('href="#contact"');
  expect(html).toContain('href="mailto:max@tsc.hk"');
  expect(html).toContain('href="https://github.com/undivisible"');
  expect(html).toContain('href="https://x.com/makethings4ppl"');
  expect(html).toContain('href="https://www.instagram.com/undivisible.dev/"');
  expect(html).toContain("<noscript>");
  expect(html).toContain(".personal-page { visibility: visible !important; }");
  expect([...html.matchAll(/class="personal-project project-/g)]).toHaveLength(
    3,
  );
  expect(html).toContain("Inauguration");
  expect(html).toContain("Crepuscularity");
  expect(html).toContain("Alpenglow");
  expect(html).toContain('class="project-name-mark" aria-hidden="true"');
  expect(html).not.toContain("Moonshine");
  expect(html).not.toContain("/simple/");
});

test("the canonical document loads the album-theme client", async () => {
  const renderer = createStaticRenderer({
    lang: "en",
    fontVariableCss: "",
    stylesheet: "/assets/site.css",
    albumThemeEntry: "/assets/album-theme.js",
    clientEntries: { index: "/assets/home.js" },
    metadata: { root: {} },
  });
  const html = await renderer.prerender({
    request: new Request("https://undivisible.dev/"),
    route: {
      id: "index",
      path: "/",
      file: new URL("./page.tsx", import.meta.url).pathname,
      mode: "static",
      runtime: "bun",
      decision: "test",
      clientEntries: ["/assets/home.js"],
    },
    params: {},
    data: undefined,
    signal: new AbortController().signal,
  });

  expect(html).toContain('src="/assets/album-theme.js"');
});
