import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  landingProjectsFromMarkdown,
  useLandingProjects,
  useNowMarkdown,
  type LandingProject,
} from "./use-remote-content";

const seed: LandingProject[] = [
  {
    key: "widget",
    name: "widget",
    href: "https://github.com/owner/widget",
    desc: "old",
    github: { repository: "owner/widget", languages: { Rust: 500 } },
  },
];

test("project descriptions and removals follow README, preserving stats only for the same repository", () => {
  const projects = landingProjectsFromMarkdown(
    "### [renamed](https://github.com/owner/Widget)\nnew description",
    seed,
  );
  expect(projects[0]?.desc).toBe("new description");
  expect(projects[0]?.github).toEqual(seed[0]?.github);
  expect(landingProjectsFromMarkdown("", seed)).toEqual([]);
});

test("same project key on another repository never inherits previous stats", () => {
  const projects = landingProjectsFromMarkdown(
    "### [widget](https://github.com/different/widget)\nchanged source",
    seed,
  );
  expect(projects[0]?.github).toEqual({
    repository: "different/widget",
    languages: null,
  });
});

test("new repository links get truthful source associations and null language stats; unknown websites get no guessed repository", () => {
  const projects = landingProjectsFromMarkdown(
    "### [fresh](https://github.com/other/fresh)\nnew\n\n### [widget](https://new-site.test)\nnew site",
    seed,
  );
  expect(projects[0]?.github).toEqual({
    repository: "other/fresh",
    languages: null,
  });
  expect(projects[1]?.github).toBeNull();
});

test("initial render is loading with no build-copied project text or outdated now status", () => {
  function Probe() {
    const { projects, status, refreshProjects } = useLandingProjects(seed);
    const now = useNowMarkdown();
    expect(projects).toEqual([]);
    expect(status).toBe("loading");
    expect(typeof refreshProjects).toBe("function");
    expect(now.status).toBeNull();
    return createElement(
      "span",
      null,
      projects.map((project) => project.desc).join(""),
    );
  }
  expect(renderToString(createElement(Probe))).toBe("<span></span>");
});

test("an unchanged verified website association retains canonical repository stats, not its copied description", () => {
  const siteSeed = seed.map((project) => ({
    ...project,
    href: "https://widget.test/",
  }));
  const projects = landingProjectsFromMarkdown(
    "### [widget](https://widget.test)\nruntime description",
    siteSeed,
  );
  expect(projects[0]?.github).toEqual(seed[0]?.github);
  expect(projects[0]?.desc).toBe("runtime description");
});
