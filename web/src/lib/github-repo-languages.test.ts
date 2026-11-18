import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GithubLanguageBar } from "../components/GithubLanguageBar";
import { landingProjectsFromReadme } from "../data/readme-projects.generated";
import { githubLanguageColors } from "./github-language-colors";
import {
  githubLanguageLabel,
  parseGithubLanguageBytes,
  prepareGithubLanguages,
} from "./github-repo-languages";

test("GitHub language shares come from byte counts, not names or README stacks", () => {
  const languages = parseGithubLanguageBytes({
    TypeScript: 75,
    Rust: 125,
    JavaScript: 0,
  });
  expect(githubLanguageLabel({ repository: "owner/repo", languages })).toBe(
    "Rust 62.5% · TypeScript 37.5%",
  );
  expect(
    githubLanguageLabel({
      repository: "owner/repo",
      languages: { Rust: 125, TypeScript: 75, HTML: 50, CSS: 25 },
    }),
  ).toBe("Rust 45.5% · TypeScript 27.3% · HTML 18.2% · Other 9.1%");
});

test("tiny GitHub byte shares are grouped honestly instead of rounded to zero", () => {
  expect(
    githubLanguageLabel({
      repository: "tschk/moonshine",
      languages: {
        TypeScript: 5152763,
        Dart: 2092,
        Shell: 1565,
        Dockerfile: 843,
        JavaScript: 138,
      },
    }),
  ).toBe("TypeScript 99.9% · Other <0.1%");
  expect(
    githubLanguageLabel({
      repository: "owner/repo",
      languages: {
        Rust: 7000,
        TypeScript: 2990,
        Shell: 9,
        CSS: 1,
        JavaScript: 0,
      },
    }),
  ).toBe("Rust 70.0% · TypeScript 29.9% · Other 0.1%");
  expect(
    githubLanguageLabel({
      repository: "owner/repo",
      languages: {
        Rust: 999,
        Shell: 1,
        CSS: 0,
      },
    }),
  ).toBe("Rust 99.9% · Shell 0.1%");
  expect(
    githubLanguageLabel({
      repository: "owner/repo",
      languages: {
        Rust: 1000,
        CSS: 0,
      },
    }),
  ).toBe("Rust 100.0%");
});

test("missing, empty, and failed GitHub language data stay distinct", () => {
  expect(githubLanguageLabel(null)).toBe(
    "GitHub languages: no linked repository",
  );
  expect(githubLanguageLabel({ repository: "owner/repo", languages: {} })).toBe(
    "GitHub reports no language data",
  );
  for (const data of [
    null,
    [],
    { message: "API rate limit exceeded" },
    { Rust: -1 },
  ]) {
    const languages = parseGithubLanguageBytes(data);
    expect(languages).toBeNull();
    expect(githubLanguageLabel({ repository: "owner/repo", languages })).toBe(
      "GitHub languages unavailable",
    );
  }
});

test("bar segments retain every positive byte share, including tiny languages", () => {
  const languages = prepareGithubLanguages({
    repository: "owner/repo",
    languages: { Rust: 7000, TypeScript: 2990, Shell: 9, CSS: 1, HTML: 0 },
  });
  expect(
    languages.segments.map(({ name, percentage, color }) => [
      name,
      percentage,
      color,
    ]),
  ).toEqual([
    ["Rust", 70, "#dea584"],
    ["TypeScript", 29.9, "#3178c6"],
    ["Shell", 0.09, "#89e051"],
    ["CSS", 0.01, "#663399"],
  ]);
  const html = renderToStaticMarkup(
    createElement(GithubLanguageBar, { languages }),
  );
  expect(html).toContain('href="https://github.com/owner/repo#languages"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain("width:0.09%;background-color:#89e051");
  expect(html).toContain("width:0.01%;background-color:#663399");
  expect(html).toContain("Shell &lt;0.1% (9 bytes)");
  expect(html).toContain("CSS &lt;0.1% (1 bytes)");
  expect(html).not.toContain("width:0%");
});

test("inventory bars preserve the real cached byte data, not rounded label shares", () => {
  for (const project of landingProjectsFromReadme) {
    const prepared = prepareGithubLanguages(project.github);
    const positive = Object.entries(project.github?.languages ?? {}).filter(
      ([, bytes]) => bytes > 0,
    );
    expect(prepared.segments).toHaveLength(positive.length);
    const total = positive.reduce((sum, [, bytes]) => sum + bytes, 0);
    for (const segment of prepared.segments) {
      expect(segment.bytes).toBe(project.github?.languages?.[segment.name]);
      expect(segment.percentage).toBe((segment.bytes / total) * 100);
      expect(Object.hasOwn(githubLanguageColors, segment.name)).toBe(true);
    }
    if (total > 0) {
      expect(
        prepared.segments.reduce((sum, segment) => sum + segment.percentage, 0),
      ).toBeCloseTo(100, 10);
    }
  }
  const moonshine = landingProjectsFromReadme.find(
    (project) => project.key === "moonshine",
  );
  const prepared = prepareGithubLanguages(moonshine?.github ?? null);
  expect(prepared.segments.map((segment) => segment.name)).toEqual([
    "TypeScript",
    "Dart",
    "Shell",
    "Dockerfile",
    "JavaScript",
  ]);
  expect(prepared.accessibleLabel).toContain("JavaScript <0.1% (138 bytes)");
});

test("colourless and unknown languages keep their bytes and disclose the neutral fallback", () => {
  const languages = prepareGithubLanguages({
    repository: "owner/repo",
    languages: {
      Sieve: 2,
      "Linker Script": 1,
      "New language": 1,
      constructor: 1,
    },
  });
  expect(languages.segments.map((segment) => segment.color)).toEqual([
    null,
    null,
    null,
    null,
  ]);
  expect(languages.segments.map((segment) => segment.percentage)).toEqual([
    40, 20, 20, 20,
  ]);
  expect(languages.accessibleLabel).toContain("neutral fallback colour");
  const html = renderToStaticMarkup(
    createElement(GithubLanguageBar, { languages }),
  );
  expect(html).toContain("var(--github-language-fallback, #8c959f)");
});

test("missing language states have honest text and no fabricated bar", () => {
  for (const stats of [
    null,
    { repository: "owner/repo", languages: null },
    { repository: "owner/repo", languages: {} },
  ]) {
    const languages = prepareGithubLanguages(stats);
    const html = renderToStaticMarkup(
      createElement(GithubLanguageBar, { languages }),
    );
    expect(languages.segments).toEqual([]);
    expect(html).toContain(githubLanguageLabel(stats));
    expect(html).not.toContain('class="github-language-bar"');
    if (stats === null) expect(html).not.toContain("<a");
  }
});
