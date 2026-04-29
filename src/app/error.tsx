"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="text-center font-mono">
        <p className="mb-4 text-sm opacity-60">Something went wrong.</p>
        <button
          onClick={reset}
          className="text-xs underline underline-offset-4 opacity-40 hover:opacity-80"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
