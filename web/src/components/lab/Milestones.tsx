"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RandomizedText } from "@/components/lab/RandomizedText";
import { MILESTONES } from "@/data/lab-facts";

const DWELL_MS = 4200;

/**
 * Not a timeline — a dial. The ages sit on one line and the page moves through
 * them on its own so the interaction demonstrates itself; the moment the
 * cursor lands on an age it hands over control and stops advancing.
 */
export function Milestones() {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    if (held) {
      clear();
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    timer.current = setInterval(
      () => setIndex((current) => (current + 1) % MILESTONES.length),
      DWELL_MS,
    );
    return clear;
  }, [held, clear]);

  const active = MILESTONES[index] ?? MILESTONES[0];
  if (!active) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setHeld(true);
    setIndex((current) => {
      const step = event.key === "ArrowRight" ? 1 : -1;
      return (current + step + MILESTONES.length) % MILESTONES.length;
    });
  };

  return (
    <div
      className={`min-ages ${held ? "is-held" : ""}`}
      onMouseLeave={() => setHeld(false)}
    >
      <div
        className="min-ages-scale"
        role="tablist"
        aria-label="Before seventeen"
        onKeyDown={onKeyDown}
      >
        <span
          className="min-ages-bar"
          aria-hidden
          style={{
            left: `${(index / MILESTONES.length) * 100}%`,
            width: `${100 / MILESTONES.length}%`,
          }}
        />
        {MILESTONES.map((milestone, position) => (
          <button
            key={`${milestone.age}-${position}`}
            type="button"
            role="tab"
            aria-selected={position === index}
            className="min-age"
            onMouseEnter={() => {
              setHeld(true);
              setIndex(position);
            }}
            onFocus={() => {
              setHeld(true);
              setIndex(position);
            }}
            onClick={() => {
              setHeld(true);
              setIndex(position);
            }}
          >
            {milestone.age}
          </button>
        ))}
      </div>

      <div className="min-ages-copy" key={index}>
        <p className="min-ages-title">
          <RandomizedText delay={0.02}>{active.title}</RandomizedText>
        </p>
        <p className="min-ages-detail">
          <RandomizedText delay={0.08}>{active.detail}</RandomizedText>
        </p>
      </div>

      <p className="min-ages-hint" aria-hidden>
        {held ? "yours" : "moving on its own — take an age"}
      </p>
    </div>
  );
}
