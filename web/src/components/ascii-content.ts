/** Keep DOM text contiguous on each rendered row while preserving row breaks. */
export function contentCell(
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
  previous?: { col: number; row: number; advance?: number },
) {
  const row = Math.floor(y / cellHeight);
  const col =
    previous?.row === row
      ? previous.col + (previous.advance ?? 1)
      : Math.floor(x / cellWidth);
  return {
    col,
    row,
  };
}

/** Full-width CJK glyphs occupy two cells; ordinary text keeps one. */
export function asciiCellAdvance(char: string) {
  const codePoint = char.codePointAt(0) ?? 0;
  return (codePoint >= 0x1100 && codePoint <= 0x11ff) ||
    (codePoint >= 0x2e80 && codePoint <= 0xa4cf) ||
    (codePoint >= 0xa960 && codePoint <= 0xa97f) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7ff) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
    (codePoint >= 0xff01 && codePoint <= 0xff60) ||
    (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
    (codePoint >= 0x20000 && codePoint <= 0x2fa1f) ||
    (codePoint >= 0x30000 && codePoint <= 0x323af)
    ? 2
    : 1;
}

export function fitContentLine<T extends { col: number; advance?: number }>(
  cells: readonly T[],
  columns: number,
) {
  const last = cells.at(-1);
  const lastCol = last?.col;
  const lastAdvance = last?.advance ?? 1;
  const shift =
    lastCol === undefined
      ? 0
      : Math.max(0, lastCol - Math.max(0, columns - 1 - lastAdvance));
  return cells.map((cell) => ({ ...cell, col: cell.col - shift }));
}

export function personalAsciiGrid(width: number, height: number) {
  const mobile = width < 520;
  const cellWidth = mobile ? 4.2 : 8.4;
  const cellHeight = mobile ? 10 : 20;
  return {
    mobile,
    cellWidth,
    cellHeight,
    columns: Math.ceil(width / cellWidth),
    rows: Math.ceil(height / cellHeight),
  };
}

const WORDMARK_GLYPHS: Record<string, readonly string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
};

/** Draw a compact 5×7 block wordmark, sized and centered within its semantic heading. */
export function bitmapWordmark(
  text: string,
  bounds: { left: number; top: number; width: number; height: number },
  fontSize: number,
  verticalScale = 1.35,
) {
  const characters = text.toUpperCase();
  const columns = [...characters].reduce(
    (total, char) => total + (char === " " ? 4 : 6),
    0,
  );
  const unit = Math.min(
    fontSize / 7,
    bounds.width / columns,
    bounds.height / (7 * verticalScale),
  );
  const blockHeight = unit * verticalScale;
  const left = bounds.left + (bounds.width - columns * unit) / 2;
  const top = bounds.top + (bounds.height - 7 * blockHeight) / 2;
  const blocks: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];
  let cursor = 0;

  for (const char of characters) {
    if (char === " ") {
      cursor += 4;
      continue;
    }
    const glyph = WORDMARK_GLYPHS[char];
    if (glyph) {
      glyph.forEach((row, rowIndex) => {
        for (let column = 0; column < row.length; column++) {
          if (row[column] === "1") {
            blocks.push({
              x: left + (cursor + column) * unit,
              y: top + rowIndex * blockHeight,
              width: unit,
              height: blockHeight,
            });
          }
        }
      });
    }
    cursor += 6;
  }

  return blocks;
}
