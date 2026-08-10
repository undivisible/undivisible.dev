"use client";

import { useEffect, useRef, useState } from "react";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { LinkPills } from "@/components/lab/LinkPills";
import { NameCycle } from "@/components/lab/NameCycle";
import { useLiveGithub } from "@/hooks/use-live-github";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { vm, type VmProgress } from "@/lib/os/vm";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

/**
 * The machine, back in the almanac's room.
 *
 * The PC is still real — v86 booting the real alpenglow image — but the
 * page around it is the original site again: the sky shader, the weather
 * clock, the name, the pills. The web widgets are the room; the machine's
 * screen is the machine's.
 */
export default function MachineRoot() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const github = useLiveGithub();
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
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(clear);
      detach();
    };
  }, []);

  return (
    <div className="lab-root machine-root">
      <LabBackground dayTheme={dayTheme} />

      <header className="machine-top">
        <LabClock
          dayTheme={dayTheme}
          location={now.location}
          timeOffsetMinutes={now.location.utcOffsetMinutes}
          status={now.status}
        />
        <div className="machine-top-name">
          <h1 className="machine-name">
            <NameCycle />
          </h1>
          <p className="machine-tagline">
            <GhostTagline suffixClassName="min-suffix" />
          </p>
          <LinkPills github={github} onResume={() => window.open("/resume.md", "_blank")} />
        </div>
      </header>

      <div className="machine-frame">
        <div className="machine-shell">
          {/* v86 renders here: the text layer for VGA text mode, the canvas
              for graphical modes. Structure is what libv86 expects. */}
          <div
            className="machine-screen"
            ref={screenRef}
            onClick={() => vm.lockMouse()}
            title="click to give the machine your mouse — esc gives it back"
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
                {progress.percent !== null
                  ? `[${"#".repeat(Math.round(((progress.percent ?? 0) / 100) * 26)).padEnd(26, "·")}]`
                  : null}{" "}
                {progress.message}
              </p>
              <p className="machine-cover-fine">
                a real i686 pc, emulated on your cpu. the kernel you're about
                to watch boot is linux 7.1.3, built from tschk/alpenglow.
              </p>
              <button type="button" onClick={() => setCovered(false)}>
                skip
              </button>
            </div>
          ) : null}
        </div>
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
            placeholder="type here — it goes to the machine's keyboard"
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
          launch · drag the widgets · `sh` is the real console
        </span>
      </footer>
    </div>
  );
}
