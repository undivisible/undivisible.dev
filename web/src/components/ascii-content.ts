/** A text character replaces the field cell it occupies, rather than covering it. */
export function contentCell(
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
) {
  return { col: Math.floor(x / cellWidth), row: Math.floor(y / cellHeight) };
}
