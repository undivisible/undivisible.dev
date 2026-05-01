// Desktop palette (monopo saigon)
export const C = {
  bg:     "#000000",
  fg:     "#ffffff",
  muted:  "#6d6d6d",
  border: "rgba(255,255,255,0.1)",
  faint:  "rgba(255,255,255,0.05)",
  // Deep ocean gradient endpoints
  gGreen: "#a0e0ab",
  gAmber: "#ffac2e",
  gRed:   "#a52d25",
  // Print legacy (used by print components only)
  cream:  "#fff8e6",
  orange: "#ff5705",
  black:  "#0a0a0a",
  mid:    "#4e4e4e",
  rule:   "#e2d9c4",
  bgAlt:  "#f4ecda",
} as const;

export const GRADIENT = "linear-gradient(90deg, #a0e0ab, #ff5705 50%, #a52d25)";

export const mono  = "'Chivo Mono', monospace";
export const sans  = "'Instrument Sans', sans-serif";
export const serif = "'Instrument Serif', serif";
