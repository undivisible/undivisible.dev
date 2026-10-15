export type AlbumPalette = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  onAccent: string;
  secondary: string;
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
  if (colors.length !== 5 || !colors.every((color) => HEX.test(color)))
    return null;
  const saturated = [...colors].sort((a, b) => {
    const saturation = (color: string) =>
      Math.max(...rgb(color)) - Math.min(...rgb(color));
    return saturation(b) - saturation(a);
  });
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
    secondary: readable(saturated[1]!),
  };
}

export function extractColorsFromCanvasImage(
  image: CanvasImageSource,
): string[] | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 24;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, 24, 24);
    const pixels = context.getImageData(0, 0, 24, 24).data;
    const buckets = new Map<string, number>();
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3]! < 128) continue;
      const color = hex(
        [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!].map((v) =>
          Math.min(255, Math.round(v / 32) * 32),
        ),
      );
      buckets.set(color, (buckets.get(color) ?? 0) + 1);
    }
    const colors = [...buckets]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
    if (!colors.length) return null;
    while (colors.length < 5) colors.push(colors[colors.length - 1]!);
    return colors;
  } catch {
    return null;
  }
}
