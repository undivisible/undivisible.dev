"use client";

import { useEffect, useRef, useState } from "react";
import { GITHUB_ACTIVITY } from "@/data/github-activity";
import {
  COUNTRIES,
  GHOST_SUFFIXES,
  MILESTONES,
  STOPS_THIS_YEAR,
} from "@/data/lab-facts";
import { OS_APPS } from "@/lib/os/apps";

type Line = { text: string; kind?: "in" | "err" | "gold" };

const NEOFETCH = String.raw`
        /\             max@alpenglow-web
       /  \            ─────────────────
      / /\ \           os       alpenglow (web build)
     / /  \ \          host     your browser, technically
    / / /\ \ \         kernel   moonshine 0.3.3
   / / /  \ \ \        de       alpenglowed
  / / / /\ \ \ \       shell    alpenglow sh
 /_/_/ /  \ \_\_\      uptime   since age 6
      /____\           packages ${GITHUB_ACTIVITY.account.repos} (github)
                       memory   whatever the tab got
`;

const TEMPLE_LINES = [
  "An idiot admires complexity, a genius admires simplicity.",
  "640x480 16 color was a covenant, not a limitation.",
  "The best line of code is the one you didn't write.",
  "God's temple runs at 60fps with no v-sync tearing.",
];

/** The commands. Lowercase in, lowercase out — the site's one voice. */
function run(
  input: string,
  print: (lines: Line[]) => void,
  actions: { open: (id: string) => void; temple: () => void; clear: () => void },
): void {
  const [cmd = "", ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(" ");

  switch (cmd) {
    case "":
      return;
    case "help":
      print(
        [
          "alpenglow sh — the web build",
          "",
          "  help        this",
          "  ls          list apps",
          "  open <app>  open a window",
          "  neofetch    obviously",
          "  whoami      who i am",
          "  uname -a    what this is",
          "  uptime      how long this has been going",
          "  ghost       the tagline, all thirteen",
          "  route       this year's airports",
          "  history     before 17",
          "  terry       him",
          "  temple      you'll see",
          "  clear       clear",
          "",
          "some commands aren't listed. that's what makes them commands worth finding.",
        ].map((text) => ({ text })),
      );
      return;
    case "ls":
      print(
        OS_APPS.map((app) => ({
          text: `${app.title.padEnd(26)} ${app.subtitle}`,
        })),
      );
      return;
    case "open": {
      const app = OS_APPS.find(
        (candidate) =>
          candidate.id === arg || candidate.title === arg.toLowerCase(),
      );
      if (app) {
        actions.open(app.id);
        print([{ text: `opening ${app.title}…` }]);
      } else {
        print([{ text: `open: ${arg || "(nothing)"}: no such app`, kind: "err" }]);
      }
      return;
    }
    case "neofetch":
    case "fastfetch":
      print(NEOFETCH.split("\n").map((text) => ({ text, kind: "gold" })));
      return;
    case "whoami":
      print([
        { text: "max carter. 祁明思. founding engineer at based hardware." },
        { text: "the ghost of terry davis, but in your browser." },
      ]);
      return;
    case "uname":
      print([
        {
          text: "alpenglow-web moonshine-0.3.3 crepuscularity x86_64-browser GNU/hopes-and-dreams",
        },
      ]);
      return;
    case "uptime":
      print([
        { text: "up since age 6. load average: high, high, high." },
      ]);
      return;
    case "ghost":
      print(
        GHOST_SUFFIXES.map((suffix) => ({
          text: `the ghost of terry davis, but ${suffix.word}`,
        })),
      );
      return;
    case "route":
      print([
        { text: STOPS_THIS_YEAR.map((stop) => stop.code).join(" → ") },
        { text: `${COUNTRIES.length} countries so far. seven inside one year.` },
      ]);
      return;
    case "history":
      print(
        MILESTONES.map((milestone) => ({
          text: `${milestone.age.padStart(2)}  ${milestone.title}`,
        })),
      );
      return;
    case "terry":
      print([
        { text: "terrence andrew davis, 1969–2018." },
        { text: "wrote an operating system alone: kernel, compiler, language." },
        { text: "the tagline on this site is not a joke at his expense." },
        { text: "try: temple" },
      ]);
      return;
    case "temple":
      actions.temple();
      print([
        { text: TEMPLE_LINES[Math.floor(Math.random() * TEMPLE_LINES.length)]!, kind: "gold" },
        { text: "(run temple again to come back)", kind: "gold" },
      ]);
      return;
    case "holyc":
      print([
        { text: 'U0 Main() { "hello, world\\n"; }' },
        { text: "i wrote the tree-sitter grammar. github.com/undivisible/tree-sitter-holyc" },
      ]);
      return;
    case "sudo":
      print([
        {
          text: "max is not in the sudoers file. this incident will be reported to nobody, it's a website.",
          kind: "err",
        },
      ]);
      return;
    case "rm":
      if (arg.includes("-rf") && (arg.includes("/") || arg.includes("*"))) {
        print([
          { text: "no." },
          { text: "(the real alpenglow runs from ram — it would survive you anyway.)" },
        ]);
      } else {
        print([{ text: `rm: cannot remove '${arg}': read-only universe`, kind: "err" }]);
      }
      return;
    case "vim":
    case "nvim":
      print([{ text: "you'd never leave. try vro instead — github.com/undivisible/vro" }]);
      return;
    case "emacs":
      print([{ text: "wrong church. this is a temple." }]);
      return;
    case "peggy":
    case "jpegmafia":
      print([
        { text: "the ghost~pop tape, 2017." },
        { text: "the ghost of ranking dread — all my heroes are cornballs." },
        { text: "the ghost of emmett till — experimental rap 2026." },
        { text: "the construction is borrowed. the ghost is not." },
      ]);
      return;
    case "cowsay":
      print(
        [
          ` ${"_".repeat((arg || "moo").length + 2)}`,
          `< ${arg || "moo"} >`,
          ` ${"-".repeat((arg || "moo").length + 2)}`,
          String.raw`        \   ^__^`,
          String.raw`         \  (oo)\_______`,
          String.raw`            (__)\       )\/\ `,
          String.raw`                ||----w |`,
          String.raw`                ||     ||`,
        ].map((text) => ({ text })),
      );
      return;
    case "exit":
    case "logout":
      print([{ text: "there is no logout. there is only the tab close button." }]);
      return;
    case "clear":
      actions.clear();
      return;
    case "curl":
      print([{ text: `curl: (7) this shell is a bit. the sites are real though — try ls` }]);
      return;
    case "cat":
      if (arg === "/etc/os-release") {
        print([
          { text: 'NAME="alpenglow"' },
          { text: 'PRETTY_NAME="alpenglow (web build)"' },
          { text: 'HOME_URL="https://alpenglow.tsc.hk"' },
          { text: 'BUG_REPORT_URL="mailto:max@tsc.hk"' },
        ]);
      } else {
        print([{ text: `cat: ${arg || "(nothing)"}: no such file`, kind: "err" }]);
      }
      return;
    default:
      print([
        {
          text: `${cmd}: command not found. try help — or don't, some of the good ones aren't in it.`,
          kind: "err",
        },
      ]);
  }
}

/**
 * alpenglow sh. A bit that commits to itself — every command answers, the
 * fun ones aren't documented, and `temple` keeps a promise this site has
 * been making since the tagline.
 */
export function TerminalApp({
  openApp,
  onTemple,
}: {
  openApp: (id: string) => void;
  onTemple: () => void;
}) {
  const [lines, setLines] = useState<Line[]>([
    { text: "alpenglow sh — type help, or guess" },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  // A terminal you have to click into first isn't a terminal.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const input = value;
    setValue("");
    setCursor(-1);
    if (input.trim()) setHistory((current) => [input, ...current].slice(0, 60));
    setLines((current) => [...current, { text: `> ${input}`, kind: "in" }]);
    run(input, (out) => setLines((current) => [...current, ...out]), {
      open: openApp,
      temple: onTemple,
      clear: () => setLines([]),
    });
  };

  return (
    <div className="term" onClick={() => inputRef.current?.focus()}>
      <div className="term-scroll" ref={scroller}>
        {lines.map((line, index) => (
          <pre key={index} className={`term-line ${line.kind ?? ""}`}>
            {line.text || " "}
          </pre>
        ))}
      </div>
      <div className="term-input-row">
        <span className="term-prompt">&gt;</span>
        <input
          ref={inputRef}
          className="term-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
            if (event.key === "ArrowUp") {
              event.preventDefault();
              const next = Math.min(cursor + 1, history.length - 1);
              setCursor(next);
              setValue(history[next] ?? "");
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              const next = Math.max(cursor - 1, -1);
              setCursor(next);
              setValue(next === -1 ? "" : (history[next] ?? ""));
            }
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="terminal input"
        />
      </div>
    </div>
  );
}
