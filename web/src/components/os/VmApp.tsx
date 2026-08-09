"use client";

import { useEffect, useRef, useState } from "react";
import { vm } from "@/lib/os/vm";

/**
 * The window onto the real machine: a ghostty terminal wired to the VM's
 * serial line. The VM itself lives outside the window — close it, reopen
 * it, the shell is exactly where you left it.
 */
export function VmApp() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const [seenSerial, setSeenSerial] = useState(false);

  useEffect(() => {
    let disposed = false;
    let detachSerial: (() => void) | null = null;
    let term: { write(s: string): void; focus(): void; dispose?(): void } | null =
      null;

    void (async () => {
      const { init, Terminal, FitAddon } = await import("ghostty-web");
      await init();
      if (disposed || !hostRef.current) return;

      const terminal = new Terminal({
        fontSize: 13,
        fontFamily:
          'var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace, monospace',
        cursorBlink: true,
        scrollback: 10000,
        theme: {
          background: "#000000",
          foreground: "#e4e4e7",
          cursor: "#fafafa",
          cursorAccent: "#000000",
          selectionBackground: "#3f3f46",
          selectionForeground: "#fafafa",
        },
      });
      const fit = new FitAddon();
      terminal.loadAddon(fit);
      terminal.open(hostRef.current);
      fit.fit();
      if (fit.observeResize) fit.observeResize();
      terminal.onData((data: string) => vm.send(data));
      term = terminal;

      // Start (or join) the machine, sized to this terminal.
      void vm.start(terminal.cols || 100, terminal.rows || 28);
      detachSerial = vm.attachSerial((chunk) => {
        setSeenSerial(true);
        terminal.write(chunk);
      });
      terminal.focus();
    })();

    const detachProgress = vm.attachProgress((progress) => {
      // "ready" means the emulator is up, not that the kernel has spoken —
      // hold the line until the serial port actually says something.
      setStatus(progress.ready ? "booting the kernel…" : progress.message);
      setFailed(progress.message.startsWith("failed") || progress.message.includes("download failed"));
    });

    return () => {
      disposed = true;
      detachSerial?.();
      detachProgress();
      term?.dispose?.();
    };
  }, []);

  return (
    <div className="vm">
      {status && !seenSerial ? (
        <div className={`vm-status ${failed ? "is-failed" : ""}`}>
          {status}
          {failed ? (
            <span>
              {" "}
              — the kernel and initrd are real files; a preview frame that
              blocks requests can't fetch them. it boots on the site.
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        ref={hostRef}
        className="vm-host"
        onPointerDown={(event) =>
          (event.currentTarget.querySelector("textarea, canvas, div") as HTMLElement | null)?.focus?.()
        }
        aria-label="Alpenglow serial console"
      />
      <div className="vm-foot">
        linux 7.1.3 i686 · v86 · the same image{" "}
        <a href="https://alpenglow.tsc.hk" target="_blank" rel="noopener noreferrer">
          alpenglow.tsc.hk
        </a>{" "}
        boots · try <b>fastfetch</b>, <b>cat readme.md</b>, <b>oil search vim</b>
      </div>
    </div>
  );
}
