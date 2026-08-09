"use client";

import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * The hover shell every card on this page uses.
 *
 * No border and no hard edge: the panel is a radial wash behind a heavy
 * backdrop blur, and a radial mask eats the blur along with the fill so the
 * whole thing dissolves into the sky at the sides rather than sitting on top
 * of it in a box.
 *
 * The card stays mounted and only its visibility moves, so it reads before
 * hydration and to anything that doesn't have a pointer.
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
  children: ReactNode;
  align?: "start" | "center";
  side?: "top" | "bottom";
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (close.current) clearTimeout(close.current);
    setOpen(true);
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
        {children}
      </span>
    </span>
  );
}
