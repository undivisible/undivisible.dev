import { contentCell } from "@/components/ascii-content";

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
}: {
  page: Element;
  ink: CanvasRenderingContext2D;
  width: number;
  height: number;
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
}) {
  const contentGlyphs = new Map<number, string>();
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
      parent.closest("[aria-hidden=true]")
    )
      continue;
    const style = getComputedStyle(parent);
    if (style.opacity === "0" && !parent.closest(".now-playing")) continue;
    const range = document.createRange();
    let previousCell: { col: number; row: number } | undefined;
    const large = parseFloat(style.fontSize) > 30;
    ink.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    for (let index = 0; index < node.textContent.length; index++) {
      let char = node.textContent[index];
      if (style.textTransform === "uppercase") char = char.toUpperCase();
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.width || rect.bottom < 0 || rect.top > height) continue;
      if (large) {
        ink.fillText(char, rect.x, rect.y);
      } else {
        const point = contentCell(
          rect.x,
          rect.y + rect.height / 2,
          cellWidth,
          cellHeight,
          previousCell,
        );
        previousCell = point;
        if (point.row >= 0 && point.row < rows) {
          const key = point.row * cols + point.col;
          contentGlyphs.set(key, char);
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
  }
  const inkPixels = ink.getImageData(0, 0, width, height).data;
  return {
    contentGlyphs,
    activeCells,
    musicCells,
    activeColor,
    contentColor,
    inkPixels,
  };
}
