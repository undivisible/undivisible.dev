"use client";

import { useEffect, useRef, useState } from "react";
import { RandomizedText } from "@/components/lab/RandomizedText";
import { usePromptApi } from "@/hooks/use-prompt-api";
import type { MergedPr } from "@/hooks/use-live-github";

const SYSTEM = [
  "You explain what a pull request did, to a reader who does not know the codebase.",
  "You are given only its title and the repository. Say what the change most likely does and why someone would want it.",
  "Voice: lowercase, plain, concrete. two sentences, under 40 words total.",
  "Never invent file names, numbers, issue references or people. If the title is too thin to explain, say what area of the codebase it touches and stop.",
  "Output the sentences only.",
].join(" ");

/**
 * The merged pull requests, each one explained by the visitor's own browser.
 *
 * Chrome ships a small language model on the device. When it's there, hovering
 * a row asks it what the change did — from the title alone, on the visitor's
 * machine, nothing sent anywhere. When it isn't there, the row is just a link:
 * no card, no placeholder, no apology.
 */
export function MergedPrList({ items }: { items: MergedPr[] }) {
  const api = usePromptApi(SYSTEM);
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const asked = useRef<Set<string>>(new Set());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // Nothing to offer, so offer nothing — the list stays a list.
  const canExplain = api.state === "ready" || api.state === "running";

  const enter = (pr: MergedPr) => {
    if (!canExplain) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(pr.url);
    if (asked.current.has(pr.url)) return;
    asked.current.add(pr.url);
    void api.run(
      `repository: ${pr.repo}\npull request title: ${pr.title}\n\nexplain it.`,
      (text) => setNotes((current) => ({ ...current, [pr.url]: text })),
    );
  };

  const leave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 90);
  };

  return (
    <ul className={`min-merged ${canExplain ? "can-explain" : ""}`}>
      {items.map((pr) => {
        const isOpen = open === pr.url;
        const note = notes[pr.url];
        return (
          <li
            key={pr.url}
            className={isOpen ? "is-open" : ""}
            onMouseEnter={() => enter(pr)}
            onMouseLeave={leave}
          >
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              onFocus={() => enter(pr)}
              onBlur={leave}
            >
              <time>{pr.mergedAt.slice(5)}</time>
              <span>{pr.title}</span>
              <i className="min-merged-repo">{pr.repo.split("/")[1] ?? pr.repo}</i>
            </a>
            {canExplain && isOpen ? (
              <span className="pr-note" role="tooltip">
                <span className="hc-blur" aria-hidden />
                <span className="pr-note-body">
                  {note ? (
                    <RandomizedText delay={0.02}>{note}</RandomizedText>
                  ) : (
                    <span className="pr-note-wait">
                      your browser is reading it
                      <i />
                    </span>
                  )}
                </span>
                <span className="pr-note-tag">
                  written on your machine · {pr.repo}
                </span>
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
