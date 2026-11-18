// Inventory-only subset of github-linguist/linguist languages.yml at:
// https://github.com/github-linguist/linguist/blob/14ac04abe3e3722e42c52489b377d9d4118fc8b6/lib/linguist/languages.yml
// null means Linguist does not assign a colour. Unlisted languages use the same
// explicitly non-canonical neutral fallback, never an inferred language colour.
//
// Copyright (c) 2017 GitHub, Inc.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export const githubLanguageColors: Readonly<Record<string, string | null>> = {
  AMPL: "#E6EFBB",
  "ASP.NET": "#9400ff",
  Assembly: "#6E4C13",
  Astro: "#ff5a03",
  C: "#555555",
  "C#": "#7355dd",
  "C++": "#f34b7d",
  CMake: "#DA3434",
  CSS: "#663399",
  Clojure: "#db5855",
  Crystal: "#000100",
  D: "#ba595e",
  Dart: "#00B4AB",
  Dockerfile: "#384d54",
  Elixir: "#8847B9",
  Erlang: "#B83998",
  "F#": "#b845fc",
  Go: "#00ADD8",
  Groovy: "#4298b8",
  HCL: "#844FBA",
  HTML: "#e34c26",
  Hare: "#9d7424",
  HolyC: "#ffefaf",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  Julia: "#a270ba",
  Kotlin: "#A97BFF",
  LOLCODE: "#cc9900",
  "Linker Script": null,
  Lua: "#000080",
  Makefile: "#427819",
  Nim: "#ffc200",
  OCaml: "#ef7a08",
  "Objective-C": "#438eff",
  "Objective-C++": "#6866fb",
  Odin: "#60AFFE",
  PHP: "#4F5D95",
  Perl: "#0298c3",
  PowerShell: "#012456",
  Python: "#3572A5",
  R: "#198CE7",
  RPC: null,
  Ruby: "#701516",
  Rust: "#dea584",
  Scala: "#c22d40",
  Shell: "#89e051",
  Sieve: null,
  Svelte: "#ff3e00",
  Swift: "#F05138",
  "Tree-sitter Query": "#8ea64c",
  TypeScript: "#3178c6",
  V: "#4f87c4",
  "Visual Basic .NET": "#945db7",
  WGSL: "#1a5e9a",
  Zig: "#ec915c",
};
