import { expect, test } from "bun:test";
import {
  githubLanguageLabel,
  parseGithubLanguageBytes,
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
