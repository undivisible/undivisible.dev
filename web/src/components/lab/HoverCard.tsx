"use client";

import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * The hover shell every card on this page uses.
 *
 * Three layers: a heavily blurred, saturated wash of whatever is behind the
 * card, the surface over it, and the content. The wash is a separate element
 * rather than a background on the card so it can be blurred and tinted
 * without touching the text sitting on top of it.
 *
 * The card stays mounted and only its visibility moves, so it reads before
 * hydration and to anything that doesn't have a pointer. `openCount` bumps
 * on every open so the contents can re-run their reveal each time.
 */
export function HoverCard({
  trigger,
  children,
  align = "center",
  side = "top",
  className = "",
  onOpen,
  onClose,
}: {
  trigger: ReactNode;
  /** Given the open count, so a card can re-randomise on each open. */
  children: ReactNode | ((openCount: number) => ReactNode);
  align?: "start" | "center";
  side?: "top" | "bottom";
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const close = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (close.current) clearTimeout(close.current);
    setOpen((wasOpen) => {
      if (!wasOpen) setOpenCount((count) => count + 1);
      return true;
    });
    onOpen?.();
  }, [onOpen]);

  // A short grace period so a cursor crossing the gap doesn't flicker it.
  const hide = useCallback(() => {
    if (close.current) clearTimeout(close.current);
    close.current = setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, 90);
  }, [onClose]);

  return (
    <span
      className={`hc ${open ? "is-open" : ""} ${className}`}
      data-align={align}
      data-side={side}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}
      <span className="hc-card" role="tooltip" aria-hidden={!open}>
        <span className="hc-blur" aria-hidden />
        <span className="hc-body-wrap">
          {typeof children === "function" ? children(openCount) : children}
        </span>
      </span>
    </span>
  );
}
