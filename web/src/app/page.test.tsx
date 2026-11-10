import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Page from "./page";

test("the landing page introduces Max and links to the existing OS", () => {
  const html = renderToStaticMarkup(createElement(Page));
  expect(html).toContain("hi, i’m max carter.");
  expect(html).toContain('href="/lab/"');
  expect(html).toContain("enter the OS");
  expect(html.match(/<p>/g)).toHaveLength(2);
  expect(html).toContain('data-time-scrubber="true"');
  expect(html).toContain("[Inauguration]");
  expect(html).toContain("[Space]");
  expect(html).toContain("[Alpenglow]");
  expect(html).toContain("[Crepuscularity]");
  expect(html).toContain("[Moonshine]");
  expect(html).toContain('href="https://github.com/undivisible"');
  expect(html).toContain('href="mailto:max@tsc.hk"');
});
