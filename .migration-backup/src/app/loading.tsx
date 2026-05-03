"use client";

import { Light } from "@/components/Light";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

export default function Loading() {
  const dayTheme = useHongKongDayTheme();

  return (
    <div
      className="site-shell relative h-dvh overflow-hidden"
      style={dayTheme.style}
    >
      <Light
        scene={dayTheme.shader}
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="font-mono text-sm" style={{ color: "var(--page-text)", opacity: 0.5 }}>
          Loading…
        </div>
      </div>
    </div>
  );
}
