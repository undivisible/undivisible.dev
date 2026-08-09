"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The boot. The real alpenglow gets to a shell in under a second, so a long
 * cinematic loader would be lying about the brand — this one plays a fast
 * kernel log, says how long it took, and any key, tap or the button skips
 * straight past it. It only plays on the first visit per session.
 */
const LOG: Array<[number, string]> = [
  [0, "alpenglow-web 0.1.0 booting…"],
  [90, "[ ok ] mounted /dev/sky (shader, read-only)"],
  [180, "[ ok ] started weather.service (open-meteo)"],
  [280, "[ ok ] started lastfm.service (the field listens)"],
  [370, "[ ok ] mounted /home/max (10 countries, no lease)"],
  [460, "[ ok ] loaded 91 packages from github"],
  [560, "[warn] holyc.ko tainted: blessed"],
  [640, "[ ok ] reached target graphical — starting alpenglowed"],
];

export function Boot({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [ms, setMs] = useState(0);
  const started = useRef(Date.now());
  const finished = useRef(false);

  useEffect(() => {
    const timers = LOG.map(([at, text]) =>
      setTimeout(() => setLines((current) => [...current, text]), at),
    );
    const tick = setInterval(() => setMs(Date.now() - started.current), 50);
    const done = setTimeout(() => {
      if (!finished.current) {
        finished.current = true;
        onDone();
      }
    }, 1050);

    const skip = () => {
      if (!finished.current) {
        finished.current = true;
        onDone();
      }
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
      clearInterval(tick);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  return (
    <div className="os-boot" role="status" aria-label="booting">
      <div className="os-boot-log">
        {lines.map((line, index) => (
          <pre key={index}>{line}</pre>
        ))}
      </div>
      <div className="os-boot-foot">
        <span>{(ms / 1000).toFixed(2)}s · the real one is faster</span>
        <button type="button" onClick={onDone}>
          skip
        </button>
      </div>
    </div>
  );
}
