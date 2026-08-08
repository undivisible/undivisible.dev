import { describe, expect, test } from "bun:test";
import { organiseProjects } from "./organise-projects";

const categoryOf = (name: string, desc: string, href = "") => {
  const [category] = organiseProjects([{ name, desc, href }]);
  return category!.key;
};

describe("organiseProjects", () => {
  test.each([
    ["space", "ground-up operating system built on inauguration", "os"],
    ["alpenglow", "is my distro of linux, boots in under a second", "os"],
    ["inauguration", "general-purpose compiler pipeline", "compilers"],
    ["tree-sitter-holyc", "tree sitter parsing and grammars", "compilers"],
    ["crepuscularity", "a framework for cross-platform apps", "frameworks"],
    ["rv8", "custom browser engine with servo and v8", "engines"],
    ["apollo", "local-first rust ai agent runtime", "agents"],
    ["wax", "homebrew-compatible package manager in rust", "packaging"],
    ["equilibrium", "c ffi generation for c-compiling languages", "interop"],
    ["nexnet", "peer-to-peer social chat, encrypted messaging", "protocols"],
    ["unthinkmail", "mcp for imap-supported email", "mail"],
    [
      "rs_vimium",
      "a rust rewrite of the vimium browser extension",
      "extensions",
    ],
    ["flowtoken-svelte", "a svelte version of ephibb's flowtoken", "ui"],
    ["bublik", "canvas tool for generating soundscapes", "apps"],
  ])("puts %s in %s", (name, desc, expected) => {
    expect(categoryOf(name as string, desc as string)).toBe(expected as string);
  });

  test("keeps categories in reading order, not input order", () => {
    const organised = organiseProjects([
      { name: "bublik", desc: "canvas tool" },
      { name: "space", desc: "an operating system" },
      { name: "rv8", desc: "a browser engine" },
    ]);
    expect(organised.map((group) => group.key)).toEqual([
      "os",
      "engines",
      "apps",
    ]);
  });

  test("drops duplicates and blank names", () => {
    const organised = organiseProjects([
      { name: "space", desc: "an operating system" },
      { name: "space", desc: "an operating system" },
      { name: "  ", desc: "nothing" },
    ]);
    expect(organised).toHaveLength(1);
    expect(organised[0]!.items).toHaveLength(1);
  });

  test("everything lands somewhere", () => {
    const organised = organiseProjects([
      { name: "mystery", desc: "" },
      { name: "another", desc: "no keywords at all here" },
    ]);
    expect(organised.flatMap((group) => group.items)).toHaveLength(2);
  });
});
