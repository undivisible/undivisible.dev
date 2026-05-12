import { useEffect, useMemo, useRef, useState } from "react";
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
const SHADER_DPR_CAP = 1;
const WEBGL_INTERVAL = 1000 / 24;
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

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("[webgl] shader compile failed", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("[webgl] program link failed", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
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
  const webglRenderRef = useRef<((now: number) => void) | null>(null);
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

  // WebGL shader — lifecycle keyed only to `ready`. Palette updates go through
  // colorUniformsRef so Last.fm color changes do not tear down GL (Safari flash).
  useEffect(() => {
    if (!ready) return;

    const canvas = bgCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) {
      console.error("[webgl] unavailable");
      return;
    }

    const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_colorA;
      uniform vec3 u_colorB;
      uniform vec3 u_colorC;
      uniform vec3 u_colorD;
      uniform vec3 u_colorE;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 2; i++) {
          value += amplitude * noise(p);
          p = p * 1.7 + vec2(1.7, 9.2);
          amplitude *= 0.58;
        }
        return value;
      }

      vec3 palette(float t) {
        if (t < 0.25) {
          return mix(u_colorA, u_colorB, smoothstep(0.0, 0.25, t));
        }
        if (t < 0.5) {
          return mix(u_colorB, u_colorC, smoothstep(0.25, 0.5, t));
        }
        if (t < 0.75) {
          return mix(u_colorC, u_colorD, smoothstep(0.5, 0.75, t));
        }
        return mix(u_colorD, u_colorE, smoothstep(0.75, 1.0, t));
      }

      void main() {
        vec2 uv = v_uv;
        vec2 p = uv * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
        float t = u_time * 0.09;

        vec2 flow = vec2(
          fbm(p * 0.9 + vec2(t * 0.45, -t * 0.22)),
          fbm(p * 0.95 + vec2(-t * 0.18, t * 0.34))
        );

        vec2 warped = p + (flow - 0.5) * 0.55;
        float fluid = fbm(warped * 1.45 + vec2(t * 0.26, -t * 0.12));
        fluid = clamp(fluid, 0.0, 1.0);

        vec3 color = palette(fluid);
        float alpha = clamp(0.52 + fluid * 0.9, 0.0, 1.0);
        gl_FragColor = vec4(color * alpha, 1.0);
      }
    `;

    const program = createProgram(gl, vertexSource, fragmentSource);
    if (!program) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const colorALocation = gl.getUniformLocation(program, "u_colorA");
    const colorBLocation = gl.getUniformLocation(program, "u_colorB");
    const colorCLocation = gl.getUniformLocation(program, "u_colorC");
    const colorDLocation = gl.getUniformLocation(program, "u_colorD");
    const colorELocation = gl.getUniformLocation(program, "u_colorE");

    // Keep the hidden shader canvas cheap; the visible ASCII layer samples it down.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, SHADER_DPR_CAP);
      const width = container.clientWidth;
      const height = container.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const detachResize = attachStableResize(container, resize);

    // Store render fn on a ref so the ASCII effect can call it each frame
    let lastWebgl = -Infinity;
    const renderWebGL = (now: number) => {
      if (document.hidden) return;
      if (now - lastWebgl < WEBGL_INTERVAL) return;
      lastWebgl = now;

      const cu = colorUniformsRef.current;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, now * 0.001);
      gl.uniform3fv(colorALocation, cu[0]!);
      gl.uniform3fv(colorBLocation, cu[1]!);
      gl.uniform3fv(colorCLocation, cu[2]!);
      gl.uniform3fv(colorDLocation, cu[3]!);
      gl.uniform3fv(colorELocation, cu[4]!);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    gl.useProgram(program);
    gl.uniform3fv(colorALocation, colorUniformsRef.current[0]!);
    gl.uniform3fv(colorBLocation, colorUniformsRef.current[1]!);
    gl.uniform3fv(colorCLocation, colorUniformsRef.current[2]!);
    gl.uniform3fv(colorDLocation, colorUniformsRef.current[3]!);
    gl.uniform3fv(colorELocation, colorUniformsRef.current[4]!);

    webglRenderRef.current = renderWebGL;

    return () => {
      detachResize();
      webglRenderRef.current = null;
    };
  }, [ready]);

  // ASCII + physics effect — single rAF loop drives both WebGL and ASCII
  useEffect(() => {
    if (!ready) return;

    const container = containerRef.current;
    const bgCanvas = bgCanvasRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!container || !bgCanvas || !asciiCanvas) return;

    const ctx = asciiCanvas.getContext("2d");
    const sampleCanvas = document.createElement("canvas");
    const sampleCtx = sampleCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!ctx || !sampleCtx) return;

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
    // Cap ASCII rendering at 30 fps — text art doesn't need 60
    const ASCII_INTERVAL = 1000 / 30;
    let lastAscii = 0;

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      const size = Math.max(170, Math.min(width, height) * 0.31);
      shapes[0].x = width * 0.22;
      shapes[0].y = height * 0.22;
      shapes[1].x = width * 0.76;
      shapes[1].y = height * 0.36;
      shapes[2].x = width * 0.48;
      shapes[2].y = height * 0.74;
      for (const shape of shapes) shape.size = size;
      // ASCII canvas at 1:1 — retina resolution is wasted on character art
      asciiCanvas.width = Math.max(1, width);
      asciiCanvas.height = Math.max(1, height);
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
      if (document.hidden) {
        frameRef.current = requestAnimationFrame(render);
        return;
      }

      // Drive WebGL from this loop so both are in sync
      webglRenderRef.current?.(now);

      frameRef.current = requestAnimationFrame(render);

      // Throttle ASCII work to 30 fps
      if (now - lastAscii < ASCII_INTERVAL) return;
      lastAscii = now;

      const delta = Math.min((now - last) / 1000, 0.04);
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

      const cell = Math.max(8, Math.min(width, height) / 48);
      const cols = Math.max(1, Math.floor(width / (cell * 0.9)));
      const rows = Math.max(1, Math.floor(height / cell));

      if (sampleCanvas.width !== cols || sampleCanvas.height !== rows) {
        sampleCanvas.width = cols;
        sampleCanvas.height = rows;
      }

      sampleCtx.clearRect(0, 0, cols, rows);
      sampleCtx.drawImage(bgCanvas, 0, 0, cols, rows);
      const pixels = sampleCtx.getImageData(0, 0, cols, rows).data;

      ctx.clearRect(0, 0, width, height);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      const monoFont = monoFontStackRef.current;
      ctx.font = `${Math.max(12, cell * 0.72)}px ${monoFont}, monospace`;
      ctx.shadowColor = "transparent";

      // Precompute cos/sin per shape — avoids 3× trig per cell per shape
      const shapeTrig = shapes.map((s) => ({
        cos: Math.cos(-s.rotation),
        sin: Math.sin(-s.rotation),
      }));

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = (col + 0.5) * (width / cols);
          const y = (row + 0.5) * (height / rows);
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
          ctx.fillText(charSet[charIndex], x, y);
        }
      }

      ctx.globalAlpha = 1;
    };

    frameRef.current = requestAnimationFrame(render);

    const visibilityHandler = () => {
      if (!document.hidden) frameRef.current = requestAnimationFrame(render);
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      detachResize();
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
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      />
      <canvas
        ref={asciiCanvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
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
