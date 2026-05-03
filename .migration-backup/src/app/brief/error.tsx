"use client";

import { useEffect } from "react";
import { Light } from "@/components/Light";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

export default function BriefError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          <p className="mb-4 text-sm opacity-60">Something went wrong.</p>
          <button
            onClick={reset}
            className="text-xs underline underline-offset-4 opacity-40 hover:opacity-80"
            style={{ color: "var(--page-text)" }}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
