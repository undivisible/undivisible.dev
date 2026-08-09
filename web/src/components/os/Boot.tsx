"use client";

import { useEffect, useRef, useState } from "react";
import { vm } from "@/lib/os/vm";

/**
 * The boot screen is not an animation. It powers on the real VM the moment
 * it mounts, shows the real download progress and the first real serial
 * bytes out of the kernel, and gets out of the way when a shell prompt
 * appears — or the moment you press anything, because the desktop doesn't
 * need the machine to be up before it's usable. The VM keeps booting
 * behind it either way.
 */
export function Boot({ onDone }: { onDone: () => void }) {
  const [message, setMessage] = useState("powering on");
  const [percent, setPercent] = useState<number | null>(null);
  const [serial, setSerial] = useState("");
  const finished = useRef(false);

  useEffect(() => {
    void vm.start();

    const finish = () => {
      if (!finished.current) {
        finished.current = true;
        onDone();
      }
    };

    const detachProgress = vm.attachProgress((progress) => {
      setMessage(progress.message);
      setPercent(progress.percent);
    });
    const detachSerial = vm.attachSerial((chunk) => {
      setSerial((current) => (current + chunk).slice(-4000));
      // A prompt means a shell; the machine is someone's now.
      if (chunk.includes("#")) setTimeout(finish, 450);
    });

    // Never hold the desk hostage: whatever the network is doing, the
    // desktop appears after a few seconds and the boot continues behind it.
    const deadline = setTimeout(finish, 6000);
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearTimeout(deadline);
      detachProgress();
      detachSerial();
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  const shownSerial = serial
    .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "")
    .split("\n")
    .slice(-14)
    .join("\n");

  return (
    <div className="os-boot" role="status" aria-label="booting alpenglow">
      <div className="os-boot-log">
        <pre className="os-boot-head">alpenglow — real kernel, emulated cpu</pre>
        {percent !== null ? (
          <pre>
            [{"#".repeat(Math.round((percent / 100) * 24)).padEnd(24, "·")}]{" "}
            {message}
          </pre>
        ) : (
          <pre>{message}</pre>
        )}
        {shownSerial ? <pre className="os-boot-serial">{shownSerial}</pre> : null}
      </div>
      <div className="os-boot-foot">
        <span>linux 7.1.3 i686 via v86 · any key skips, the machine keeps booting</span>
        <button type="button" onClick={onDone}>
          skip
        </button>
      </div>
    </div>
  );
}
