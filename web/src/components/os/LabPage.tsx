"use client";

import { useEffect, useState } from "react";
import MachineRoot from "@/components/os/MachineRoot";

export default function LabPage() {
  const [started, setStarted] = useState(true);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  useEffect(() => {
    if (!started) window.dispatchEvent(new Event("site:mode-ready"));
  }, [started]);

  return (
    <div className={`lab-page${started ? " lab-running" : ""}`}>
      <nav className="lab-navigation" aria-label="Lab navigation">
        <a href="/main/" aria-label="Return to website mode">
          ← Website
        </a>
        <a href="/simple/" className="lab-simple-link">
          Simple
        </a>
        {started ? (
          <button disabled={!interactive} onClick={() => setStarted(false)}>
            Stop
          </button>
        ) : null}
      </nav>
      {started ? (
        <MachineRoot />
      ) : (
        <main className="lab-welcome">
          <p className="profile-eyebrow">Linux desktop</p>
          <h1>Alpenglow</h1>
          <p>A Linux desktop in your browser.</p>
          <p>
            Starting it downloads the machine image and uses about 512 MB of
            memory. A desktop keyboard works best.
          </p>
          <button
            disabled={!interactive}
            onClick={() => {
              window.dispatchEvent(new Event("site:mode-start"));
              setStarted(true);
            }}
          >
            Start machine
          </button>
          <p>
            The <a href="/simple/">simple version</a> has the profile, projects
            and résumé without starting Linux.
          </p>
          <noscript>
            <p>
              JavaScript is needed only to start the machine. The profile pages
              work without it.
            </p>
          </noscript>
        </main>
      )}
    </div>
  );
}
