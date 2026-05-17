import { useEffect, useState } from "react";

const NARROW_MAX_WIDTH = 1024;

function prefersSaveData() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;
  return Boolean(connection?.saveData);
}

function isNarrowViewport() {
  return window.innerWidth < NARROW_MAX_WIDTH;
}

/**
 * Full-screen WebGL / ASCII / animated sky are desktop-only.
 * Mobile and reduced-motion users get CSS backgrounds instead.
 */
export function useSiteVisualEffects() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia(`(max-width: ${NARROW_MAX_WIDTH - 1}px)`);

    const sync = () => {
      setEnabled(
        !motion.matches && !narrow.matches && !prefersSaveData(),
      );
    };

    sync();
    motion.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    window.addEventListener("resize", sync);

    return () => {
      motion.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return enabled;
}
