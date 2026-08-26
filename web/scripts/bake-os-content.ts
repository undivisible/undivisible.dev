/**
 * Bakes the site's copy into the undesk image as plain text, so the
 * apps inside the VM read the same facts the web pages do. Run before
 * build-os-initramfs.sh; outputs are committed with the overlay.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { GITHUB_ACTIVITY } from "../src/data/github-activity";
import {
  COUNTRIES,
  GHOST_SOURCE,
  GHOST_SUFFIXES,
  HEADLINE_WORKS,
  IDENTITY,
  LAB_LINKS,
  MILESTONES,
  STOPS_THIS_YEAR,
  TERRY,
  TSCHK,
  QUOTES,
  PHILOSOPHY,
} from "../src/data/lab-facts";

const OUT = join(import.meta.dir, "../os-image/overlay/usr/share/undesk/content");
await mkdir(OUT, { recursive: true });

/** The console font is CP437; bake pure ASCII so nothing renders as mojibake. */
const asciify = (text: string) =>
  text
    .replaceAll("\u2014", "--")
    .replaceAll("\u2013", "-")
    .replaceAll("\u00b7", "|")
    .replaceAll("\u2018", "'")
    .replaceAll("\u2019", "'")
    .replaceAll("\u201c", '"')
    .replaceAll("\u201d", '"')
    .replaceAll("\u2192", "->")
    .replaceAll("\u2605", "*")
    .replaceAll("\u2606", "*")
    .replace(/[^\x00-\x7f]/g, "?");

/** Panels don't word-wrap; fold long copy at bake time. */
const wrap = (text: string, width = 88, indent = "      ") => {
  const words = text.split(/\s+/);
  const rows: string[] = [];
  let row = "";
  for (const w of words) {
    if (row && row.length + 1 + w.length > width) { rows.push(row); row = w; }
    else row = row ? `${row} ${w}` : w;
  }
  if (row) rows.push(row);
  return rows.join(`\x1b[0m\n${indent}\x1b[90m`);
};

const write = (name: string, text: string) =>
  Bun.write(join(OUT, name), asciify(text).trimEnd() + "\n");

await write(
  "about.txt",
  `
  \x1b[1;37m${IDENTITY.name}\x1b[0m  (qi ming si; the console font cannot draw the hanzi)

  the ghost of terry davis, but ${GHOST_SUFFIXES[0]?.word ?? "asian"}.
  (the blank rotates: ${GHOST_SUFFIXES.slice(1, 6).map((s) => s.word).join(" · ")} …)

  ${IDENTITY.role} at ${IDENTITY.org} — on ${IDENTITY.product}: the
  platform underneath and the product on top. not the firmware.

  links
${LAB_LINKS.map((l) => `    ${l.name.padEnd(10)} ${"href" in l ? l.href : ""}`).join("\n")}

  this machine is a real i686 linux, emulated on your cpu by v86,
  booting the real alpenglow browser image. the whole site is inside it.
`,
);

await write(
  "works.txt",
  `
  \x1b[1;37mheadline works\x1b[0m — all under ${TSCHK.name}, ${TSCHK.full}

${HEADLINE_WORKS.map(
    (w) => `  \x1b[96m${w.name}\x1b[0m  \x1b[90m${w.what} ·\x1b[0m \x1b[93m${w.stat}\x1b[0m
    ${w.line}
`,
  ).join("\n")}`,
);

await write(
  "route.txt",
  `
  \x1b[1;37mthis year, at seventeen\x1b[0m

  ${STOPS_THIS_YEAR.map((s) => `\x1b[93m${s.code}\x1b[0m`).join(" \x1b[90m->\x1b[0m ")}

${STOPS_THIS_YEAR.filter((s) => s.note).map((s) => `    \x1b[93m${s.code}\x1b[0m  ${s.city} — \x1b[90m${s.note}\x1b[0m`).join("\n")}

  \x1b[93m${COUNTRIES.length}\x1b[0m countries so far; seven of them inside one year.
`,
);

await write(
  "before17.txt",
  `
  \x1b[1;37mbefore seventeen\x1b[0m

${MILESTONES.map((m) => `  \x1b[93m${m.age.padStart(2)}\x1b[0m  \x1b[96m${m.title}\x1b[0m
      \x1b[90m${wrap(m.detail)}\x1b[0m
`).join("\n")}`,
);

await write(
  "activity.txt",
  `
  \x1b[1;37m2026, on github\x1b[0m  \x1b[90m(snapshot baked ${GITHUB_ACTIVITY.verifiedAt}; the live numbers are on github.com/${GITHUB_ACTIVITY.author})\x1b[0m

    \x1b[93m${GITHUB_ACTIVITY.account.pullRequestsThisYear.toLocaleString("en-US")}\x1b[0m pull requests this year
    \x1b[92m${GITHUB_ACTIVITY.account.merged.toLocaleString("en-US")}\x1b[0m merged — \x1b[92m${GITHUB_ACTIVITY.account.mergedElsewhere}\x1b[0m into repositories that aren't mine
    \x1b[93m${GITHUB_ACTIVITY.account.commitsThisYear.toLocaleString("en-US")}\x1b[0m commits this year
    \x1b[93m${GITHUB_ACTIVITY.account.repos}\x1b[0m repositories

    ${GITHUB_ACTIVITY.account.closedUnmerged} closed without merging — nearly all by me. not rejections.

  recent merged on ${GITHUB_ACTIVITY.repo}:
${GITHUB_ACTIVITY.recentMerged.slice(0, 5).map((pr) => `    \x1b[90m${pr.mergedAt}\x1b[0m  ${pr.title}`).join("\n")}
`,
);

const SITES: Array<[string, string]> = [
  ["tsc.hk — the software company of hong kong", "https://tsc.hk"],
  ["crepuscularity — one codebase, every platform", "https://crepuscularity.undivisible.dev"],
  ["moonshine — renders the host site", "https://moonshine.tsc.hk"],
  ["inauguration — forty languages, no llvm", "https://inauguration.tsc.hk"],
  ["alpenglow — this machine, natively", "https://alpenglow.tsc.hk"],
  ["space — the os the compiler grew", "https://space.tsc.hk"],
  ["notes", "https://notes.undivisible.dev"],
  ["standpoint", "https://standpoint.undivisible.dev"],
  ["alphabets", "https://alphabets.undivisible.dev"],
  ["bublik", "https://bublik.undivisible.dev"],
  ["crates download history", "https://cratesdownloadhistory.undivisible.dev"],
  ["github", "https://github.com/undivisible"],
];
await write(
  "sites.txt",
  `
  \x1b[1;37mthe software, deployed\x1b[0m

${SITES.map(([label, url], index) => `  \x1b[93m${String(index + 1).padStart(2)})\x1b[0m \x1b[96m${label.split(" — ")[0]}\x1b[0m${label.includes(" — ") ? ` — ${label.split(" — ")[1]}` : ""}  \x1b[90m${url}\x1b[0m`).join("\n")}
`,
);
await write(
  "quotes.txt",
  `
  \x1b[1;37msix quotes\x1b[0m

${QUOTES.map((q, i) => `
  \x1b[93m${i + 1}\x1b[0m
  \x1b[96m${wrap(q.text, 68, "  ")}\x1b[0m
  \x1b[90m-- ${q.credit}${q.source ? `, ${q.source}` : ""}\x1b[0m
`).join("\n")}

  \x1b[90m  arrow keys scroll  |  q to close\x1b[0m
`,
);
await write(
  "philosophy.txt",
  `
  \x1b[1;37mreading\x1b[0m

  \x1b[96m${PHILOSOPHY.currentReading.title}\x1b[0m  --  \x1b[90m${PHILOSOPHY.currentReading.author}\x1b[0m


  \x1b[1;37mfavourites\x1b[0m

${PHILOSOPHY.favourites.map((f) => `    \x1b[93m${f.name}\x1b[0m      \x1b[90m${f.work}\x1b[0m`).join("\n")}

  \x1b[1;37mnext\x1b[0m

${PHILOSOPHY.next.map((n) => `    \x1b[96m${n.name}\x1b[0m  \x1b[90m-- ${n.work}\x1b[0m`).join("\n")}


  \x1b[90m????? ??? -- investigate things, extend knowledge\x1b[0m

  \x1b[90m  arrow keys scroll  |  q to close\x1b[0m
`,
);
await write(
  "photos.txt",
  `
  \x1b[1;37mphotos\x1b[0m

  \x1b[90mInstagram has no public highlight API. The photos feed loads
   from a local source instead.\x1b[0m

  \x1b[93mupdate path\x1b[0m

  \x1b[90mDrop a JSON array into\x1b[0m
  \x1b[96m  photos/feed.json\x1b[0m
  \x1b[90mat the site root, with each entry:\x1b[0m

  \x1b[90m  { "src": "url", "alt": "description", "date": "2026-01-01" }\x1b[0m

  \x1b[90mThe app reads it and renders the roll. No build step needed.\x1b[0m


  \x1b[1;37minstagram\x1b[0m

  \x1b[90mFollow\x1b[0m \x1b[96m@undivisible.dev\x1b[0m \x1b[90mon instagram for the live feed.
   The highlight archive is not scraped -- this app uses the same
   local-feed convention the rest of the site does for dynamic data.\x1b[0m


  \x1b[90m  arrow keys scroll  |  q to close\x1b[0m
`,
);
await write(
  "crepuscularity.txt",
  `
  \x1b[1;37mcrepuscularity\x1b[0m

  \x1b[96mthe framework\x1b[0m  --  \x1b[90mone codebase, every platform\x1b[0m

  \x1b[90mWrite .crepus templates in a DSL that compiles to GPUI desktop,
  web WASM, SwiftUI, Jetpack Compose, Ratatui TUI, embedded LVGL,
  and browser extensions -- all from the same source.\x1b[0m


  \x1b[93mthe host browser is opening\x1b[0m \x1b[96mcrepuscularity.tsc.hk\x1b[0m

  \x1b[90m(Framebuffer graphics on this machine cannot render a modern web
  app. The site opens in your real browser as a host tab.)\x1b[0m

  \x1b[90m  arrow keys scroll  |  q to close\x1b[0m
`,
);

console.log("baked", OUT);

// The hover cards: one record per line, `word\ttitle\tbody`, so the name
// widget can pop the same wikipedia-style note the almanac shows when you
// hover a tagline. `terry` and `omi` are the two proper-noun cards; the
// rest are the rotating suffixes.
const hover = [
  ["terry", TERRY.name, `${TERRY.years}. ${TERRY.body} ${TERRY.mine}`],
  ["ghost", GHOST_SOURCE.title, `${GHOST_SOURCE.body} ${GHOST_SOURCE.note}`],
  ...GHOST_SUFFIXES.map((s) => [s.word, `but ${s.word}`, s.note]),
];
await write(
  "hovers.txt",
  hover.map(([w, t, b]) => `${w}\t${t}\t${b}`).join("\n"),
);
