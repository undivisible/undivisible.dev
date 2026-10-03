"use client";

import type { VmProgress } from "@/lib/os/vm";

export function MachineIntro({
  progress,
  exiting,
  onSkip,
}: {
  progress: VmProgress;
  exiting: boolean;
  onSkip: () => void;
}) {
  return (
    <div className={`machine-intro is-light${exiting ? " is-exit" : ""}`}>
      <div className="machine-intro-copy">
        <p className="machine-cover-title">Alpenglow</p>
        <noscript>
          <p className="machine-cover-line">
            JavaScript is needed for Linux. The simple version works without it.
          </p>
          <a href="/simple/">Open the simple version →</a>
        </noscript>
        <p className="machine-cover-line" role="status">
          {progress.message === "cold"
            ? "Preparing the machine…"
            : progress.message}
        </p>
        {progress.stage !== "failed" ? (
          <button type="button" onClick={onSkip}>
            Show boot screen
          </button>
        ) : (
          <a href="/simple/">Continue to the simple version →</a>
        )}
      </div>
    </div>
  );
}
