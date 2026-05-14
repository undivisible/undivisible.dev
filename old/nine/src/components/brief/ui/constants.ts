// Desktop palette (monopo saigon)
export const C = {
  bg: "#000000",
  fg: "#ffffff",
  muted: "#6d6d6d",
  border: "rgba(255,255,255,0.1)",
  faint: "rgba(255,255,255,0.05)",
  // Deep ocean gradient endpoints
  gGreen: "#a0e0ab",
  gAmber: "#ffac2e",
  gRed: "#a52d25",
  // Print legacy (used by print components only)
  cream: "#fff8e6",
  orange: "#ff5705",
  black: "#0a0a0a",
  mid: "#4e4e4e",
  rule: "#e2d9c4",
  bgAlt: "#f4ecda",
} as const;

export const GRADIENT =
  "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.78) 55%, rgba(255,255,255,0.55) 100%)";

export const mono = "var(--font-jetbrains-mono), monospace";
export const sans = "var(--font-instrument-sans), sans-serif";
export const serif = "var(--font-young-serif), serif";
