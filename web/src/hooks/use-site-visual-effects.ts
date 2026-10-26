import { useEffect, useState } from "react";

function prefersSaveData() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;
  return Boolean(connection?.saveData);
}

/**
 * Keep the ASCII field available at every viewport width while respecting
 * reduced-motion and data-saver preferences.
 */
export function useSiteVisualEffects() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setEnabled(!motion.matches && !prefersSaveData());
    };

    sync();
    motion.addEventListener("change", sync);

    return () => {
      motion.removeEventListener("change", sync);
    };
  }, []);

  return enabled;
}
