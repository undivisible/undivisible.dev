#!/usr/bin/env node
/**
 * crepus web escapes all HTML in site.json strings. We inject link tokens in
 * site.json and replace them here with real anchors after `crepus web build`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const REPLACEMENTS = [
  [
    "__GH_SEMITECH_CREPUSCULARITY__",
    "https://github.com/semitechnological/crepuscularity",
    "crepuscularity",
  ],
  [
    "__GH_UNDIVISIBLE_ANYWHERE__",
    "https://github.com/undivisible/anywhere",
    "anywhere",
  ],
  [
    "__GH_UNDIVISIBLE_POKE_AROUND__",
    "https://github.com/undivisible/poke-around",
    "poke-around",
  ],
  [
    "__GH_UNDIVISIBLE_TILE__",
    "https://github.com/undivisible/tile",
    "tile",
  ],
  [
    "__GH_UNDIVISIBLE_RUSTY_AI__",
    "https://github.com/undivisible/rusty_ai",
    "rusty_ai",
  ],
  [
    "__GH_UNDIVISIBLE_RUSTY_FM__",
    "https://github.com/undivisible/rusty_foundationmodels",
    "rusty_foundationmodels",
  ],
  [
    "__GH_UNDIVISIBLE_UNTHINKMAIL__",
    "https://github.com/undivisible/unthinkmail",
    "unthinkmail",
  ],
  [
    "__GH_UNDIVISIBLE_UNTHINKCLAW__",
    "https://github.com/undivisible/unthinkclaw",
    "unthinkclaw",
  ],
  [
    "__GH_SEMITECH_EQUILIBRIUM__",
    "https://github.com/semitechnological/equilibrium",
    "equilibrium",
  ],
  [
    "__GH_UNDIVISIBLE_ALPHABETS__",
    "https://github.com/undivisible/alphabets",
    "alphabets",
  ],
  [
    "__GH_UNDIVISIBLE_STANDPOINT__",
    "https://github.com/undivisible/standpoint",
    "standpoint",
  ],
  [
    "__GH_SEMITECH_WAX__",
    "https://github.com/semitechnological/wax",
    "wax",
  ],
  [
    "__GH_UNDIVISIBLE_BUBLIK__",
    "https://github.com/undivisible/bublik",
    "bublik",
  ],
  [
    "__GH_ATECH_SERVO__",
    "https://github.com/atechnology-company/servo",
    "atechnology-company/servo",
  ],
  [
    "__GH_ATECH_RUSTY_V8__",
    "https://github.com/atechnology-company/rusty_v8",
    "atechnology-company/rusty_v8",
  ],
  [
    "__GH_ORG_ATECH__",
    "https://github.com/atechnology-company",
    "atechnology-company",
  ],
  [
    "__GH_ORG_UNDIVISIBLE__",
    "https://github.com/undivisible",
    "github.com/undivisible",
  ],
  [
    "__GH_ORG_SEMITECH__",
    "https://github.com/semitechnological",
    "github.com/semitechnological",
  ],
  [
    "__GH_UNDIVISIBLE_ATECH_COMPANY__",
    "https://github.com/undivisible/atechnology.company",
    "atechnology.company",
  ],
];

const target = resolve(root, process.argv[2] || "dist/index.html");
let html = readFileSync(target, "utf8");
for (const [token, href, label] of REPLACEMENTS) {
  const anchor = `<a href="${href}" rel="noopener noreferrer" target="_blank">${label}</a>`;
  if (!html.includes(token)) {
    console.warn("warning: token not found:", token);
  }
  html = html.split(token).join(anchor);
}
writeFileSync(target, html);
console.log("applied link placeholders:", target);
