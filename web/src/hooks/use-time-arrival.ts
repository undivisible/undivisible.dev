"use client";

import { useEffect, useRef, useState } from "react";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import type { NowLocation } from "@/lib/parse-now-markdown";

const MINUTES_IN_DAY = 1440;
const DURATION_MS = 2600;
const HOLD_MS = 420;

/** The short way around the clock face, so it never takes the long road. */
function shortestDelta(from: number, to: number): number {
  const raw = (((to - from) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  return raw > MINUTES_IN_DAY / 2 ? raw - MINUTES_IN_DAY : raw;
}

function minuteInZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  const [hour = "0", minute = "0"] = parts.split(":");
  return Number(hour) * 60 + Number(minute);
}

/**
 * The page opens on the visitor's sky, then travels to his.
 *
 * On load the shader is scrubbed to the hour where the visitor actually is —
 * their own light — and over a couple of seconds it walks the short way round
 * the clock to Hong Kong, so the first thing the site does is show you the
 * distance between you. Then it hands the sky back to real time.
 *
 * Skipped when the visitor is already in the same hour, and when they've asked
 * for reduced motion.
 */
export function useTimeArrival(
  dayTheme: HongKongDayTheme,
  targetTimeZone = "Asia/Hong_Kong",
): NowLocation | null {
  const ran = useRef(false);
  // While the sky is travelling, the clock wears the visitor's own place.
  const [from, setFrom] = useState<NowLocation | null>(null);
  // Read through a ref so a re-rendered theme object can't restart the trip.
  const themeRef = useRef(dayTheme);
  themeRef.current = dayTheme;

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const now = new Date();
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const here = minuteInZone(now, zone);
    const there = minuteInZone(now, targetTimeZone);
    const delta = shortestDelta(here, there);
    if (Math.abs(delta) < 30) return;

    setFrom({
      label: (zone.split("/").pop() ?? zone).replace(/_/g, " ").toLowerCase(),
      utcOffsetMinutes: -now.getTimezoneOffset(),
    });
    themeRef.current.scrubToMinute(here);

    let frame = 0;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let startedAt = 0;

    const step = (time: number) => {
      if (!startedAt) startedAt = time;
      const progress = Math.min((time - startedAt) / DURATION_MS, 1);
      // Ease in and out, no overshoot — it leaves your hour and settles on his.
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      themeRef.current.scrubToMinute(here + delta * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      // Let it sit on his hour for a beat before real time takes over, so the
      // handover doesn't read as a glitch.
      setFrom(null);
      holdTimer = setTimeout(() => themeRef.current.resetScrub(), HOLD_MS);
    };

    // A held beat on the visitor's own sky before it starts moving.
    holdTimer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, HOLD_MS);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (holdTimer) clearTimeout(holdTimer);
    };
  }, [targetTimeZone]);

  return from;
}
