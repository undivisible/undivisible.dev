import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type SplitType = "words" | "chars";

interface RandomizedTextProps {
  children: string;
  className?: string;
  split?: SplitType;
  delay?: number;
  inView?: boolean;
  once?: boolean;
}

/** Deterministic per-index jitter so SSR and hydration match React #418 safeguards. */
function staggerDelay(delay: number, seed: string, index: number) {
  let h = index + 913;
  const cap = Math.min(seed.length, 160);
  for (let i = 0; i < cap; i += 1) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
  }
  const t = Math.abs(Math.sin(h * 0.00013));
  return delay + t * 0.22 + (index % 7) * 0.009;
}

export function RandomizedText({
  children,
  className = "",
  split = "words",
  delay = 0.2,
  inView = false,
  once = true,
}: RandomizedTextProps) {
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    setMotionReady(true);
  }, []);

  const expoOut = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const elements = useMemo(() => {
    if (split === "chars") {
      return children.split("").map((char, i) => ({
        content: char === " " ? "\u00A0" : char,
        key: `char-${i}`,
      }));
    }
    return children.split(" ").map((word, i) => ({
      content: word,
      key: `word-${i}`,
    }));
  }, [children, split]);

  const randomizedDelays = useMemo(
    () => elements.map((_, i) => staggerDelay(delay, children, i)),
    [elements, delay, children],
  );

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  if (!motionReady) {
    return (
      <span className={className} aria-label={children}>
        {children}
      </span>
    );
  }

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
      {elements.map((element, i) => (
        <motion.span
          key={element.key}
          variants={variants}
          transition={{
            duration: 1.2,
            delay: randomizedDelays[i] ?? delay,
            ease: expoOut,
          }}
          style={{ display: split === "words" ? "inline-block" : "inline" }}
          className={split === "words" ? "mr-[0.25em]" : ""}
        >
          {element.content}
        </motion.span>
      ))}
    </motion.span>
  );
}
