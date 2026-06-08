import { expect, test } from "bun:test";
import { parseGithubLanguageHtml } from "@/lib/github-repo-languages";

const SAMPLE_HTML = `
<ul class="list-style-none">
  <li class="d-inline">
    <span class="color-fg-default text-bold mr-1">Rust</span>
    <span>94.7%</span>
  </li>
  <li class="d-inline">
    <span class="color-fg-default text-bold mr-1">Swift</span>
    <span>3.2%</span>
  </li>
</ul>
`;

test("parseGithubLanguageHtml orders languages by percentage", () => {
  expect(parseGithubLanguageHtml(SAMPLE_HTML)).toBe("Rust, Swift.");
});
