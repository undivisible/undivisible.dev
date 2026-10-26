import { useEffect, useMemo, useRef, useState } from "react";
import { layoutAsciiText } from "@/lib/visuals/ascii-text";
import { createAsciiShader } from "@/lib/visuals/ascii-shader";
import { personalAsciiGrid } from "@/components/ascii-content";
import type { TrackInfo } from "@/lib/useLastFmVisualData";

type ShapeType = "circle" | "triangle" | "square";

interface ShapeState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: ShapeType;
}

const DEFAULT_COLORS = ["#ffffff", "#cccccc", "#999999", "#666666", "#333333"];
const FIELD_CHARS = ".,:;-=+*#%&";
const SHAPE_CHARS = "@#MW8$&NBG";
const TOUCH_FIELD_FOREGROUND_WEIGHT = 0.82;
const TOUCH_FIELD_ALPHA = 0.68;
/** Ignore sub-pixel/layout-thrash resizes so mobile viewport bars do not wipe canvases each frame */
const RESIZE_STABILITY_PX = 10;

function attachStableResize(container: HTMLElement, apply: () => void) {
  let lastW = Number.NEGATIVE_INFINITY;
  let lastH = Number.NEGATIVE_INFINITY;
  let rafId = 0;

  const run = () => {
    rafId = 0;
    const w = Math.round(container.clientWidth);
    const h = Math.round(container.clientHeight);
    if (w < 8 || h < 8) {
      return;
    }
    if (
      Math.abs(w - lastW) < RESIZE_STABILITY_PX &&
      Math.abs(h - lastH) < RESIZE_STABILITY_PX
    ) {
      return;
    }
    lastW = w;
    lastH = h;
    apply();
  };

  const schedule = () => {
    if (!rafId) {
      rafId = requestAnimationFrame(run);
    }
  };

  const observer = new ResizeObserver(schedule);
  observer.observe(container);
  run();

  return () => {
    observer.disconnect();
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}

function nextShapeType(type: ShapeType): ShapeType {
  if (type === "circle") return "triangle";
  if (type === "triangle") return "square";
  return "circle";
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;

  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

function cssColorToRgb(color: string) {
  const match = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(color);
  return match
    ? [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255]
    : hexToRgb(color);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pointInsideShape(
  px: number,
  py: number,
  shape: ShapeState,
  cos: number,
  sin: number,
) {
  const dx = px - shape.x;
  const dy = py - shape.y;
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;

  if (shape.type === "circle") {
    return rx * rx + ry * ry <= (shape.size * 0.5) ** 2;
  }

  if (shape.type === "square") {
    return Math.abs(rx) <= shape.size * 0.5 && Math.abs(ry) <= shape.size * 0.5;
  }

  const h = shape.size * 0.9;
  const p1 = { x: 0, y: -h * 0.6 };
  const p2 = { x: shape.size * 0.58, y: h * 0.42 };
  const p3 = { x: -shape.size * 0.58, y: h * 0.42 };
  const area = (a: typeof p1, b: typeof p1, c: typeof p1) =>
    (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2;
  const point = { x: rx, y: ry };
  const total = Math.abs(area(p1, p2, p3));
  const a1 = Math.abs(area(point, p2, p3));
  const a2 = Math.abs(area(p1, point, p3));
  const a3 = Math.abs(area(p1, p2, point));
  return Math.abs(total - (a1 + a2 + a3)) < 0.5;
}

export default function Ascii({
  colors = DEFAULT_COLORS,
  track = null,
  ready = false,
  lastFmUsername = "undivisible",
}: {
  colors?: string[];
  track?: TrackInfo | null;
  ready?: boolean;
  lastFmUsername?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const monoFontStackRef = useRef("monospace");
  const colorUniforms = useMemo(
    () =>
      [
        colors[0] ?? DEFAULT_COLORS[0],
        colors[1] ?? DEFAULT_COLORS[1],
        colors[2] ?? DEFAULT_COLORS[2],
        colors[3] ?? DEFAULT_COLORS[3],
        colors[4] ?? DEFAULT_COLORS[4],
      ].map(hexToRgb),
    [colors],
  );
  const colorUniformsRef = useRef(colorUniforms);
  colorUniformsRef.current = colorUniforms;

  // ASCII + physics effect — single rAF loop drives both WebGL and ASCII
  useEffect(() => {
    if (!ready) return;

    const container = containerRef.current;
    const bgCanvas = bgCanvasRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!container || !bgCanvas || !asciiCanvas) return;

    const shader = createAsciiShader(bgCanvas, () => colorUniformsRef.current);
    if (!shader) return;

    const ctx = asciiCanvas.getContext("2d", { alpha: true });
    const sampleCanvas = document.createElement("canvas");
    const sampleCtx = sampleCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!ctx || !sampleCtx) {
      shader.dispose();
      return;
    }

    const page = container.closest(".personal-page");
    const coarsePointer = window.matchMedia("(any-pointer: coarse)");
    const skyCanvas = document.querySelector<HTMLCanvasElement>(".album-sky");
    const skyCtx = skyCanvas?.getContext("2d");
    const titleSampleCanvas = document.createElement("canvas");
    titleSampleCanvas.width = 9;
    titleSampleCanvas.height = 9;
    const titleSampleCtx = titleSampleCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    const albumBackground =
      document.querySelector<HTMLElement>(".album-background");
    const inkCanvas = document.createElement("canvas");
    const ink = inkCanvas.getContext("2d", { willReadFrequently: true });
    let contentDirty = true;
    let contentColor = "#ffffff";
    let contentRgb = cssColorToRgb(contentColor);
    let activeColor = "#ff5705";
    let activeCells = new Set<number>();
    let musicCells = new Set<number>();
    const invalidateContent = () => {
      contentDirty = true;
    };
    const contentObserver = new MutationObserver(invalidateContent);
    const contentResize = new ResizeObserver(invalidateContent);
    if (page) {
      contentObserver.observe(page, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      contentResize.observe(page);
      for (const event of [
        "pointerover",
        "pointerout",
        "focusin",
        "focusout",
        "transitionend",
      ])
        page.addEventListener(event, invalidateContent);
    }
    window.addEventListener("scroll", invalidateContent, { passive: true });
    window.addEventListener("resize", invalidateContent);
    window.addEventListener("site:album-palette", invalidateContent);
    window.addEventListener("site:sky-contrast", invalidateContent);
    void document.fonts.ready.then(invalidateContent);
    let contentGlyphs = new Map<number, string>();
    let contentAdvances = new Map<number, number>();
    let contentArea = new Set<number>();
    let titleCells = new Set<number>();
    let titleBlocks: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];
    let inkPixels: Uint8ClampedArray | undefined;

    const shapes: ShapeState[] = [
      {
        x: 140,
        y: 140,
        vx: 64,
        vy: 52,
        size: 160,
        rotation: 0,
        rotationSpeed: 0.24,
        type: "circle",
      },
      {
        x: 420,
        y: 240,
        vx: -56,
        vy: 60,
        size: 160,
        rotation: 0.8,
        rotationSpeed: -0.22,
        type: "triangle",
      },
      {
        x: 260,
        y: 440,
        vx: 58,
        vy: -54,
        size: 160,
        rotation: -0.4,
        rotationSpeed: 0.2,
        type: "square",
      },
    ];

    let width = 0;
    let height = 0;
    let last = performance.now();
    let asciiIntervalMs = 1000 / 15;
    let lastAscii = 0;
    let titleBackgroundColor = "";
    let lastTitleBackgroundSample = Number.NEGATIVE_INFINITY;

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      lastTitleBackgroundSample = Number.NEGATIVE_INFINITY;
      const narrow = width < 1024;
      asciiIntervalMs = narrow ? 1000 / 12 : 1000 / 15;
      const cell = Math.max(8, Math.min(width, height) / (narrow ? 32 : 56));
      const pageGrid = page ? personalAsciiGrid(width, height) : null;
      const columns = Math.max(
        1,
        pageGrid?.columns ?? Math.floor(width / (cell * 0.9)),
      );
      const rows = Math.max(1, pageGrid?.rows ?? Math.floor(height / cell));
      shader.resize(width, height, columns, rows);
      contentDirty = true;
      const size = Math.max(170, Math.min(width, height) * 0.31);
      shapes[0].x = width * 0.22;
      shapes[0].y = height * 0.22;
      shapes[1].x = width * 0.76;
      shapes[1].y = height * 0.36;
      shapes[2].x = width * 0.48;
      shapes[2].y = height * 0.74;
      for (const shape of shapes) shape.size = size;
      // Keep mouse-desktop backing unchanged; touch text needs Retina sampling.
      const pixelRatio =
        width < 1024 || (page && coarsePointer.matches)
          ? Math.min(Math.max(window.devicePixelRatio || 1, 1), 2)
          : 1;
      const w = Math.max(1, Math.round(width * pixelRatio));
      const h = Math.max(1, Math.round(height * pixelRatio));
      asciiCanvas.width = w;
      asciiCanvas.height = h;
      asciiCanvas.style.width = `${width}px`;
      asciiCanvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      monoFontStackRef.current =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-jetbrains-mono")
          .trim() || "monospace";
    };

    const detachResize = attachStableResize(container, resize);

    const render = (now: number) => {
      frameRef.current = requestAnimationFrame(render);

      if (document.hidden) {
        return;
      }

      // Decorative motion is capped; clocks, scrolling and focus repaint immediately.
      if (!contentDirty && now - lastAscii < asciiIntervalMs) return;
      lastAscii = now;

      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;

      for (const shape of shapes) {
        const padding = shape.size * 0.55 + 12;
        shape.x += shape.vx * delta;
        shape.y += shape.vy * delta;
        shape.rotation += shape.rotationSpeed * delta;

        if (shape.x <= padding || shape.x >= width - padding) {
          shape.vx *= -1;
          shape.x = Math.min(width - padding, Math.max(padding, shape.x));
          shape.type = nextShapeType(shape.type);
        }
        if (shape.y <= padding || shape.y >= height - padding) {
          shape.vy *= -1;
          shape.y = Math.min(height - padding, Math.max(padding, shape.y));
          shape.type = nextShapeType(shape.type);
        }
      }

      const cellDiv = width < 1024 ? 32 : 56;
      const cell = Math.max(8, Math.min(width, height) / cellDiv);
      const pageGrid = page ? personalAsciiGrid(width, height) : null;
      const cols = Math.max(
        1,
        pageGrid?.columns ?? Math.floor(width / (cell * 0.9)),
      );
      const rows = Math.max(1, pageGrid?.rows ?? Math.floor(height / cell));
      const cellWidth = pageGrid?.cellWidth ?? width / cols;
      const cellHeight = pageGrid?.cellHeight ?? height / rows;
      const touchTablet = width >= 651 && coarsePointer.matches;
      const foregroundText = width <= 650 || touchTablet;
      if (contentDirty && page && ink) {
        contentDirty = false;
        ({
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
        } = layoutAsciiText({
          page,
          ink,
          width,
          height,
          cols,
          rows,
          cellWidth,
          cellHeight,
          foregroundText,
        }));
        contentRgb = cssColorToRgb(contentColor);
        asciiCanvas.dataset.contentCells = String(
          contentGlyphs.size + titleCells.size,
        );
        page.classList.add("unicode-content-ready");
        page.classList.toggle("ascii-text-composed", !foregroundText);
      }

      if (sampleCanvas.width !== cols || sampleCanvas.height !== rows) {
        sampleCanvas.width = cols;
        sampleCanvas.height = rows;
      }

      shader.render(now);

      sampleCtx.clearRect(0, 0, cols, rows);
      sampleCtx.drawImage(bgCanvas, 0, 0, cols, rows);
      const pixels = sampleCtx.getImageData(0, 0, cols, rows).data;

      ctx.clearRect(0, 0, width, height);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      const monoFont = monoFontStackRef.current;
      const font = `${page ? (pageGrid?.mobile ? 7 : 14) : Math.max(12, cell * 0.72)}px ${monoFont}, monospace`;
      ctx.font = font;
      ctx.shadowColor = "transparent";

      const music = page?.querySelector(".now-playing");
      const musicOpacity = music ? Number(getComputedStyle(music).opacity) : 1;

      // Precompute cos/sin per shape — avoids 3× trig per cell per shape
      const shapeTrig = shapes.map((s) => ({
        cos: Math.cos(-s.rotation),
        sin: Math.sin(-s.rotation),
      }));

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = (col + 0.5) * cellWidth;
          const y = (row + 0.5) * cellHeight;
          const pixelIndex = (row * cols + col) * 4;
          let r = pixels[pixelIndex] ?? 0;
          let g = pixels[pixelIndex + 1] ?? 0;
          let b = pixels[pixelIndex + 2] ?? 0;
          const brightness = (r + g + b) / 765;
          const insideAnyShape = shapes.some((shape, i) =>
            pointInsideShape(x, y, shape, shapeTrig[i].cos, shapeTrig[i].sin),
          );

          if (insideAnyShape) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
          }

          const charSet = insideAnyShape ? SHAPE_CHARS : FIELD_CHARS;
          const colorWeight = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          const hueWeight = (r - g) * 0.5 + 128;
          const charIndex = Math.min(
            charSet.length - 1,
            Math.floor(
              (colorWeight * 0.7 + (hueWeight / 255) * 0.3) *
                (charSet.length - 1),
            ),
          );

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.globalAlpha = insideAnyShape
            ? clamp(0.86 + brightness * 0.1, 0.78, 0.94)
            : clamp(0.52 + brightness * 0.4, 0.52, 0.94);
          const cellIndex = row * cols + col;
          if (titleCells.has(cellIndex)) continue;
          const contentChar = contentGlyphs.get(cellIndex);
          const contentAdvance = contentAdvances.get(cellIndex) ?? 1;
          const inkIndex =
            (Math.min(height - 1, Math.floor(y)) * width +
              Math.min(width - 1, Math.floor(x))) *
              4 +
            3;
          const largeTextInk = (inkPixels?.[inkIndex] ?? 0) > 80;
          if (
            page &&
            contentArea.has(cellIndex) &&
            contentChar === undefined &&
            !largeTextInk
          )
            continue;
          if (contentChar !== undefined || largeTextInk) {
            ctx.fillStyle = activeCells.has(cellIndex)
              ? activeColor
              : contentColor;
            ctx.globalAlpha = musicCells.has(cellIndex) ? musicOpacity : 1;
          } else if (page) {
            if (touchTablet) {
              const sampleWeight = 1 - TOUCH_FIELD_FOREGROUND_WEIGHT;
              ctx.fillStyle = `rgb(${Math.round(r * sampleWeight + contentRgb[0] * 255 * TOUCH_FIELD_FOREGROUND_WEIGHT)}, ${Math.round(g * sampleWeight + contentRgb[1] * 255 * TOUCH_FIELD_FOREGROUND_WEIGHT)}, ${Math.round(b * sampleWeight + contentRgb[2] * 255 * TOUCH_FIELD_FOREGROUND_WEIGHT)})`;
              ctx.globalAlpha *= TOUCH_FIELD_ALPHA;
            } else {
              // Preserve the established phone and desktop field opacity.
              ctx.globalAlpha *= pageGrid?.mobile ? 0.14 : 0.35;
            }
          }
          if (contentChar !== undefined) {
            const glyphX = x + ((contentAdvance - 1) * cellWidth) / 2;
            ctx.fillText(contentChar, glyphX, y, cellWidth * contentAdvance);
          } else {
            ctx.fillText(charSet[charIndex], x, y);
          }
        }
      }

      if (page && titleCells.size) {
        if (now - lastTitleBackgroundSample >= 750) {
          const backgroundColor = albumBackground
            ? getComputedStyle(albumBackground).backgroundColor
            : getComputedStyle(document.documentElement).backgroundColor;
          const base = cssColorToRgb(backgroundColor).map(
            (channel) => channel * 255,
          );
          let red = base[0];
          let green = base[1];
          let blue = base[2];

          if (
            skyCanvas &&
            skyCtx &&
            skyCanvas.width > 0 &&
            skyCanvas.height > 0
          ) {
            let left = width;
            let top = height;
            let right = 0;
            let bottom = 0;
            for (const block of titleBlocks) {
              left = Math.min(left, block.x);
              top = Math.min(top, block.y);
              right = Math.max(right, block.x + block.width);
              bottom = Math.max(bottom, block.y + block.height);
            }
            const scaleX = skyCanvas.width / Math.max(1, skyCanvas.clientWidth);
            const scaleY =
              skyCanvas.height / Math.max(1, skyCanvas.clientHeight);
            try {
              if (titleSampleCtx) {
                const sampleX = clamp(
                  Math.floor(left * scaleX),
                  0,
                  skyCanvas.width - 1,
                );
                const sampleY = clamp(
                  Math.floor(top * scaleY),
                  0,
                  skyCanvas.height - 1,
                );
                const sampleWidth = Math.max(
                  1,
                  Math.min(
                    skyCanvas.width - sampleX,
                    Math.ceil((right - left) * scaleX),
                  ),
                );
                const sampleHeight = Math.max(
                  1,
                  Math.min(
                    skyCanvas.height - sampleY,
                    Math.ceil((bottom - top) * scaleY),
                  ),
                );
                titleSampleCtx.clearRect(0, 0, 9, 9);
                titleSampleCtx.drawImage(
                  skyCanvas,
                  sampleX,
                  sampleY,
                  sampleWidth,
                  sampleHeight,
                  0,
                  0,
                  9,
                  9,
                );
                const pixels = titleSampleCtx.getImageData(0, 0, 9, 9).data;
                const channels: number[][] = [[], [], []];
                for (let index = 0; index < pixels.length; index += 4) {
                  const alpha = pixels[index + 3] / 255;
                  for (let channel = 0; channel < 3; channel += 1) {
                    channels[channel].push(
                      pixels[index + channel] * alpha +
                        base[channel] * (1 - alpha),
                    );
                  }
                }
                const median = channels.map((channel) => {
                  channel.sort((a, b) => a - b);
                  return channel[Math.floor(channel.length / 2)];
                });
                [red, green, blue] = median;
              }
            } catch {
              // Keep the page background color if the decorative sky is unavailable.
            }
          }

          titleBackgroundColor = `rgb(${Math.round(red)},${Math.round(green)},${Math.round(blue)})`;
          lastTitleBackgroundSample = now;
        }

        // Use a median sky sample so moving bird strokes cannot tint the backing.
        ctx.fillStyle = titleBackgroundColor;
        ctx.globalAlpha = 1;
        for (let row = 0; row < rows; row += 1) {
          let runStart = -1;
          for (let col = 0; col <= cols; col += 1) {
            const quietCell = col < cols && titleCells.has(row * cols + col);
            if (quietCell && runStart < 0) runStart = col;
            if (!quietCell && runStart >= 0) {
              ctx.fillRect(
                runStart * cellWidth,
                row * cellHeight,
                (col - runStart) * cellWidth,
                cellHeight,
              );
              runStart = -1;
            }
          }
        }
      }

      if (page && titleBlocks.length) {
        ctx.fillStyle = contentColor;
        ctx.globalAlpha = 1;
        for (const block of titleBlocks) {
          ctx.fillRect(block.x, block.y, block.width, block.height);
        }
      }
      page?.classList.toggle("ascii-name-ready", titleBlocks.length > 0);

      ctx.globalAlpha = 1;
    };

    frameRef.current = requestAnimationFrame(render);

    const visibilityHandler = () => {
      cancelAnimationFrame(frameRef.current);
      if (!document.hidden) frameRef.current = requestAnimationFrame(render);
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      detachResize();
      shader.dispose();
      if (page)
        for (const event of [
          "pointerover",
          "pointerout",
          "focusin",
          "focusout",
          "transitionend",
        ])
          page.removeEventListener(event, invalidateContent);
      contentObserver.disconnect();
      contentResize.disconnect();
      window.removeEventListener("scroll", invalidateContent);
      window.removeEventListener("resize", invalidateContent);
      window.removeEventListener("site:album-palette", invalidateContent);
      window.removeEventListener("site:sky-contrast", invalidateContent);
      page?.classList.remove(
        "unicode-content-ready",
        "ascii-name-ready",
        "ascii-text-composed",
      );
      document.removeEventListener("visibilitychange", visibilityHandler);
      cancelAnimationFrame(frameRef.current);
    };
  }, [ready]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      style={{ background: "transparent" }}
    >
      <canvas
        ref={bgCanvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full invisible"
      />
      <canvas
        ref={asciiCanvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full [transform:translateZ(0)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/[0.58] via-black/[0.5] to-black/[0.62]"
      />

      {ready && track && (
        <div
          className="pointer-events-auto absolute bottom-8 right-6 z-[2] max-w-[15rem] text-right [font-family:var(--font-jetbrains-mono),monospace] sm:bottom-10 sm:max-w-[16rem]"
          style={{ color: "var(--page-text)" }}
        >
          <a
            href={track.artistUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-base leading-snug underline decoration-transparent underline-offset-2 transition-[color,text-decoration-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:decoration-white/35"
          >
            {track.artist}
          </a>
          <a
            href={track.trackUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block text-sm leading-snug underline decoration-transparent underline-offset-2 transition-[color,text-decoration-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:decoration-white/35"
            style={{ color: "var(--page-text-muted)" }}
          >
            {track.track}
          </a>
          {track.playedAtLabel ? (
            <div
              className="mt-1 text-[10px] normal-case tracking-normal"
              style={{ color: "var(--page-text-muted)" }}
            >
              {track.playedAtLabel}
            </div>
          ) : null}
          <a
            href={`https://www.last.fm/user/${encodeURIComponent(lastFmUsername)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-[10px] uppercase tracking-[0.22em] underline decoration-dotted underline-offset-4 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-90"
            style={{ color: "var(--page-text-soft)" }}
          >
            {track.isNowPlaying ? "now playing" : "last listening to"}
          </a>
        </div>
      )}
    </div>
  );
}
