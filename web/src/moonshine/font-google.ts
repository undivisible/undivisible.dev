import { googleFont, type FontModule } from "@tschk/moonshine-next/font/google";

export {
  fontLinks,
  fontStyles,
  googleFont,
  type FontModule,
  type FontOptions,
} from "@tschk/moonshine-next/font/google";
export { JetBrains_Mono } from "@tschk/moonshine-next/font/google";

export const Instrument_Sans = googleFont("Instrument Sans");
export const Young_Serif = googleFont("Young Serif");

/**
 * The faces are served from `public/fonts`, not from Google. Two reasons: the
 * page stops depending on a third party to render at all, and the swap from
 * the metric-matched fallback to the real face disappears — over a canvas
 * shader that reflow is very visible.
 *
 * Returning nothing here drops the stylesheet links the renderer would emit.
 */
export function fontHrefs(): string[] {
  return [];
}

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

/** Unicode ranges as Google slices them, so only what a page uses downloads. */
const SUBSETS = {
  latin:
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  "latin-ext":
    "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
} as const;

type SelfHosted = {
  /** Basename of the files under `public/fonts`. */
  slug: string;
  weight: string;
  italic?: boolean;
};

const SELF_HOSTED: Readonly<Record<string, SelfHosted>> = {
  "Instrument Sans": {
    slug: "instrument-sans",
    weight: "400 700",
    italic: true,
  },
  "JetBrains Mono": { slug: "jetbrains-mono", weight: "100 800" },
  "Young Serif": { slug: "young-serif", weight: "400" },
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

function selfHostedFaces(family: string): string {
  const font = SELF_HOSTED[family];
  if (!font) return "";
  const styles: Array<"normal" | "italic"> = font.italic
    ? ["normal", "italic"]
    : ["normal"];
  const faces: string[] = [];
  for (const style of styles) {
    for (const [subset, range] of Object.entries(SUBSETS)) {
      faces.push(
        [
          "@font-face{",
          `font-family:'${family}';`,
          `font-style:${style};`,
          `font-weight:${font.weight};`,
          "font-display:swap;",
          `src:url(/fonts/${font.slug}-${style}-${subset}.woff2) format('woff2');`,
          `unicode-range:${range}`,
          "}",
        ].join(""),
      );
    }
  }
  return faces.join("");
}

export function fontCss(variables: Record<string, FontModule>): string {
  const faces: string[] = [];
  const declarations: string[] = [];
  for (const [name, font] of Object.entries(variables)) {
    const family = familyOf(font);
    faces.push(selfHostedFaces(family));
    const fallback = faceFor(family);
    if (fallback) faces.push(fallback);
    const stack = fallback
      ? `'${family}', '${family} Fallback'`
      : `'${family}'`;
    declarations.push(`${name}:${stack};`);
  }
  return `${faces.join("")}:root{${declarations.join("")}}`;
}
