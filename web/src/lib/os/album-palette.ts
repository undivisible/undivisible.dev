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

/** The guest card uses a fixed ASCII font and a three-line record. */
export function nowPlayingCommand(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const track = value as Record<string, unknown>;
  if (typeof track.track !== "string" || typeof track.artist !== "string")
    return null;
  const clean = (text: string, fallback: string) =>
    text
      .normalize("NFKD")
      .replace(/[^\x20-\x7e]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || fallback;
  const quote = (text: string) => "'" + text.replace(/'/g, "'\\''") + "'";
  const lines = [
    track.isNowPlaying === true ? "listening" : "last played",
    clean(track.track, "Unknown track"),
    clean(track.artist, "Unknown artist"),
  ];
  return (
    "printf '%s\\n' " +
    lines.map(quote).join(" ") +
    " > /run/undesk/now-playing.tmp && mv /run/undesk/now-playing.tmp /run/undesk/now-playing\n"
  );
}
