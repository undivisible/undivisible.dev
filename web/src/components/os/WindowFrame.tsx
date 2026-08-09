"use client";

import { useCallback, useRef } from "react";
import type { ReactNode } from "react";
import type { OsWindow } from "@/lib/os/use-os-state";

/**
 * One managed window. Floating windows drag by the titlebar and resize from
 * the corner; tiled windows take whatever the layout hands them. Every
 * window carries its escape hatches in the titlebar: pop the app out into a
 * real tab, open its repository, minimize, close.
 */
export function WindowFrame({
  win,
  tiled,
  active,
  style,
  onFocus,
  onClose,
  onMinimize,
  onMove,
  onResize,
  children,
}: {
  win: OsWindow;
  tiled: boolean;
  active: boolean;
  style: React.CSSProperties;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);

  const dragStart = useCallback(
    (event: React.PointerEvent) => {
      if (tiled) return;
      // Buttons in the titlebar keep their clicks.
      if ((event.target as HTMLElement).closest("button, a")) return;
      const desktop = frameRef.current?.parentElement;
      if (!desktop) return;
      const rect = desktop.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const baseX = win.x;
      const baseY = win.y;
      onFocus();
      const move = (pointer: PointerEvent) => {
        const dx = ((pointer.clientX - startX) / rect.width) * 100;
        const dy = ((pointer.clientY - startY) / rect.height) * 100;
        onMove(
          Math.min(Math.max(baseX + dx, -win.w + 8), 96),
          Math.min(Math.max(baseY + dy, 0), 94),
        );
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [tiled, win.x, win.y, win.w, onFocus, onMove],
  );

  const resizeStart = useCallback(
    (event: React.PointerEvent) => {
      if (tiled) return;
      event.stopPropagation();
      const desktop = frameRef.current?.parentElement;
      if (!desktop) return;
      const rect = desktop.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const baseW = win.w;
      const baseH = win.h;
      onFocus();
      const move = (pointer: PointerEvent) => {
        const dw = ((pointer.clientX - startX) / rect.width) * 100;
        const dh = ((pointer.clientY - startY) / rect.height) * 100;
        onResize(
          Math.min(Math.max(baseW + dw, 18), 96),
          Math.min(Math.max(baseH + dh, 16), 92),
        );
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [tiled, win.w, win.h, onFocus, onResize],
  );

  const { app } = win;
  return (
    <div
      ref={frameRef}
      className={`os-win ${active ? "is-active" : ""}`}
      style={style}
      onPointerDown={onFocus}
      role="dialog"
      aria-label={app.title}
    >
      <div className="os-win-bar" onPointerDown={dragStart}>
        <span className="os-win-title">
          {app.title}
          <em>{app.subtitle}</em>
        </span>
        <span className="os-win-tools">
          {app.url ? (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              title="pop out into a real tab"
              aria-label={`open ${app.title} in a new tab`}
            >
              ⧉
            </a>
          ) : null}
          {app.github ? (
            <a
              href={app.github}
              target="_blank"
              rel="noopener noreferrer"
              title="the code"
              aria-label={`open ${app.title} on github`}
            >
              ⌥
            </a>
          ) : null}
          <button type="button" onClick={onMinimize} title="minimize" aria-label="minimize">
            −
          </button>
          <button type="button" onClick={onClose} title="close" aria-label="close">
            ×
          </button>
        </span>
      </div>
      <div className="os-win-body">{children}</div>
      {!tiled ? (
        <span className="os-win-grip" onPointerDown={resizeStart} aria-hidden />
      ) : null}
    </div>
  );
}
