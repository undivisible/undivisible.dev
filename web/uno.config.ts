import type { UserConfig } from "@unocss/core";
import presetWind4, { type Theme } from "@unocss/preset-wind4";

const config: UserConfig<Theme> = {
  presets: [presetWind4()],
  theme: {
    font: {
      sans: "var(--font-jetbrains-mono), ui-monospace, monospace",
      mono: "var(--font-jetbrains-mono), ui-monospace, monospace",
      serif: "var(--font-young-serif), ui-serif, serif",
      heading: "var(--font-young-serif), ui-serif, serif",
      display:
        "var(--font-instrument-sans), ui-sans-serif, system-ui, sans-serif",
    },
  },
};

export default config;
