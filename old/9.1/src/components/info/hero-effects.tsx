"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RandomizedText } from "@/components/randomized-text";

export function AnimatedText({
  text,
  className = "",
  split = "words",
}: {
  text: string;
  className?: string;
  split?: "words" | "chars";
}) {
  return (
    <RandomizedText split={split} className={className}>
      {text}
    </RandomizedText>
  );
}

export function MorphWord({ words }: { words: string[] }) {
  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const resetFrame = window.requestAnimationFrame(() => {
        setIndex(0);
        setVisible(true);
      });
      return () => window.cancelAnimationFrame(resetFrame);
    }

    intervalRef.current = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % words.length);
        setVisible(true);
      }, 180);
    }, 900);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hovered, words.length]);

  return (
    <span
      className="inline-block transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0.32,
        color: hovered ? "var(--page-text)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {words[index]}
    </span>
  );
}

export function ScatterWord({ word, colors }: { word: string; colors: string[] }) {
  const [hovered, setHovered] = useState(false);
  const transforms = useMemo(
    () =>
      word.split("").map((_, index) => ({
        x: (index % 2 === 0 ? 1 : -1) * (7 + ((index * 5) % 12)),
        y: (index % 3 === 0 ? -1 : 1) * (5 + ((index * 3) % 8)),
        r: (index % 2 === 0 ? 1 : -1) * (7 + index * 2),
        color: colors[index % colors.length] ?? "#ffffff",
      })),
    [word, colors],
  );

  return (
    <span
      className="inline-flex cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {word.split("").map((letter, index) => {
        const transform = transforms[index]!;
        return (
          <span
            key={`${letter}-${index}`}
            className="relative inline-block overflow-visible px-[0.01em]"
          >
            <span
              className="inline-block transition-all duration-500 ease-out"
              style={{
                transform: hovered
                  ? `translate(${transform.x}px, ${transform.y}px) rotate(${transform.r}deg)`
                  : "translate(0px, 0px) rotate(0deg)",
                color: hovered ? transform.color : "var(--page-text-muted)",
              }}
            >
              {letter}
            </span>
          </span>
        );
      })}
    </span>
  );
}