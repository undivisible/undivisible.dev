"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { LabBackground } from "@/components/lab/LabBackground";
import { Bar } from "@/components/os/Bar";
import { Boot } from "@/components/os/Boot";
import {
  AboutPanel,
  ActivityPanel,
  Before17Panel,
  RoutePanel,
  WorksPanel,
} from "@/components/os/Panels";
import { TelekinesisApp } from "@/components/os/TelekinesisApp";
import { TerminalApp } from "@/components/os/TerminalApp";
import { WindowFrame } from "@/components/os/WindowFrame";
import { useLiveGithub } from "@/hooks/use-live-github";
import { PREOPENED } from "@/lib/os/apps";
import { useOsState, type OsWindow } from "@/lib/os/use-os-state";
import { fetchResumeMarkdownCached } from "@/lib/remote-markdown";
import { clearSitePrintTarget, printSitePdf } from "@/lib/site-print";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

const HomePrintRoot = dynamic(
  () =>
    import("@/components/home/print/HomePrintRoot").then((m) => m.HomePrintRoot),
  { ssr: false },
);

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * The site as the operating system it keeps talking about: alpenglow
 * underneath (the sky is the wallpaper), alpenglowed on top (pills + one
 * prompt), my software preinstalled, and the almanac's content pre-opened
 * as windows so the desktop isn't an empty metaphor.
 */
export default function OsRoot() {
  const dayTheme = useHongKongDayTheme();
  const github = useLiveGithub();
  const os = useOsState();
  const [booted, setBooted] = useState(false);
  const [temple, setTemple] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const preopened = useRef(false);
  const konamiIndex = useRef(0);
  const terminalQueue = useRef<string[]>([]);

  // Boot only once per session; a return visit goes straight to the desk.
  useEffect(() => {
    if (sessionStorage.getItem("os-booted")) setBooted(true);
  }, []);
  const finishBoot = useCallback(() => {
    sessionStorage.setItem("os-booted", "1");
    setBooted(true);
  }, []);

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 760);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // The desktop opens with the site's own content on it.
  useEffect(() => {
    if (!booted || preopened.current) return;
    preopened.current = true;
    const toOpen = narrow ? ["about"] : PREOPENED;
    toOpen.forEach((id, index) => {
      setTimeout(() => os.open(id), 220 + index * 160);
    });
  }, [booted, narrow, os]);

  // ↑↑↓↓←→←→ba — the oldest promise in the medium.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const expected = KONAMI[konamiIndex.current];
      konamiIndex.current =
        event.key === expected ? konamiIndex.current + 1 : event.key === KONAMI[0] ? 1 : 0;
      if (konamiIndex.current === KONAMI.length) {
        konamiIndex.current = 0;
        setTemple((current) => !current);
        os.open("terminal");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [os]);

  // Resume prints from the same layer the live site uses.
  const [printMounted, setPrintMounted] = useState(false);
  useEffect(() => {
    const onAfterPrint = () => clearSitePrintTarget();
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);
  const printResume = useCallback(async () => {
    await fetchResumeMarkdownCached({ forceRefresh: true }).catch(() => null);
    setPrintMounted(true);
    await new Promise((resolve) => setTimeout(resolve, 60));
    await printSitePdf("resume");
  }, []);

  const queueTerminal = useCallback((line: string) => {
    terminalQueue.current.push(line);
  }, []);

  const visible = os.windows.filter((win) => !win.minimized);

  // Two columns, stacked — alpenglowed's tiled mode, in percentages.
  const tiledRects = useMemo(() => {
    const rects = new Map<number, { x: number; y: number; w: number; h: number }>();
    if (os.mode !== "tiled") return rects;
    const left = visible.filter((_, index) => index % 2 === 0);
    const right = visible.filter((_, index) => index % 2 === 1);
    const place = (column: OsWindow[], x: number, w: number) => {
      const h = column.length ? 92 / column.length : 92;
      column.forEach((win, index) => {
        rects.set(win.key, { x, y: 1 + index * h, w, h: h - 1.4 });
      });
    };
    if (right.length === 0) place(left, 1, 98);
    else {
      place(left, 1, 48.5);
      place(right, 50.5, 48.5);
    }
    return rects;
  }, [os.mode, visible]);

  const renderApp = (win: OsWindow) => {
    switch (win.app.id) {
      case "about":
        return <AboutPanel github={github} onResume={() => void printResume()} />;
      case "activity":
        return <ActivityPanel github={github} />;
      case "works":
        return <WorksPanel />;
      case "route":
        return <RoutePanel />;
      case "before17":
        return <Before17Panel />;
      case "terminal":
        return (
          <TerminalApp
            openApp={os.open}
            onTemple={() => setTemple((current) => !current)}
          />
        );
      case "telekinesis":
        return <TelekinesisApp />;
      default:
        return win.app.url ? (
          <iframe
            className="os-site-frame"
            src={win.app.url}
            title={win.app.title}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
          />
        ) : null;
    }
  };

  return (
    <div className={`lab-root os-root ${temple ? "os-temple" : ""}`}>
      <LabBackground dayTheme={dayTheme} />

      {printMounted ? (
        <div className="print-only print-layer-resume" aria-hidden>
          <HomePrintRoot />
        </div>
      ) : null}

      {!booted ? <Boot onDone={finishBoot} /> : null}

      <div className="os-desk" data-narrow={narrow || undefined}>
        <Bar os={os} dayTheme={dayTheme} onTerminalCommand={queueTerminal} />

        <div className="os-desktop">
          {os.windows.map((win) => {
            if (win.minimized) return null;
            const tiledRect = tiledRects.get(win.key);
            const rect = tiledRect ?? win;
            const style: CSSProperties = narrow
              ? { inset: 0, zIndex: win.z }
              : {
                  left: `${rect.x}%`,
                  top: `${rect.y}%`,
                  width: `${rect.w}%`,
                  height: `${rect.h}%`,
                  zIndex: win.z,
                };
            const topZ = Math.max(...visible.map((candidate) => candidate.z));
            return (
              <WindowFrame
                key={win.key}
                win={win}
                tiled={os.mode === "tiled" || narrow}
                active={win.z === topZ}
                style={style}
                onFocus={() => os.focus(win.key)}
                onClose={() => os.close(win.key)}
                onMinimize={() => os.minimize(win.key)}
                onMove={(x, y) => os.move(win.key, x, y)}
                onResize={(w, h) => os.resize(win.key, w, h)}
              >
                {win.app.id === "terminal" ? (
                  <TerminalWithQueue
                    queue={terminalQueue}
                    openApp={os.open}
                    onTemple={() => setTemple((current) => !current)}
                  />
                ) : (
                  renderApp(win)
                )}
              </WindowFrame>
            );
          })}

          {visible.length === 0 && booted ? (
            <p className="os-empty">
              nothing open. press <b>/</b> and type.
            </p>
          ) : null}
        </div>

        <footer className="os-foot">
          <span>
            alpenglow, the web build · the real one:{" "}
            <a href="https://alpenglow.tsc.hk" target="_blank" rel="noopener noreferrer">
              alpenglow.tsc.hk
            </a>
          </span>
          <span className="os-foot-hint">↑↑↓↓←→←→ba does something</span>
        </footer>
      </div>
    </div>
  );
}

/** Feeds bar-launched `> command`s into the terminal once it exists. */
function TerminalWithQueue({
  queue,
  openApp,
  onTemple,
}: {
  queue: React.MutableRefObject<string[]>;
  openApp: (id: string) => void;
  onTemple: () => void;
}) {
  // The queue drains through the DOM: TerminalApp owns its own state, so the
  // simplest honest bridge is typing into it. Kept internal to this file.
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!queue.current.length) return;
    const input = host.current?.querySelector("input");
    if (!input) return;
    const lines = queue.current.splice(0);
    for (const line of lines) {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(input, line);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    }
  });
  return (
    <div ref={host} className="os-term-host">
      <TerminalApp openApp={openApp} onTemple={onTemple} />
    </div>
  );
}
