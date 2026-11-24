"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { inPreviewCorridor } from "@/lib/preview-corridor";

export function StatusPreview({
  id,
  label,
  title,
  className = "",
  panelClassName = "",
  children,
}: {
  id: string;
  label: string;
  title: string;
  className?: string;
  panelClassName?: string;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<"hover" | "pinned" | null>(null);
  const trigger = useRef<HTMLSpanElement>(null);
  const disclosure = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const destination = useRef<"card" | "trigger">("card");
  const suppressFocus = useRef(false);
  const enterCard = useRef(false);
  const dismiss = useCallback((restore = false) => {
    setMode(null);
    origin.current = null;
    enterCard.current = false;
    if (restore) {
      suppressFocus.current = true;
      disclosure.current?.focus({ preventScroll: true });
      suppressFocus.current = false;
    }
  }, []);

  useLayoutEffect(() => {
    if (!mode || !card.current || !trigger.current) return;
    const position = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const panel = card.current;
      if (!anchor || !panel) return;
      const bounds = panel.getBoundingClientRect();
      const below = innerHeight - anchor.bottom - 24;
      const above = anchor.top - 24;
      const opensBelow = bounds.height <= below || below >= above;
      const available = Math.max(0, opensBelow ? below : above);
      panel.style.maxHeight = `${available}px`;
      const top = opensBelow
        ? anchor.bottom + 8
        : anchor.top - Math.min(bounds.height, available) - 8;
      panel.style.left = `${Math.max(16, Math.min(anchor.left, innerWidth - bounds.width - 16))}px`;
      panel.style.top = `${Math.max(16, Math.min(top, innerHeight - Math.min(bounds.height, available) - 16))}px`;
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(card.current);
    observer.observe(trigger.current);
    window.addEventListener("resize", position);
    if (enterCard.current) {
      enterCard.current = false;
      card.current.focus({ preventScroll: true });
    }
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
    };
  }, [mode]);

  useEffect(() => {
    if (!mode) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node &&
      (trigger.current?.contains(target) || card.current?.contains(target));
    const outside = (event: PointerEvent) => {
      if (!inside(event.target)) dismiss();
    };
    const focus = (event: FocusEvent) => {
      if (!inside(event.target)) dismiss();
    };
    const move = (event: PointerEvent) => {
      if (
        mode !== "hover" ||
        event.pointerType !== "mouse" ||
        inside(event.target)
      )
        return;
      if (trigger.current?.querySelector(":focus-visible")) return;
      const bounds = (
        destination.current === "card" ? card.current : trigger.current
      )?.getBoundingClientRect();
      if (
        bounds &&
        origin.current &&
        inPreviewCorridor(event.clientX, event.clientY, origin.current, bounds)
      )
        return;
      dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss(true);
    };
    const scroll = (event: Event) => {
      if (
        !(event.target instanceof Node) ||
        !card.current?.contains(event.target)
      )
        dismiss();
    };
    const page = trigger.current?.closest(".landing");
    const navigation = new MutationObserver(() => {
      if (
        page?.getAttribute("aria-busy") === "true" ||
        page?.getAttribute("data-view") !== "home"
      )
        dismiss();
    });
    if (page)
      navigation.observe(page, {
        attributes: true,
        attributeFilter: ["data-view", "aria-busy"],
      });
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("focusin", focus);
    document.addEventListener("pointermove", move);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", scroll, true);
    return () => {
      navigation.disconnect();
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [mode, dismiss]);

  const openFromKeyboard = () => {
    enterCard.current = !card.current;
    setMode("pinned");
    card.current?.focus({ preventScroll: true });
  };

  return (
    <span
      ref={trigger}
      className={`status-preview-trigger ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse")
          setMode((current) => current ?? "hover");
      }}
      onPointerLeave={(event) => {
        if (
          event.target instanceof Node &&
          card.current?.contains(event.target)
        )
          return;
        if (
          event.relatedTarget instanceof Node &&
          card.current?.contains(event.relatedTarget)
        )
          return;
        origin.current = { x: event.clientX, y: event.clientY };
        destination.current = "card";
      }}
      onFocus={() => {
        if (!suppressFocus.current) setMode((current) => current ?? "hover");
      }}
      onKeyDown={(event) => {
        if (
          event.key === "ArrowDown" ||
          (mode && event.key === "Tab" && !event.shiftKey)
        ) {
          event.preventDefault();
          openFromKeyboard();
        }
      }}
    >
      <button
        ref={disclosure}
        type="button"
        aria-expanded={Boolean(mode)}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={(event) => {
          if (mode === "pinned") dismiss();
          else if (event.detail === 0) openFromKeyboard();
          else setMode("pinned");
        }}
      >
        {label}
      </button>
      {mode &&
        createPortal(
          <aside
            ref={card}
            id={id}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${id}-title`}
            tabIndex={-1}
            className={`status-preview ${panelClassName}`}
            onFocus={() => setMode("pinned")}
            onPointerLeave={(event) => {
              origin.current = { x: event.clientX, y: event.clientY };
              destination.current = "trigger";
            }}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Escape") {
                dismiss(true);
                return;
              }
              if (event.key !== "Tab") return;
              const controls = [
                ...event.currentTarget.querySelectorAll<HTMLElement>(
                  "button:not(:disabled), select:not(:disabled), a[href], [tabindex='0']",
                ),
              ];
              if (
                event.shiftKey &&
                (event.target === controls[0] ||
                  event.target === event.currentTarget)
              ) {
                event.preventDefault();
                disclosure.current?.focus();
              } else if (!event.shiftKey && event.target === controls.at(-1)) {
                event.preventDefault();
                const outside = [
                  ...document.querySelectorAll<HTMLElement>(
                    "a[href], button:not(:disabled), select:not(:disabled), [tabindex='0']",
                  ),
                ].filter(
                  (element) =>
                    !card.current?.contains(element) &&
                    element.getClientRects().length,
                );
                const next =
                  outside[
                    outside.findIndex(
                      (element) => element === disclosure.current,
                    ) + 1
                  ];
                dismiss();
                next?.focus();
              }
            }}
          >
            <button
              className="status-preview-close"
              type="button"
              aria-label={`Close ${title}`}
              onClick={() => dismiss(true)}
            >
              ×
            </button>
            <h2 id={`${id}-title`}>{title}</h2>
            {children}
          </aside>,
          document.body,
        )}
    </span>
  );
}
