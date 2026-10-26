import {
  bitmapWordmark,
  asciiCellAdvance,
  contentCell,
  fitContentLine,
} from "@/components/ascii-content";

/** Map the semantic DOM to the canvas grid only when its content or layout changes. */
export function layoutAsciiText({
  page,
  ink,
  width,
  height,
  cols,
  rows,
  cellWidth,
  cellHeight,
  foregroundText,
}: {
  page: Element;
  ink: CanvasRenderingContext2D;
  width: number;
  height: number;
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  foregroundText: boolean;
}) {
  const contentGlyphs = new Map<number, string>();
  const contentAdvances = new Map<number, number>();
  const contentArea = new Set<number>();
  const activeCells = new Set<number>();
  const musicCells = new Set<number>();
  const activeColor =
    getComputedStyle(page).getPropertyValue("--album-secondary").trim() ||
    "#ff5705";
  const contentColor =
    getComputedStyle(page).getPropertyValue("--album-text").trim() || "#ffffff";
  ink.canvas.width = width;
  ink.canvas.height = height;
  ink.clearRect(0, 0, width, height);
  ink.fillStyle = "white";
  ink.textBaseline = "top";
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (
      !node.textContent?.trim() ||
      !parent?.closest("main, header, footer") ||
      parent.closest("[aria-hidden=true], #personal-name")
    )
      continue;
    const style = getComputedStyle(parent);
    if (style.opacity === "0" && !parent.closest(".now-playing")) continue;
    const range = document.createRange();
    let previousCell:
      | { col: number; row: number; advance?: number }
      | undefined;
    const cellsByRow = new Map<
      number,
      Array<{ col: number; char: string; advance: number }>
    >();
    const large = parseFloat(style.fontSize) > 30;
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const active = Boolean(
      parent.closest(
        "a:hover, button:hover, a:focus-visible, button:focus-visible",
      ),
    );
    const music = Boolean(parent.closest(".now-playing"));
    ink.font = font;
    for (let index = 0; index < node.textContent.length; ) {
      const charLength = String.fromCodePoint(
        node.textContent.codePointAt(index)!,
      ).length;
      let char = node.textContent.slice(index, index + charLength);
      const nextIndex = index + charLength;
      if (style.textTransform === "uppercase") char = char.toUpperCase();
      range.setStart(node, index);
      range.setEnd(node, nextIndex);
      const rect = range.getBoundingClientRect();
      if (!rect.width || rect.bottom < 0 || rect.top > height) {
        index = nextIndex;
        continue;
      }
      if (large && !foregroundText) {
        ink.fillText(char, rect.x, rect.y);
      } else if (foregroundText) {
        const firstCol = Math.floor(rect.left / cellWidth) - 1;
        const lastCol = Math.ceil(rect.right / cellWidth) + 1;
        const firstRow = Math.floor(rect.top / cellHeight);
        const lastRow = Math.ceil(rect.bottom / cellHeight);
        for (
          let row = Math.max(0, firstRow);
          row < Math.min(rows, lastRow);
          row++
        ) {
          for (
            let col = Math.max(0, firstCol);
            col < Math.min(cols, lastCol);
            col++
          ) {
            contentArea.add(row * cols + col);
          }
        }
      } else {
        const point = contentCell(
          rect.x,
          rect.y + rect.height / 2,
          cellWidth,
          cellHeight,
          previousCell,
        );
        const advance = asciiCellAdvance(char);
        previousCell = { ...point, advance };
        if (point.row >= 0 && point.row < rows) {
          const cells = cellsByRow.get(point.row) ?? [];
          cells.push({ col: point.col, char, advance });
          cellsByRow.set(point.row, cells);
        }
      }
      index = nextIndex;
    }
    for (const [row, cells] of cellsByRow) {
      for (const { col, char, advance } of fitContentLine(cells, cols)) {
        if (col < 0 || col + advance > cols) continue;
        const key = row * cols + col;
        contentGlyphs.set(key, char);
        contentAdvances.set(key, advance);
        for (let offset = 0; offset < advance; offset++) {
          contentArea.add(key + offset);
        }
        if (parent.closest(".now-playing")) musicCells.add(key);
        if (
          parent.closest(
            "a:hover, button:hover, a:focus-visible, button:focus-visible",
          )
        )
          activeCells.add(key);
      }
    }
  }
  const titleCells = new Set<number>();
  let titleBlocks: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];
  const title = page.querySelector("#personal-name");
  const text = title?.textContent?.replace(/\s+/g, " ").trim().toUpperCase();
  if (title && text) {
    const rect = title.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const style = getComputedStyle(title);
      titleBlocks = bitmapWordmark(
        text,
        {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        parseFloat(style.fontSize),
      );
      if (titleBlocks.length) {
        const left = Math.min(...titleBlocks.map((block) => block.x));
        const top = Math.min(...titleBlocks.map((block) => block.y));
        const right = Math.max(
          ...titleBlocks.map((block) => block.x + block.width),
        );
        const bottom = Math.max(
          ...titleBlocks.map((block) => block.y + block.height),
        );
        const firstCol = Math.max(
          0,
          Math.floor((left - cellWidth * 3) / cellWidth),
        );
        const lastCol = Math.min(
          cols,
          Math.ceil((right + cellWidth * 3) / cellWidth),
        );
        const firstRow = Math.max(
          0,
          Math.floor((top - cellHeight * 2.5) / cellHeight),
        );
        const lastRow = Math.min(
          rows,
          Math.ceil((bottom + cellHeight * 2.5) / cellHeight),
        );
        for (let row = firstRow; row < lastRow; row++) {
          for (let col = firstCol; col < lastCol; col++) {
            const cellIndex = row * cols + col;
            if (!contentGlyphs.has(cellIndex) && !contentArea.has(cellIndex)) {
              titleCells.add(cellIndex);
            }
          }
        }
      }
    }
  }
  const inkPixels = ink.getImageData(0, 0, width, height).data;
  return {
    contentGlyphs,
    contentAdvances,
    contentArea,
    titleCells,
    titleBlocks,
    activeCells,
    musicCells,
    activeColor,
    contentColor,
    inkPixels,
  };
}
