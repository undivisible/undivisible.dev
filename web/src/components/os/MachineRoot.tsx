"use client";

import { useEffect, useRef, useState } from "react";
import { vm, type VmProgress } from "@/lib/os/vm";

/**
 * The page is the machine.
 *
 * No DOM windows, no web desktop — a real i686 PC (v86) boots the real
 * alpenglow image and its screen is the site, edge to edge. Even the sky
 * is a program in there now — alpenwall holds a background surface the
 * compositor blits under everything else.
 *
 * The boot log you see is the kernel's own. The cover only reports asset
 * download; it can be skipped and never blocks the screen behind it.
 */
export default function MachineRoot() {
  const screenRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<VmProgress>({
    message: "cold",
    percent: null,
    ready: false,
  });
  const [covered, setCovered] = useState(true);
  const [mobileLine, setMobileLine] = useState("");
  const [coarse, setCoarse] = useState(false);
  const [askedUrl, setAskedUrl] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const [dots, setDots] = useState("");
  const touchRef = useRef<{
    x: number;
    y: number;
    moved: boolean;
    held: boolean;
  } | null>(null);

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    if (screenRef.current) void vm.start(screenRef.current);
    vm.onOpenRequest((url) => {
      // An app inside the machine asked for a tab. Only ever to my own
      // domains — the list lives inside the image, but belt and braces.
      try {
        const parsed = new URL(url);
        if (/(^|\.)((undivisible\.dev)|(tsc\.hk)|(github\.com))$/.test(parsed.hostname)) {
          // The request arrives seconds after the keystroke that caused it,
          // so the popup blocker usually wins — offer the tab instead of
          // silently losing it.
          const win = window.open(url, "_blank", "noopener,noreferrer");
          if (!win) setAskedUrl(url);
        }
      } catch {
        /* not a url; ignore */
      }
    });
    const detach = vm.attachProgress((next) => {
      setProgress(next);
      // The cover exists for the download, not the boot — the boot is
      // content, drawn by the kernel itself.
      if (next.ready) setCovered(false);
    });
    // A hidden tab has its timers clamped, so the machine stops dead —
    // usually mid-boot, which reads as a hang. Say so when it comes back.
    let hiddenAt = 0;
    let clear: ReturnType<typeof setTimeout> | undefined;
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }
      if (!hiddenAt || Date.now() - hiddenAt < 2000) return;
      hiddenAt = 0;
      setResumed(true);
      clearTimeout(clear);
      clear = setTimeout(() => setResumed(false), 5000);
    };
    document.addEventListener("visibilitychange", onVisibility);
    // A quiet ellipsis while the machine boots, so the wait doesn't read as a
    // hang once the download bar hits 100%.
    const dotsTimer = setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      450,
    );
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(clear);
      clearInterval(dotsTimer);
      detach();
    };
  }, []);

  return (
    <div className="lab-root machine-root">
      <div className="machine-frame">
        {/* v86 renders here: the text layer for VGA text mode, the canvas
            for graphical modes. Structure is what libv86 expects. */}
        <div
          className="machine-screen"
          ref={screenRef}
          onClick={() => vm.lockMouse()}
          title="click to give the machine your mouse — esc gives it back"
          onTouchStart={(event) => {
            const t = event.touches[0];
            if (!t) return;
            touchRef.current = {
              x: t.clientX,
              y: t.clientY,
              moved: false,
              held: event.touches.length > 1,
            };
            // A second finger holds the button down: two-finger drag moves
            // windows, one-finger drag just moves the cursor.
            if (event.touches.length > 1) vm.touchButton(true);
          }}
          onTouchMove={(event) => {
            const t = event.touches[0];
            const s = touchRef.current;
            const rect = screenRef.current?.getBoundingClientRect();
            if (!t || !s || !rect) return;
            event.preventDefault();
            vm.touchDelta(t.clientX - s.x, t.clientY - s.y, rect.width, rect.height);
            s.x = t.clientX;
            s.y = t.clientY;
            s.moved = true;
          }}
          onTouchEnd={(event) => {
            const s = touchRef.current;
            if (!s) return;
            if (event.touches.length === 0) {
              if (s.held) {
                vm.touchButton(false);
              } else if (!s.moved) {
                // A tap: press and release where the cursor already is.
                vm.touchButton(true);
                setTimeout(() => vm.touchButton(false), 60);
              }
              touchRef.current = null;
            }
          }}
        >
          <div className="machine-text" style={{ whiteSpace: "pre" }} />
          <canvas style={{ display: "none" }} />
        </div>

        {resumed ? (
          <p className="machine-resumed">
            the machine was paused while this tab was in the background —
            it picks up where it stopped
          </p>
        ) : null}

        {covered ? (
          <div className="machine-cover">
            <p className="machine-cover-title">alpenglow</p>
            <p className="machine-cover-line">
              {progress.percent !== null && progress.percent < 100
                ? `[${"#".repeat(Math.round(((progress.percent ?? 0) / 100) * 26)).padEnd(26, "·")}] ${progress.message}`
                : `${progress.message}${dots}`}
            </p>
            <p className="machine-cover-fine">
              a real i686 pc, emulated on your cpu — linux 7.1.3, built from
              tschk/alpenglow. the desktop appears when it finishes booting.
            </p>
            <button type="button" onClick={() => setCovered(false)}>
              watch it boot →
            </button>
          </div>
        ) : null}
      </div>

      {coarse ? (
        <form
          className="machine-mobile-input"
          onSubmit={(event) => {
            event.preventDefault();
            vm.typeText(`${mobileLine}\n`);
            setMobileLine("");
          }}
        >
          <input
            value={mobileLine}
            onChange={(event) => setMobileLine(event.target.value)}
            placeholder="type here — drag moves the cursor, tap clicks, two fingers drag windows"
            aria-label="machine keyboard"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit">⏎</button>
        </form>
      ) : null}

      {askedUrl ? (
        <div className="machine-ask">
          the machine asked to open{" "}
          <a
            href={askedUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAskedUrl(null)}
          >
            {askedUrl.replace("https://", "")}
          </a>
          <button type="button" onClick={() => setAskedUrl(null)} aria-label="dismiss">
            ×
          </button>
        </div>
      ) : null}

      <footer className="machine-foot">
        <span>
          linux 7.1.3 i686 · v86 · image built from{" "}
          <a href="https://github.com/tschk/alpenglow" target="_blank" rel="noopener noreferrer">
            tschk/alpenglow
          </a>
        </span>
        <span className="machine-foot-hint">
          click the screen to hand it your mouse (esc takes it back) · type to
          launch · esc or the corner chip hides the launcher · drag the
          widgets · `sh` is the real console ·{" "}
          <button
            type="button"
            className="machine-foot-escape"
            onClick={() => vm.exitBrowser()}
            title="netsurf and links have no quit key — this kills them and the desktop comes back"
          >
            stuck in the browser? click here
          </button>
        </span>
      </footer>
    </div>
  );
}
