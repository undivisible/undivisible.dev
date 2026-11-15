// Instrument the actual canvas draw calls before hydration, not a parallel layout model.
(() => {
  const frames = new Map();
  const prototype = CanvasRenderingContext2D.prototype;
  const clearRect = prototype.clearRect;
  const fillText = prototype.fillText;
  const isField = (canvas) =>
    canvas.matches(".landing-field canvas:not(.invisible)");
  prototype.clearRect = function (...args) {
    if (isField(this.canvas)) frames.set(this.canvas, []);
    return clearRect.apply(this, args);
  };
  prototype.fillText = function (text, x, y, maxWidth) {
    if (isField(this.canvas) && this.globalAlpha === 1) {
      frames.get(this.canvas)?.push({ text, x, y, maxWidth });
    }
    return fillText.apply(this, arguments);
  };
  window.checkLandingCanvas = (selector = ".landing-content") => {
    const page = document.querySelector(".landing");
    const main = page.querySelector(selector);
    const style = getComputedStyle(main);
    if (
      !page.classList.contains("ascii-text-composed") ||
      style.color !== "rgba(0, 0, 0, 0)"
    )
      throw new Error(
        "Text must be integrated into the ASCII canvas, not foreground DOM text",
      );
    const canvas = page.querySelector("canvas[data-content-cells]");
    const bounds = main.getBoundingClientRect();
    const lineHeight = parseFloat(style.lineHeight);
    const rows = new Map();
    for (const draw of frames.get(canvas) ?? []) {
      if (draw.y < bounds.top - lineHeight / 2 || draw.y > bounds.bottom)
        continue;
      if (
        draw.x - draw.maxWidth / 2 < 0 ||
        draw.x + draw.maxWidth / 2 > innerWidth
      )
        throw new Error("A canvas text cell is clipped at the viewport edge");
      const row = rows.get(draw.y) ?? [];
      row.push(draw);
      rows.set(draw.y, row);
    }
    const lines = [...rows.values()].map((row) => {
      let right;
      let text = "";
      for (const draw of row) {
        const left = draw.x - draw.maxWidth / 2;
        if (right !== undefined) {
          if (left < right - 0.1) throw new Error("Canvas text cells overlap");
          if (left - right > draw.maxWidth / 2) text += " ";
        }
        text += draw.text;
        right = draw.x + draw.maxWidth / 2;
      }
      return text;
    });
    const normalize = (text) =>
      text
        .replace(/\s+/g, " ")
        .replace(/\s+([,.;])/g, "$1")
        .trim();
    const actual = normalize(lines.join(" "));
    const expected = normalize(main.textContent);
    if (actual !== expected)
      throw new Error(
        `Canvas text differs from complete page copy:\n${actual}\nExpected:\n${expected}`,
      );
    return "PASS integrated canvas: complete biography, projects and navigation; no clipped or overlapping cells";
  };
})();
