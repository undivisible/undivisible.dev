import { useEffect, useState } from "react";

/**
 * False during prerender and the first client render, true afterwards.
 *
 * Anything derived from the current time has to wait for this. Routes are
 * prerendered to static HTML, so a clock rendered on the server bakes the
 * build time into the page — and because React keeps the server text for a
 * mismatched node, it then never updates.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return hydrated;
}
