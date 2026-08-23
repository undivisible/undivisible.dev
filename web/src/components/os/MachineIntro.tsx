"use client";

import { useEffect, useRef, useState } from "react";
import type { VmProgress } from "@/lib/os/vm";

const FIELD = ".:-=+*#%";
const TITLE = "alpenglow";

function scrambleAt(t: number): string {
  const revealed = Math.min(TITLE.length, Math.floor(t * TITLE.length * 1.8));
  return TITLE.split("")
    .map((ch, i) => {
      if (i < revealed) return ch;
      return FIELD[(i * 7 + Math.floor(t * 40)) % FIELD.length] ?? ch;
    })
    .join("");
}

function prefersLightIntro(): boolean {
  if (typeof window === "undefined") return false;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData,
  );
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return motion.matches || saveData || coarse;
}

export function MachineIntro({
  progress,
  exiting,
  onSkip,
}: {
  progress: VmProgress;
  exiting: boolean;
  onSkip: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });
  const [clock, setClock] = useState(0);
  const [light, setLight] = useState(false);
  const percent = progress.percent ?? 0;
  const title = light ? TITLE : scrambleAt(Math.min(1, clock / 0.7));

  useEffect(() => {
    setLight(prefersLightIntro());
  }, []);

  useEffect(() => {
    if (light) return;
    let id = 0;
    const started = performance.now();
    const tick = (now: number) => {
      setClock((now - started) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [light]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || light) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [light]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || light) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h, dpr } = sizeRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const sweep = Math.min(1, clock / 0.62);
    const sweepY = sweep * h;
    const flash = Math.max(0, 1 - clock / 0.16);
    if (flash > 0) {
      ctx.fillStyle = `rgba(236, 244, 255, ${flash * 0.2})`;
      ctx.fillRect(0, 0, w, h);
    }

    const band = ctx.createLinearGradient(0, sweepY - 90, 0, sweepY + 8);
    band.addColorStop(0, "rgba(126, 200, 232, 0)");
    band.addColorStop(0.7, "rgba(126, 200, 232, 0.08)");
    band.addColorStop(1, "rgba(226, 246, 255, 0.55)");
    ctx.fillStyle = band;
    ctx.fillRect(0, sweepY - 90, w, 98);

    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

    const drift = (clock * 22) % 11;
    ctx.fillStyle = "rgba(126, 200, 232, 0.07)";
    for (let i = 0; i < 18; i++) {
      const x = ((i * 97 + clock * 40) % (w + 80)) - 40;
      const y = (i * 53 + drift * 9) % h;
      ctx.fillRect(x, y, 1.2, 14 + (i % 5) * 4);
    }
  }, [clock, light]);

  const bar = Math.round((Math.min(100, Math.max(0, percent)) / 100) * 28);

  return (
    <div
      className={`machine-intro${exiting ? " is-exit" : ""}${light ? " is-light" : ""}`}
      onClick={onSkip}
      role="dialog"
      aria-label="machine startup"
      aria-modal="true"
    >
      {light ? null : <canvas ref={canvasRef} aria-hidden />}
      <div className="machine-intro-copy">
        <p className="machine-cover-title">{title}</p>
        <p className="machine-cover-line">
          {`[${"#".repeat(bar).padEnd(28, "·")}] ${progress.message}`}
        </p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSkip();
          }}
        >
          skip →
        </button>
      </div>
    </div>
  );
}
