export type AlbumPalette = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  onAccent: string;
  secondary: string;
  tertiary: string;
  heading: string;
  label: string;
};

const HEX = /^#[0-9a-f]{6}$/i;
const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex = (channels: number[]) =>
  `#${channels.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
const mix = (a: string, b: string, amount: number) =>
  hex(rgb(a).map((v, i) => v * (1 - amount) + rgb(b)[i]! * amount));

export function contrastRatio(a: string, b: string): number {
  const luminance = (color: string) =>
    rgb(color)
      .map((v) => {
        const n = v / 255;
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!, 0);
  const [first, second] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (first! + 0.05) / (second! + 0.05);
}

export function deriveAlbumPalette(colors: string[]): AlbumPalette | null {
  if (
    (colors.length !== 5 && colors.length !== 8) ||
    !colors.every((color) => HEX.test(color))
  )
    return null;
  const chroma = (color: string) =>
    Math.max(...rgb(color)) - Math.min(...rgb(color));
  const saturated = [...colors].sort((a, b) => chroma(b) - chroma(a));
  const base = saturated[0]!;
  const background = mix(base, "#000000", 0.94);
  const surface = mix(base, "#000000", 0.86);
  const readable = (color: string) => {
    let value = color;
    while (contrastRatio(value, surface) < 4.5)
      value = mix(value, "#ffffff", 0.1);
    return value;
  };
  const accent = readable(base);
  // Spread supporting roles across the cover instead of repeating its dominant hue.
  const distance = (a: string, b: string) =>
    rgb(a).reduce((sum, channel, i) => sum + (channel - rgb(b)[i]!) ** 2, 0);
  const secondarySource = [...colors].sort(
    (a, b) => distance(b, base) * chroma(b) - distance(a, base) * chroma(a),
  )[0]!;
  const tertiarySource = [...colors].sort((a, b) => {
    const score = (color: string) =>
      Math.min(distance(color, base), distance(color, secondarySource)) *
      chroma(color);
    return score(b) - score(a);
  })[0]!;
  const lightest = [...colors].sort(
    (a, b) => contrastRatio(b, "#000000") - contrastRatio(a, "#000000"),
  )[0]!;
  const secondary = readable(secondarySource);
  const tertiary = readable(tertiarySource);
  return {
    background,
    surface,
    text: mix(base, "#ffffff", 0.94),
    muted: readable(mix(base, "#ffffff", 0.6)),
    border: mix(base, "#ffffff", 0.25),
    accent,
    onAccent:
      contrastRatio(accent, "#000000") >= contrastRatio(accent, "#ffffff")
        ? "#000000"
        : "#ffffff",
    secondary,
    tertiary,
    heading: readable(mix(lightest, "#ffffff", 0.5)),
    label: readable(mix(tertiary, "#ffffff", 0.3)),
  };
}

/** Keep frequent cover colors, then choose the furthest remaining color at each step. */
export function selectArtworkColors(
  pixels: ArrayLike<number>,
  count = 5,
): string[] | null {
  const buckets = new Map<string, number>();
  for (let i = 0; i < pixels.length; i += 4) {
    if ((pixels[i + 3] ?? 0) < 128) continue;
    const color = hex(
      [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!].map((value) =>
        Math.min(255, Math.round(value / 16) * 16),
      ),
    );
    buckets.set(color, (buckets.get(color) ?? 0) + 1);
  }
  const candidates = [...buckets].sort((a, b) => b[1] - a[1]);
  if (!candidates.length || count < 1) return null;
  const selected = [candidates.shift()![0]];
  const distance = (a: string, b: string) =>
    rgb(a).reduce((sum, channel, i) => sum + (channel - rgb(b)[i]!) ** 2, 0);
  const maximumPopulation = buckets.get(selected[0]!)!;
  while (selected.length < count && candidates.length) {
    let bestIndex = 0;
    let bestScore = -1;
    for (let i = 0; i < candidates.length; i++) {
      const [color, population] = candidates[i]!;
      const separation = Math.min(
        ...selected.map((other) => distance(color, other)),
      );
      const score =
        separation * (0.65 + 0.35 * Math.sqrt(population / maximumPopulation));
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    selected.push(candidates.splice(bestIndex, 1)[0]![0]);
  }
  while (selected.length < count) selected.push(selected[selected.length - 1]!);
  return selected;
}

export function extractColorsFromCanvasImage(
  image: CanvasImageSource,
  count = 5,
): string[] | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 48;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, 48, 48);
    return selectArtworkColors(context.getImageData(0, 0, 48, 48).data, count);
  } catch {
    return null;
  }
}
