/** Only validated RGB values ever cross into the guest debug shell. */
export function albumPaletteCommand(colors: unknown): string | null {
  if (
    !Array.isArray(colors) ||
    colors.length !== 5 ||
    !colors.every(
      (color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color),
    )
  )
    return null;
  return `printf '%s\\n' '${colors.map((color) => color.slice(1)).join(" ")}' > /run/undesk/album-palette.tmp && mv /run/undesk/album-palette.tmp /run/undesk/album-palette\n`;
}
