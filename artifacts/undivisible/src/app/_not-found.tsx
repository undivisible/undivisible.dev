"use client";

import { Light } from "@/components/Light";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

export default function NotFound() {
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
        <div className="text-center font-mono" style={{ color: "var(--page-text)" }}>
          <div className="text-[clamp(3rem,8vw,6rem)] font-bold leading-tight">404</div>
          <div className="mt-4 text-[clamp(1rem,2vw,1.5rem)] opacity-80">Page not found</div>
          <a
            href="/"
            className="mt-8 inline-block text-sm underline underline-offset-4 opacity-60 hover:opacity-100"
            style={{ color: "var(--page-text)" }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
