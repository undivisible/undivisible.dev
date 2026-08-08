"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GHOST_SUFFIXES, TERRY_URL } from "@/data/lab-facts";

const CYCLE_MS = 3400;
const SWAP_MS = 240;

/**
 * "the ghost of terry davis, but ___" — the blank cycles on its own and
 * clicking it advances by hand. Terry's name is a plain link; no hover card.
 */
export function GhostTagline({
  className = "",
  suffixClassName = "",
  /** Renders the suffix on its own line, for the display-scale settings. */
  block = false,
}: {
  className?: string;
  suffixClassName?: string;
  block?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);
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
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    const id = setInterval(() => advance(1), CYCLE_MS);
    return () => clearInterval(id);
  }, [advance]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <span className={className}>
      the ghost of{" "}
      <a
        className="lab-terry"
        href={TERRY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        terry davis
      </a>
      ,{block ? <br /> : " "}but{" "}
      <button
        type="button"
        className={`lab-suffix ${swapping ? "is-swapping" : ""} ${suffixClassName}`}
        onClick={(event) => {
          event.stopPropagation();
          advance(1);
        }}
        aria-label={`but ${GHOST_SUFFIXES[index]}. Click for the next one.`}
      >
        {GHOST_SUFFIXES[index]}
      </button>
    </span>
  );
}
