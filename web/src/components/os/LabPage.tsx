"use client";

import { useEffect, useState } from "react";
import MachineRoot from "@/components/os/MachineRoot";

export default function LabPage() {
  const [started, setStarted] = useState(true);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);

  return (
    <div className={`lab-page${started ? " lab-running" : ""}`}>
      <nav className="lab-navigation" aria-label="Lab navigation">
        <a href="/">undivisible.</a>
        <a href="/simple/">Simple version</a>
        <a href="/resume.md">Résumé</a>
        {started ? (
          <button disabled={!interactive} onClick={() => setStarted(false)}>
            Stop machine
          </button>
        ) : null}
      </nav>
      {started ? (
        <MachineRoot />
      ) : (
        <main className="lab-welcome">
          <p className="profile-eyebrow">Linux desktop</p>
          <h1>Alpenglow lab</h1>
          <p>A Linux desktop running locally in your browser with v86.</p>
          <p>
            Starting it downloads the machine image and uses about 512 MB of
            memory. A desktop keyboard works best.
          </p>
          <button disabled={!interactive} onClick={() => setStarted(true)}>
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
