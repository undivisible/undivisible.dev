"use client";

import { useEffect, useRef, useState } from "react";

/** Three stacked 0–9 strips, so a digit can travel two full turns to land. */
const STRIP = [0, 1, 2].flatMap(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const SPIN_ROWS = 20;

function Digit({
  digit,
  index,
  rolling,
}: {
  digit: number;
  index: number;
  /** False until the number is on screen, so the roll isn't missed. */
  rolling: boolean;
}) {
  const [row, setRow] = useState(digit + SPIN_ROWS);
  const first = useRef(true);

  useEffect(() => {
    if (!rolling) return;
    if (!first.current) {
      setRow(digit);
      return;
    }
    first.current = false;
    // Land after the browser has painted the pre-roll position, otherwise
    // there is nothing to travel from.
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setRow(digit)),
    );
    return () => cancelAnimationFrame(id);
  }, [digit, rolling]);

  return (
    <span className="odo-col" aria-hidden>
      <span
        className="odo-strip"
        style={{
          transform: `translateY(${-row}em)`,
          // Decelerating only — it arrives on the number and stops there.
          // Nothing springs, nothing settles back.
          transitionDelay: `${index * 55}ms`,
        }}
      >
        {STRIP.map((value, position) => (
          <span key={position}>{value}</span>
        ))}
      </span>
    </span>
  );
}

/**
 * Numbers arrive by scrolling into place, the way a split-flap board or a
 * mechanical counter does — each column decelerating onto its digit and
 * stopping dead. No overshoot, no bounce back.
 *
 * The plain value stays in the DOM for anything that isn't looking at it.
 */
export function Odometer({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node || rolling) return;
    if (typeof IntersectionObserver === "undefined") {
      setRolling(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRolling(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rolling]);

  let digitIndex = 0;
  return (
    <span className={`odo ${className}`} ref={host}>
      <span className="odo-sr">{value}</span>
      {value.split("").map((char, index) => {
        if (char < "0" || char > "9") {
          return (
            <span className="odo-sep" key={`${char}-${index}`} aria-hidden>
              {char}
            </span>
          );
        }
        return (
          <Digit
            key={`${index}-${value.length}`}
            digit={Number(char)}
            index={digitIndex++}
            rolling={rolling}
          />
        );
      })}
    </span>
  );
}
