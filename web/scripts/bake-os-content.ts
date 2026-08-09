/**
 * Bakes the site's copy into the alpenglowed image as plain text, so the
 * apps inside the VM read the same facts the web pages do. Run before
 * build-os-initramfs.sh; outputs are committed with the overlay.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { GITHUB_ACTIVITY } from "../src/data/github-activity";
import {
  COUNTRIES,
  GHOST_SUFFIXES,
  HEADLINE_WORKS,
  IDENTITY,
  LAB_LINKS,
  MILESTONES,
  STOPS_THIS_YEAR,
  TSCHK,
} from "../src/data/lab-facts";

const OUT = join(import.meta.dir, "../os-image/overlay/usr/share/alpenglowed/content");
await mkdir(OUT, { recursive: true });

const write = (name: string, text: string) =>
  Bun.write(join(OUT, name), text.trimEnd() + "\n");

await write(
  "about.txt",
  `
  \x1b[1;37m${IDENTITY.name}\x1b[0m  (qi ming si — the vga console cannot draw 祁明思)

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
    (w) => `  \x1b[96m${w.name}\x1b[0m  \x1b[90m${w.what} · ${w.stat}\x1b[0m
    ${w.line}
`,
  ).join("\n")}`,
);

await write(
  "route.txt",
  `
  \x1b[1;37mthis year, at seventeen\x1b[0m

  ${STOPS_THIS_YEAR.map((s) => s.code).join(" -> ")}

${STOPS_THIS_YEAR.filter((s) => s.note).map((s) => `    ${s.code}  ${s.city} — ${s.note}`).join("\n")}

  ${COUNTRIES.length} countries so far; seven of them inside one year.
`,
);

await write(
  "before17.txt",
  `
  \x1b[1;37mbefore seventeen\x1b[0m

${MILESTONES.map((m) => `  \x1b[96m${m.age.padStart(2)}\x1b[0m  ${m.title}
      \x1b[90m${m.detail}\x1b[0m
`).join("\n")}`,
);

await write(
  "activity.txt",
  `
  \x1b[1;37m2026, on github\x1b[0m  \x1b[90m(snapshot baked ${GITHUB_ACTIVITY.verifiedAt}; the live numbers are on github.com/${GITHUB_ACTIVITY.author})\x1b[0m

    ${GITHUB_ACTIVITY.account.pullRequestsThisYear.toLocaleString("en-US")} pull requests this year
    ${GITHUB_ACTIVITY.account.merged.toLocaleString("en-US")} merged — ${GITHUB_ACTIVITY.account.mergedElsewhere} into repositories that aren't mine
    ${GITHUB_ACTIVITY.account.commitsThisYear.toLocaleString("en-US")} commits this year
    ${GITHUB_ACTIVITY.account.repos} repositories

    ${GITHUB_ACTIVITY.account.closedUnmerged} closed without merging — nearly all by me. not rejections.

  recent merged on ${GITHUB_ACTIVITY.repo}:
${GITHUB_ACTIVITY.recentMerged.slice(0, 5).map((pr) => `    ${pr.mergedAt}  ${pr.title}`).join("\n")}
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

${SITES.map(([label, url], index) => `  ${String(index + 1).padStart(2)}) ${label}  \x1b[90m${url}\x1b[0m`).join("\n")}
`,
);
console.log("baked", OUT);
