"use client";

import { useCallback, useRef, useState } from "react";
import { findApp, type OsApp } from "@/lib/os/apps";

export type OsWindow = {
  key: number;
  app: OsApp;
  /** Percent-of-desktop geometry while floating. */
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
};

export type WindowMode = "floating" | "tiled";

/**
 * The window manager. Floating with per-window geometry, or tiled into two
 * columns the way alpenglowed's layout.rs does it — the mode is a property
 * of the desktop, not the window.
 */
export function useOsState() {
  const [windows, setWindows] = useState<OsWindow[]>([]);
  const [mode, setMode] = useState<WindowMode>("floating");
  const nextKey = useRef(1);
  const nextZ = useRef(10);

  const open = useCallback((appId: string) => {
    const app = findApp(appId);
    if (!app) return;
    setWindows((current) => {
      const existing = current.find((win) => win.app.id === appId);
      if (existing) {
        // Re-opening an open app focuses it instead of stacking a twin.
        return current.map((win) =>
          win.app.id === appId
            ? { ...win, minimized: false, z: nextZ.current++ }
            : win,
        );
      }
      const rect = app.rect ?? { x: 20, y: 16, w: 50, h: 60 };
      // Cascade a little so twins of the default rect don't sit flush.
      const nudge = (current.length % 5) * 2;
      return [
        ...current,
        {
          key: nextKey.current++,
          app,
          x: rect.x + nudge,
          y: rect.y + nudge,
          w: rect.w,
          h: rect.h,
          z: nextZ.current++,
          minimized: false,
        },
      ];
    });
  }, []);

  const close = useCallback((key: number) => {
    setWindows((current) => current.filter((win) => win.key !== key));
  }, []);

  const focus = useCallback((key: number) => {
    setWindows((current) =>
      current.map((win) =>
        win.key === key ? { ...win, z: nextZ.current++, minimized: false } : win,
      ),
    );
  }, []);

  const minimize = useCallback((key: number) => {
    setWindows((current) =>
      current.map((win) =>
        win.key === key ? { ...win, minimized: true } : win,
      ),
    );
  }, []);

  const move = useCallback((key: number, x: number, y: number) => {
    setWindows((current) =>
      current.map((win) => (win.key === key ? { ...win, x, y } : win)),
    );
  }, []);

  const resize = useCallback((key: number, w: number, h: number) => {
    setWindows((current) =>
      current.map((win) => (win.key === key ? { ...win, w, h } : win)),
    );
  }, []);

  const closeAll = useCallback(() => setWindows([]), []);

  const cycleMode = useCallback(
    () => setMode((current) => (current === "floating" ? "tiled" : "floating")),
    [],
  );

  return {
    windows,
    mode,
    open,
    close,
    focus,
    minimize,
    move,
    resize,
    closeAll,
    cycleMode,
    setMode,
  };
}

export type OsState = ReturnType<typeof useOsState>;
