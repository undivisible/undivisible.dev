"use client";

import { HoverCard } from "@/components/lab/HoverCard";
import { LAB_LINKS } from "@/data/lab-facts";
import type { LiveGithub } from "@/hooks/use-live-github";

const numberFormat = new Intl.NumberFormat("en-US");

type Detail = { title: string; body: string; stats: Array<[string, string]> };

function detailFor(name: string, github: LiveGithub): Detail {
  switch (name) {
    case "github":
      return {
        title: "@undivisible",
        body: "compilers, two operating systems, a browser engine, a linux distribution, and the tree-sitter grammars for holyc, v, crystal, nim and lolcode.",
        stats: [
          ["repositories", String(github.repos)],
          ["pull requests", numberFormat.format(github.prsTotal)],
          ["merged", numberFormat.format(github.merged)],
          ["merged elsewhere", numberFormat.format(github.mergedElsewhere)],
        ],
      };
    case "twitter":
      return {
        title: "@makethings4ppl",
        body: "build logs, mostly. things that broke and what the fix turned out to be.",
        stats: [["replies", "faster than email"]],
      };
    case "instagram":
      return {
        title: "@undivisible.dev",
        body: "photographs from wherever the passport last got stamped. no code.",
        stats: [["countries", "10"]],
      };
    case "email":
      return {
        title: "max@tsc.hk",
        body: "the one that reaches me. say the thing in the first line — i read the first line.",
        stats: [["timezone", "whichever one i am in"]],
      };
    default:
      return {
        title: "resume",
        body: "typeset in react and printed by your browser, from the same markdown the site reads. two pages.",
        stats: [["format", "pdf"]],
      };
  }
}

/**
 * The five links, each opening a card that says what is actually behind it —
 * the github one reading the same live numbers as the rest of the page.
 */
export function LinkPills({
  github,
  onResume,
}: {
  github: LiveGithub;
  onResume: () => void;
}) {
  return (
    <nav className="min-pills">
      {LAB_LINKS.map((link) => {
        const detail = detailFor(link.name, github);
        const isResume = link.name === "resume";
        return (
          <HoverCard
            key={link.name}
            className="pill-hc"
            trigger={
              isResume ? (
                <button type="button" className="min-pill" onClick={onResume}>
                  <span>resume</span>
                  <span className="min-pill-handle">pdf</span>
                </button>
              ) : (
                <a
                  className="min-pill"
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  <span>{link.name}</span>
                  <span className="min-pill-handle">{link.handle}</span>
                </a>
              )
            }
          >
            <span className="hc-title">{detail.title}</span>
            <span className="hc-body">{detail.body}</span>
            <span className="hc-stats">
              {detail.stats.map(([label, value]) => (
                <span key={label}>
                  <b>{value}</b>
                  <i>{label}</i>
                </span>
              ))}
            </span>
          </HoverCard>
        );
      })}
    </nav>
  );
}
