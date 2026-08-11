"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

type SplitType = "words" | "chars";

/**
 * Randomized reveal, rebuilt from spell.sh's RandomizedText rather than
 * installed: the string is split into words or characters and each piece
 * fades in on its own randomly-offset delay, over an exponential-out curve.
 * Same maths, no dependency.
 *
 * The whole string stays in the accessibility tree as one label, so a screen
 * reader gets a sentence rather than a pile of fragments.
 */
export function RandomizedText({
  children,
  className = "",
  split = "words",
  delay = 0.2,
  inView = false,
  once = true,
}: {
  children: string;
  className?: string;
  split?: SplitType;
  delay?: number;
  inView?: boolean;
  once?: boolean;
}) {
  const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const elements = useMemo(() => {
    if (split === "chars") {
      return children.split("").map((char, index) => ({
        content: char === " " ? " " : char,
        key: `char-${index}`,
      }));
    }
    return children
      .split(" ")
      .map((word, index) => ({ content: word, key: `word-${index}` }));
  }, [children, split]);

  const delays = useMemo(
    () => elements.map(() => delay + Math.random() * 0.2 + Math.random() * 0.03),
    // Only the count and the base matter; re-rolling on every render would
    // restart the reveal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [elements.length, delay],
  );

  return (
    <motion.span
      className={className}
      aria-label={children}
      style={{ display: "inline-block", wordBreak: "break-word" }}
      initial="hidden"
      whileInView={inView ? "visible" : undefined}
      animate={inView ? undefined : "visible"}
      viewport={{ once }}
    >
      {elements.map((element, index) => (
        <motion.span
          key={element.key}
          aria-hidden
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{
            duration: 1.2,
            delay: delays[index],
            ease: expoOut,
          }}
          style={{
            display: split === "words" ? "inline-block" : "inline",
            marginRight: split === "words" ? "0.25em" : undefined,
          }}
        >
          {element.content}
        </motion.span>
      ))}
    </motion.span>
  );
}
