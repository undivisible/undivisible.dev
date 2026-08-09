"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IDENTITY } from "@/data/lab-facts";
import { RandomizedText } from "@/components/lab/RandomizedText";
import { hoverNames } from "@/components/info/constants";

/** Everything except the Chinese, which is the thing being hovered. */
const OTHER_SCRIPTS = hoverNames.filter((name) => name !== IDENTITY.hanzi);

const SWAP_MS = 300;
const HOLD_MS = 1900;

/**
 * The hanzi is the hover target: hold it and the same name walks through the
 * other scripts it gets written in — russian, japanese, arabic, hebrew — then
 * settles back to 祁明思 when you let go.
 */
export function NameCycle() {
  const [script, setScript] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const swap = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimers = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (swap.current) clearTimeout(swap.current);
    timer.current = null;
    swap.current = null;
  }, []);

  const start = useCallback(() => {
    if (timer.current) return;
    let index = 0;
    const step = () => {
      setVisible(false);
      swap.current = setTimeout(() => {
        setScript(OTHER_SCRIPTS[index % OTHER_SCRIPTS.length] ?? null);
        setVisible(true);
        index += 1;
      }, SWAP_MS);
    };
    step();
    timer.current = setInterval(step, HOLD_MS);
  }, []);

  const stop = useCallback(() => {
    stopTimers();
    setVisible(false);
    swap.current = setTimeout(() => {
      setScript(null);
      setVisible(true);
    }, SWAP_MS);
  }, [stopTimers]);

  useEffect(() => stopTimers, [stopTimers]);

  return (
    <span className="min-name">
      <RandomizedText className="min-name-latin" split="chars" delay={0.1}>
        {IDENTITY.name}
      </RandomizedText>{" "}
      <span
        className={`min-hanzi ${script ? "is-foreign" : ""}`}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        tabIndex={0}
        role="button"
        aria-label={`${IDENTITY.hanzi} — hold to read the name in other scripts`}
      >
        <span className="min-hanzi-word" style={{ opacity: visible ? 1 : 0 }}>
          {script ?? IDENTITY.hanzi}
        </span>
      </span>
    </span>
  );
}
