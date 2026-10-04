"use client";

import { useEffect, useRef, useState } from "react";
import { MachineIntro } from "@/components/os/MachineIntro";
import { coverVisible } from "@/lib/os/machine-input";
import { vm, type VmProgress } from "@/lib/os/vm";

/**
 * The page is the machine.
 *
 * No DOM windows, no web desktop — a real i686 PC (v86) boots the real
 * alpenglow image and its screen is the site, edge to edge. Even the sky
 * is a program in there now — alpenwall holds a background surface the
 * compositor blits under everything else.
 *
 * The boot log is the kernel's own. The cover reports download and boot
 * progress until the desktop is ready; it can be skipped.
 */
export default function MachineRoot() {
  const screenRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<VmProgress>({
    message: "cold",
    percent: null,
    ready: false,
    stage: "cold",
  });
  const [skipped, setSkipped] = useState(false);
  const [introMounted, setIntroMounted] = useState(true);
  const [mobileLine, setMobileLine] = useState("");
  const [coarse, setCoarse] = useState(false);
  const [askedUrl, setAskedUrl] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const [mouseUnavailable, setMouseUnavailable] = useState(false);
  const [passkeyNote, setPasskeyNote] = useState<string | null>(null);
  const touchRef = useRef<{
    x: number;
    y: number;
    moved: boolean;
    held: boolean;
  } | null>(null);

  const introOpen = coverVisible({ skipped, stage: progress.stage });

  useEffect(() => {
    document.documentElement.classList.add("machine-page");
    return () => {
      document.documentElement.classList.remove("machine-page");
    };
  }, []);

  useEffect(() => {
    if (introOpen) {
      setIntroMounted(true);
      return;
    }
    const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 320;
    const id = window.setTimeout(() => setIntroMounted(false), wait);
    return () => window.clearTimeout(id);
  }, [introOpen]);

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    if (screenRef.current) void vm.start(screenRef.current);
    vm.onOpenRequest((url) => {
      // An app inside the machine asked for a tab. Only ever to my own
      // domains — the list lives inside the image, but belt and braces.
      try {
        const parsed = new URL(url);
        if (
          /(^|\.)((undivisible\.dev)|(tsc\.hk)|(github\.com))$/.test(
            parsed.hostname,
          )
        ) {
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
      // Keep progress until the guest signals its first desktop frame.
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
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(clear);
      detach();
      vm.stop();
    };
  }, []);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;

    const point = (touch: Touch) => {
      const rect = el.getBoundingClientRect();
      vm.touchAt(
        touch.clientX - rect.left,
        touch.clientY - rect.top,
        rect.width,
        rect.height,
      );
    };

    const onStart = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      event.preventDefault();
      touchRef.current = {
        x: t.clientX,
        y: t.clientY,
        moved: false,
        held: event.touches.length > 1,
      };
      point(t);
      // A second finger holds the button down: two-finger drag moves
      // windows, one-finger drag just moves the cursor.
      if (event.touches.length > 1) vm.touchButton(true);
    };

    const onMove = (event: TouchEvent) => {
      const t = event.touches[0];
      const s = touchRef.current;
      if (!t || !s) return;
      event.preventDefault();
      point(t);
      if (Math.abs(t.clientX - s.x) > 2 || Math.abs(t.clientY - s.y) > 2) {
        s.moved = true;
      }
      s.x = t.clientX;
      s.y = t.clientY;
    };

    const onEnd = (event: TouchEvent) => {
      const s = touchRef.current;
      if (!s) return;
      event.preventDefault();
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
    };

    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: false });
    el.addEventListener("touchcancel", onEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return (
    <main
      className="lab-root machine-root"
      aria-label="Linux machine"
      data-machine-stage={progress.stage}
    >
      <div className="machine-frame">
        {/* v86 renders here: the text layer for VGA text mode, the canvas
            for graphical modes. Structure is what libv86 expects. */}
        <div
          className="machine-screen"
          ref={screenRef}
          tabIndex={0}
          role="group"
          aria-label="Linux screen. Press Escape to return to page controls."
          onFocus={() => vm.captureKeyboard(true)}
          onBlur={() => vm.captureKeyboard(false)}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            vm.releaseKeyboard();
            document
              .querySelector<HTMLAnchorElement>(".lab-navigation a")
              ?.focus();
          }}
          onClick={(event) => {
            event.currentTarget.focus();
            void vm.lockMouse().then((locked) => setMouseUnavailable(!locked));
          }}
          title="click to give the machine your mouse — esc gives it back"
        >
          <div className="machine-text" style={{ whiteSpace: "pre" }} />
          <canvas style={{ display: "none" }} />
        </div>

        {resumed ? (
          <p className="machine-resumed">
            the machine was paused while this tab was in the background — it
            picks up where it stopped
          </p>
        ) : null}

        {introMounted ? (
          <MachineIntro
            progress={progress}
            exiting={!introOpen}
            onSkip={() => setSkipped(true)}
          />
        ) : null}
      </div>

      {coarse ? (
        <form
          className="machine-mobile-input"
          onSubmit={(event) => {
            event.preventDefault();
            void vm.typeText(`${mobileLine}\n`);
            setMobileLine("");
          }}
        >
          <input
            value={mobileLine}
            onChange={(event) => setMobileLine(event.target.value)}
            placeholder="type here — tap places the pointer, drag follows your finger"
            aria-label="machine keyboard"
            disabled={!progress.ready}
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            aria-label="Send command"
            disabled={!progress.ready}
          >
            ⏎
          </button>
          <button
            type="button"
            aria-label="Send Control C to machine"
            title="Exit Nexnet or interrupt a console command"
            disabled={!progress.ready}
            onClick={() => void vm.interrupt()}
          >
            Ctrl+C
          </button>
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
          <button
            type="button"
            onClick={() => setAskedUrl(null)}
            aria-label="dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      <footer className="machine-foot">
        {mouseUnavailable ? (
          <span role="status">
            Mouse capture is unavailable. Keyboard and touch controls still
            work.
          </span>
        ) : null}
        <span>
          linux 7.1.3 i686 · v86 · image built from{" "}
          <a
            href="https://github.com/tschk/alpenglow"
            target="_blank"
            rel="noopener noreferrer"
          >
            tschk/alpenglow
          </a>
        </span>
        <span className="machine-foot-hint">
          Nexnet: type <code>nexnet</code> in the launcher. Read Updates and
          Public chat; create an identity and sign in on the Identity page (3).
          Press q outside the editor or Ctrl+C to return to the desktop.{" "}
          <button
            type="button"
            className="machine-foot-escape"
            disabled={!progress.ready || !vm.nexnetPasskeyAvailable()}
            onClick={() => {
              setPasskeyNote("waiting for your authenticator…");
              vm.registerNexnetPasskey().then(
                () =>
                  setPasskeyNote(
                    "passkey added; restart nexnet to pick it on the Identity page",
                  ),
                (error: unknown) =>
                  setPasskeyNote(
                    error instanceof Error ? error.message : "passkey failed",
                  ),
              );
            }}
            title="Register a passkey for your Nexnet identity (create the identity in the terminal first)"
          >
            add a passkey
          </button>
          {passkeyNote ? <span role="status"> {passkeyNote}</span> : null}
        </span>
        <span className="machine-foot-hint">
          click the screen to hand it your mouse (esc takes it back) · type to
          launch · esc or the corner chip hides the launcher · tab cycles
          windows · drag the widgets · `sh` is the real console ·{" "}
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
    </main>
  );
}
