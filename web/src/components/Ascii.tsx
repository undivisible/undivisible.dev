import { useEffect, useMemo, useRef, useState } from "react";
import { layoutAsciiText } from "@/lib/visuals/ascii-text";
import { createAsciiShader } from "@/lib/visuals/ascii-shader";
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
    const inkCanvas = document.createElement("canvas");
    const ink = inkCanvas.getContext("2d", { willReadFrequently: true });
    let contentDirty = true;
    let contentColor = "#ffffff";
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

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      const narrow = width < 1024;
      asciiIntervalMs = narrow ? 1000 / 12 : 1000 / 15;
      const cell = Math.max(8, Math.min(width, height) / (narrow ? 32 : 56));
      const columns = Math.max(
        1,
        page ? Math.ceil(width / 8.4) : Math.floor(width / (cell * 0.9)),
      );
      const rows = Math.max(
        1,
        page ? Math.ceil(height / 20) : Math.floor(height / cell),
      );
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
      // ASCII canvas at 1:1 — retina resolution is wasted on character art
      const w = Math.max(1, width);
      const h = Math.max(1, height);
      asciiCanvas.width = w;
      asciiCanvas.height = h;
      asciiCanvas.style.width = `${width}px`;
      asciiCanvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
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
      const cols = Math.max(
        1,
        page ? Math.ceil(width / 8.4) : Math.floor(width / (cell * 0.9)),
      );
      const rows = Math.max(
        1,
        page ? Math.ceil(height / 20) : Math.floor(height / cell),
      );
      // Keep the content grid on the DOM font metrics; stretching it can merge adjacent lines.
      const cellWidth = page ? 8.4 : width / cols;
      const cellHeight = page ? 20 : height / rows;
      if (contentDirty && page && ink) {
        contentDirty = false;
        ({
          contentGlyphs,
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
        }));
        asciiCanvas.dataset.contentCells = String(contentGlyphs.size);
        page.classList.add("unicode-content-ready");
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
      const font = `${page ? 14 : Math.max(12, cell * 0.72)}px ${monoFont}, monospace`;
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
          const contentChar = contentGlyphs.get(row * cols + col);
          const inkIndex =
            (Math.min(height - 1, Math.floor(y)) * width +
              Math.min(width - 1, Math.floor(x))) *
              4 +
            3;
          const titleInk = (inkPixels?.[inkIndex] ?? 0) > 80;
          if (contentChar !== undefined || titleInk) {
            ctx.fillStyle = activeCells.has(row * cols + col)
              ? activeColor
              : contentColor;
            ctx.globalAlpha = musicCells.has(row * cols + col)
              ? musicOpacity
              : 1;
          } else if (page) {
            ctx.globalAlpha *= 0.35;
          }
          ctx.fillText(
            contentChar ?? (titleInk ? "▓" : charSet[charIndex]),
            x,
            y,
          );
        }
      }

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
      page?.classList.remove("unicode-content-ready");
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
