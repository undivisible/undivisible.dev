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
 * The hanzi is the hover target. Hold it and the same name appears underneath
 * in the other scripts it gets written in — russian, japanese, arabic, hebrew
 * — one at a time. 祁明思 itself never moves.
 */
export function NameCycle() {
  const [script, setScript] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
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
    // The first one lands immediately; there is nothing to fade out of yet.
    setScript(OTHER_SCRIPTS[0] ?? null);
    setVisible(true);
    index = 1;
    timer.current = setInterval(step, HOLD_MS);
  }, []);

  const stop = useCallback(() => {
    stopTimers();
    setVisible(false);
    swap.current = setTimeout(() => setScript(null), SWAP_MS);
  }, [stopTimers]);

  useEffect(() => stopTimers, [stopTimers]);

  return (
    <span className="min-name">
      <RandomizedText className="min-name-latin" split="chars" delay={0.1}>
        {IDENTITY.name}
      </RandomizedText>{" "}
      <span
        className="min-hanzi"
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        tabIndex={0}
        role="button"
        aria-label={`${IDENTITY.hanzi} — hold to read the name in other scripts`}
      >
        {IDENTITY.hanzi}
      </span>
      {/* The other scripts get their own line under the name, with the room
          reserved so nothing below moves when one appears. */}
      <span className="min-scripts" aria-hidden>
        <span className="min-script" style={{ opacity: visible ? 1 : 0 }}>
          {script ?? " "}
        </span>
      </span>
    </span>
  );
}
