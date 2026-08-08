"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { LAB_REFS } from "@/data/lab-refs";

/**
 * A word that explains itself on hover — an encyclopaedia card on a soft
 * radial plate over a heavy blur, with no hard border. Card markup is always
 * rendered so it is present before hydration and readable to crawlers;
 * visibility and placement are the only things JavaScript touches.
 */
export function Ref({
  slug,
  children,
  className = "",
}: {
  slug: keyof typeof LAB_REFS | string;
  children: ReactNode;
  className?: string;
}) {
  const entry = LAB_REFS[slug];
  const cardId = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<CSSProperties>({});

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const card = cardRef.current;
    if (!anchor || !card) return;

    const a = anchor.getBoundingClientRect();
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const margin = 14;

    const wanted = a.left + a.width / 2 - width / 2;
    const maxLeft = window.innerWidth - width - margin;
    const clamped = Math.min(
      Math.max(wanted, margin),
      Math.max(margin, maxLeft),
    );

    const fitsBelow = a.bottom + height + margin <= window.innerHeight;
    setPlacement({
      // Offset from the anchor, since the card is positioned against it.
      transform: `translate(${(clamped - a.left).toFixed(1)}px, ${
        fitsBelow ? a.height + 10 : -(height + 10)
      }px)`,
    });
  }, []);

  const show = useCallback(() => {
    place();
    setOpen(true);
  }, [place]);
  const hide = useCallback(() => setOpen(false), []);

  if (!entry) return <>{children}</>;

  return (
    <span
      ref={anchorRef}
      className={`lab-ref ${open ? "is-open" : ""} ${className}`}
      tabIndex={0}
      role="button"
      aria-describedby={open ? cardId : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape") hide();
      }}
    >
      <span className="lab-ref-word">{children}</span>
      <span
        ref={cardRef}
        id={cardId}
        role="tooltip"
        aria-hidden={!open}
        className="lab-refcard"
        style={placement}
      >
        <span className="lab-refcard-top">
          {entry.image ? (
            <img className="lab-refcard-img" src={entry.image} alt="" />
          ) : (
            <span className="lab-refcard-mark" aria-hidden="true">
              {entry.mark}
            </span>
          )}
          <span>
            <span className="lab-refcard-title">{entry.title}</span>
            <span className="lab-refcard-kind">{entry.kind}</span>
          </span>
        </span>
        <span className="lab-refcard-body">{entry.body}</span>
        <span className="lab-refcard-foot">
          <span>{entry.source}</span>
          <b>{entry.stat}</b>
        </span>
      </span>
    </span>
  );
}
