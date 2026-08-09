"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GHOST_SOURCE, GHOST_SUFFIXES } from "@/data/lab-facts";
import { HoverCard } from "@/components/lab/HoverCard";
import { TerryCard } from "@/components/lab/TerryCard";

const CYCLE_MS = 3400;
const SWAP_MS = 240;

/**
 * "the ghost of terry davis, but ___".
 *
 * Three things open here. "the ghost of" says where the construction came
 * from, terry's name says who he was, and the blank says the other half of
 * its own joke — which is why the cycle stops while you're holding it.
 */
export function GhostTagline({
  className = "",
  suffixClassName = "",
  /** Renders the suffix on its own line, for the display-scale settings. */
  block = false,
  /** Lets the page read the blank that is currently showing. */
  onSuffixChange,
}: {
  className?: string;
  suffixClassName?: string;
  block?: boolean;
  onSuffixChange?: (suffix: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [held, setHeld] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback((step = 1) => {
    setSwapping(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIndex((current) => (current + step) % GHOST_SUFFIXES.length);
      setSwapping(false);
    }, SWAP_MS);
  }, []);

  useEffect(() => {
    if (held) return undefined;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    const id = setInterval(() => advance(1), CYCLE_MS);
    return () => clearInterval(id);
  }, [advance, held]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const current = GHOST_SUFFIXES[index] ?? GHOST_SUFFIXES[0]!;

  useEffect(() => {
    onSuffixChange?.(current.word);
  }, [current.word, onSuffixChange]);

  return (
    <span className={className}>
      <HoverCard
        className="ghost-src"
        align="start"
        trigger={<span className="ghost-src-word">the ghost of</span>}
      >
        <span className="hc-title">{GHOST_SOURCE.title}</span>
        <span className="hc-body">{GHOST_SOURCE.body}</span>
        <span className="hc-note">{GHOST_SOURCE.note}</span>
      </HoverCard>{" "}
      <TerryCard>terry davis</TerryCard>,{block ? <br /> : " "}but{" "}
      <HoverCard
        className="ghost-blank"
        onOpen={() => setHeld(true)}
        onClose={() => setHeld(false)}
        trigger={
          <button
            type="button"
            className={`lab-suffix ${swapping ? "is-swapping" : ""} ${suffixClassName}`}
            onClick={(event) => {
              event.stopPropagation();
              advance(1);
            }}
            aria-label={`but ${current.word}. Click for the next one.`}
          >
            {current.word}
          </button>
        }
      >
        <span className="hc-body">{current.note}</span>
      </HoverCard>
    </span>
  );
}
