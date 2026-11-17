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
    if (isField(this.canvas)) {
      frames
        .get(this.canvas)
        ?.push({ text, x, y, maxWidth, alpha: this.globalAlpha });
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
    const expectedRows = new Map();
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (let index = 0; index < node.length; ) {
        const char = String.fromCodePoint(node.textContent.codePointAt(index));
        const range = document.createRange();
        range.setStart(node, index);
        index += char.length;
        range.setEnd(node, index);
        const rect = range.getBoundingClientRect();
        if (!rect.width || rect.bottom < 0 || rect.top > innerHeight) continue;
        const row = Math.floor((rect.y + rect.height / 2) / lineHeight);
        const expected = expectedRows.get(row) ?? {
          text: "",
          right: rect.left,
        };
        if (rect.left - expected.right > rect.width / 2) expected.text += " ";
        expected.text += char;
        expected.right = rect.right;
        expectedRows.set(row, expected);
      }
    }
    const rows = new Map();
    for (const draw of frames.get(canvas) ?? []) {
      if (draw.alpha !== 1) continue;
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
    const lines = [...rows.entries()].map(([y, row]) => {
      let right;
      let text = "";
      for (const draw of row) {
        const left = draw.x - draw.maxWidth / 2;
        if (right !== undefined) {
          if (left < right - 0.1) throw new Error("Canvas text cells overlap");
          if (left - right > draw.maxWidth / 2)
            text += " ".repeat(Math.round((left - right) / draw.maxWidth));
        }
        text += draw.text;
        right = draw.x + draw.maxWidth / 2;
      }
      const expected = expectedRows
        .get(Math.floor(y / lineHeight))
        ?.text.replace(/\s+/g, " ")
        .trim();
      if (text.trim() !== expected)
        throw new Error(
          `Inconsistent canvas spacing: ${JSON.stringify(text.trim())}; expected ${JSON.stringify(expected)}`,
        );
      if (/^[,.;]/.test(text.trim()))
        throw new Error(
          "Project punctuation is orphaned at the start of a line",
        );
      for (const draw of frames.get(canvas) ?? []) {
        if (
          draw.y === y &&
          draw.alpha !== 1 &&
          draw.x >= row[0].x &&
          draw.x <= row.at(-1).x
        )
          throw new Error(
            "Background ASCII occupies whitespace inside a text row",
          );
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
  window.checkLandingClocks = () => {
    const canvas = document.querySelector("canvas[data-content-cells]");
    const draws = frames.get(canvas) ?? [];
    return [...document.querySelectorAll("[data-time-scrubber] > div > a")]
      .filter((link) => link.children.length === 2)
      .map((link) => {
        const [label, time] = link.children;
        const range = document.createRange();
        range.selectNodeContents(label);
        const bounds = range.getBoundingClientRect();
        const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
        const row = Math.floor((bounds.y + bounds.height / 2) / lineHeight);
        const end = time.getBoundingClientRect().right;
        const cells = draws.filter(
          (draw) =>
            draw.alpha === 1 &&
            Math.floor(draw.y / lineHeight) === row &&
            draw.x >= bounds.left - draw.maxWidth &&
            draw.x < end,
        );
        const text = cells.map((draw) => draw.text).join("");
        if (
          !text.startsWith(label.textContent) ||
          !/^\d{2}:\d{2}:\d{2}$/.test(text.slice(label.textContent.length))
        )
          throw new Error("Clock copy is incomplete: " + text);
        const lastLabel = cells[label.textContent.length - 1];
        const firstTime = cells[label.textContent.length];
        const right = lastLabel.x + lastLabel.maxWidth / 2;
        const left = firstTime.x - firstTime.maxWidth / 2;
        const gap = left - right;
        const expectedGap = time.getBoundingClientRect().left - bounds.right;
        if (
          gap < firstTime.maxWidth * 0.9 ||
          Math.abs(gap - expectedGap) > firstTime.maxWidth + 0.1
        )
          throw new Error(
            "Clock label/time gap was collapsed: " + label.textContent,
          );
        if (
          draws.some(
            (draw) =>
              Math.floor(draw.y / lineHeight) === row &&
              draw.x > right &&
              draw.x < left,
          )
        )
          throw new Error("ASCII occupies the clock label/time gap");
        return {
          label: label.textContent,
          blankCells: Math.round(gap / firstTime.maxWidth),
        };
      });
  };
})();
