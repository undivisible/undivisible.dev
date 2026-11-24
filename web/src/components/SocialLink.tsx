"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

// Ascii.tsx keeps its transition inline: use the same glyphs, random cell order,
// 1240ms duration and overlapping glyph/resolve phases for DOM text here.
const TRANSITION_CHARS = "─│┌┐└┘├┤┬┴┼╭╮╯╰╱╲╳○●■□▲△▶▼◆◇◘◙◦★☆♠♣♥♦";
const TYPE_DURATION = 1240;

type SocialLinkProps = Omit<ComponentPropsWithoutRef<"a">, "children"> & {
  label: string;
  value: string;
  href: string;
};

export function SocialLink({
  label,
  value,
  onPointerEnter,
  onPointerLeave,
  onPointerCancel,
  onFocus,
  onBlur,
  style,
  "aria-label": accessibleLabel = `${label}: ${value}`,
  ...props
}: SocialLinkProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const target = hovered || focused ? value : label;
  const [text, setText] = useState(label);
  const currentText = useRef(label);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const write = (next: string) => {
      currentText.current = next;
      setText(next);
    };
    const finish = () => {
      cancelAnimationFrame(frame);
      write(target);
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) finish();
    };

    if (reducedMotion.matches || currentText.current === target) {
      finish();
      return;
    }

    const source = Array.from(currentText.current);
    const destination = Array.from(target);
    const scatter = Array.from(
      { length: Math.max(source.length, destination.length) },
      () => Math.random(),
    );
    const start = performance.now();
    const render = (now: number) => {
      const progress = Math.min(Math.max((now - start) / TYPE_DURATION, 0), 1);
      if (progress === 1) {
        finish();
        return;
      }
      const glyphMix = Math.min(progress / 0.5, 1);
      const resolveMix = Math.min(Math.max((progress - 0.48) / 0.52, 0), 1);
      write(
        scatter
          .map((rank, index) => {
            if (rank <= resolveMix) return destination[index] ?? " ";
            if (rank <= glyphMix)
              return TRANSITION_CHARS[
                Math.floor(Math.random() * TRANSITION_CHARS.length)
              ];
            return source[index] ?? " ";
          })
          .join(""),
      );
      frame = requestAnimationFrame(render);
    };

    reducedMotion.addEventListener("change", onMotionChange);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, [target]);

  return (
    <a
      {...props}
      style={{
        inlineSize: `${Math.max(label.length, value.length) + 6}ch`,
        ...style,
      }}
      aria-label={accessibleLabel}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        onPointerLeave?.(event);
      }}
      onPointerCancel={(event) => {
        setHovered(false);
        onPointerCancel?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
    >
      [ {text} ↗ ]
    </a>
  );
}

export default SocialLink;
