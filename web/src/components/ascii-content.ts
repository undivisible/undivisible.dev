/** A text character replaces the field cell it occupies, rather than covering it. */
export function contentCell(
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
  previous?: { col: number; row: number },
) {
  const row = Math.floor(y / cellHeight);
  const col = Math.floor(x / cellWidth);
  return {
    col: previous?.row === row ? Math.max(col, previous.col + 1) : col,
    row,
  };
}
