import { googleFont, type FontModule } from "@tschk/moonshine-next/font/google";

export {
  fontHrefs,
  fontLinks,
  fontStyles,
  googleFont,
  type FontModule,
  type FontOptions,
} from "@tschk/moonshine-next/font/google";
export { JetBrains_Mono } from "@tschk/moonshine-next/font/google";

export const Instrument_Sans = googleFont("Instrument Sans");
export const Young_Serif = googleFont("Young Serif");

type FallbackMetrics = {
  local: string;
  ascentOverride: string;
  descentOverride: string;
  lineGapOverride: string;
  sizeAdjust: string;
};

const FALLBACK_METRICS: Readonly<Record<string, FallbackMetrics>> = {
  "Young Serif": {
    local: "Times New Roman",
    ascentOverride: "83.16%",
    descentOverride: "29.1%",
    lineGapOverride: "0.0%",
    sizeAdjust: "125.78%",
  },
  "JetBrains Mono": {
    local: "Arial",
    ascentOverride: "75.79%",
    descentOverride: "22.29%",
    lineGapOverride: "0.0%",
    sizeAdjust: "134.59%",
  },
  "Instrument Sans": {
    local: "Arial",
    ascentOverride: "94.42%",
    descentOverride: "24.33%",
    lineGapOverride: "0.0%",
    sizeAdjust: "102.74%",
  },
};

function familyOf(font: FontModule): string {
  return font.style.fontFamily.split(",")[0]!.trim().replace(/^'|'$/g, "");
}

function faceFor(family: string): string {
  const metrics = FALLBACK_METRICS[family];
  if (!metrics) return "";
  return [
    "@font-face{",
    `font-family:${family} Fallback;`,
    `src:local(${metrics.local});`,
    `ascent-override:${metrics.ascentOverride};`,
    `descent-override:${metrics.descentOverride};`,
    `line-gap-override:${metrics.lineGapOverride};`,
    `size-adjust:${metrics.sizeAdjust}`,
    "}",
  ].join("");
}

export function fontCss(variables: Record<string, FontModule>): string {
  const faces: string[] = [];
  const declarations: string[] = [];
  for (const [name, font] of Object.entries(variables)) {
    const family = familyOf(font);
    const face = faceFor(family);
    if (face) faces.push(face);
    const stack = face ? `'${family}', '${family} Fallback'` : `'${family}'`;
    declarations.push(`${name}:${stack};`);
  }
  return `${faces.join("")}:root{${declarations.join("")}}`;
}
