
import { useEffect, useRef } from "react";

// Canvas 2D port of drift-wallpaper's line + place_lines system.
//
// Architecture: grid of fixed basepoints, each with a spring-elastic endpoint
// that oscillates toward the local noise-flow direction. Lines are rendered
// fresh each frame (no persistent trails) — matches the GPU renderer's look.
// Cursor creates a radial repulsion field that perturbs nearby endpoints.
//
// Lava palette: near-black → dark-orange → bright-amber

const LAVA: [
  [number, number, number],
  [number, number, number],
  [number, number, number],
] = [
  [0.08, 0.01, 0.01],
  [0.6, 0.1, 0.02],
  [0.99, 0.65, 0.05],
];

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): string {
  return `rgb(${((a[0] + (b[0] - a[0]) * t) * 255) | 0},${((a[1] + (b[1] - a[1]) * t) * 255) | 0},${((a[2] + (b[2] - a[2]) * t) * 255) | 0})`;
}
function lavaColor(t: number): string {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5
    ? lerpColor(LAVA[0], LAVA[1], t * 2)
    : lerpColor(LAVA[1], LAVA[2], (t - 0.5) * 2);
}

// Value noise + fbm — one call per line per frame
function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
function noise(x: number, y: number): number {
  const ix = Math.floor(x),
    iy = Math.floor(y);
  const fx = x - ix,
    fy = y - iy;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  return (
    hash(ix, iy) * (1 - ux) * (1 - uy) +
    hash(ix + 1, iy) * ux * (1 - uy) +
    hash(ix, iy + 1) * (1 - ux) * uy +
    hash(ix + 1, iy + 1) * ux * uy
  );
}
function fbm(x: number, y: number): number {
  let v = 0,
    w = 0.5;
  for (let i = 0; i < 4; i++) {
    v += w * noise(x, y);
    x = x * 2.07 + 3.13;
    y = y * 2.07 + 1.97;
    w *= 0.5;
  }
  return v;
}

// Grid + spring parameters (tuned to match drift-wallpaper visuals)
const GRID = 15; // px between basepoints — denser grid
const LINE_LEN = 128; // max endpoint length (px) — longer lines
const LINE_WIDTH = 5; // stroke width — thicker
const BEGIN_OFF = 0.15; // fraction of line to skip at start (tail fade-in)
const SPRING_K = 14.0; // spring stiffness
const DAMPING = 5.0; // spring damping
const NOISE_SCALE = 0.002; // noise spatial frequency
const TIME_SCALE = 0.25; // how fast noise evolves
const REPEL_RADIUS = 130; // cursor repulsion radius (px)
const REPEL_STR = 700.0; // repulsion force (px/s²) — equilibrium offset ≈ STR/SPRING_K

interface Line {
  bx: number;
  by: number; // basepoint (fixed grid position)
  ex: number;
  ey: number; // endpoint offset (spring position)
  evx: number;
  evy: number; // endpoint spring velocity
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<[number, number]>([-9999, -9999]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const cvs = canvas;

    let W = 0,
      H = 0;
    let lines: Line[] = [];
    let raf: number;
    const startT = performance.now();
    let lastT = startT;

    function buildGrid() {
      lines = [];
      for (let bx = GRID / 2; bx < W; bx += GRID) {
        for (let by = GRID / 2; by < H; by += GRID) {
          // Seed endpoint in a random direction so lines don't all start at zero
          const seedAngle = Math.random() * Math.PI * 2;
          lines.push({
            bx,
            by,
            ex: Math.cos(seedAngle) * LINE_LEN * 0.3,
            ey: Math.sin(seedAngle) * LINE_LEN * 0.3,
            evx: 0,
            evy: 0,
          });
        }
      }
    }

    function resize() {
      W = cvs.width = window.innerWidth;
      H = cvs.height = window.innerHeight;
      buildGrid();
    }
    resize();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = [e.clientX, e.clientY];
    };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse, { passive: true });

    function draw() {
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05); // cap at 50ms
      lastT = now;
      const t = ((now - startT) / 1000) * TIME_SCALE;

      // Render: near-black fill each frame (tiny alpha preserves 1-frame ghost)
      ctx.fillStyle = "rgba(2,1,0,0.92)";
      ctx.fillRect(0, 0, W, H);

      const [mx, my] = mouseRef.current;

      ctx.lineCap = "round";

      for (const ln of lines) {
        // Organic time evolution: offset x and y at different rates so the
        // flow field rotates slowly rather than translating left.
        const nx = ln.bx * NOISE_SCALE + t * 0.13 + Math.sin(t * 0.07) * 0.4;
        const ny = ln.by * NOISE_SCALE + t * 0.09 + Math.cos(t * 0.05) * 0.4;
        const eps = 0.3;
        // Curl of fbm scalar → divergence-free flow (no sources/sinks)
        const dfdx = (fbm(nx + eps, ny) - fbm(nx - eps, ny)) / (2 * eps);
        const dfdy = (fbm(nx, ny + eps) - fbm(nx, ny - eps)) / (2 * eps);
        let tx = dfdy * LINE_LEN;
        let ty = -dfdx * LINE_LEN;

        // Cursor repulsion: add a radial velocity impulse each frame.
        // Target stays pure noise — lines get nudged away and spring back,
        // so the effect is a fluid disturbance wake, not a frozen circle.
        const dx = ln.bx - mx, dy = ln.by - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_RADIUS * REPEL_RADIUS && d2 > 1) {
          const d = Math.sqrt(d2);
          const impulse = REPEL_STR * (1 - d / REPEL_RADIUS);
          ln.evx += (dx / d) * impulse * dt;
          ln.evy += (dy / d) * impulse * dt;
        }

        // Spring physics: endpoint springs toward (possibly cursor-displaced) target
        const ax = (tx - ln.ex) * SPRING_K - ln.evx * DAMPING;
        const ay = (ty - ln.ey) * SPRING_K - ln.evy * DAMPING;
        ln.evx += ax * dt;
        ln.evy += ay * dt;
        ln.ex  += ln.evx * dt;
        ln.ey  += ln.evy * dt;

        // Draw: tail offset → tip, rounded caps
        const elen = Math.sqrt(ln.ex * ln.ex + ln.ey * ln.ey);
        if (elen < 0.5) continue;

        const ndx = ln.ex / elen, ndy = ln.ey / elen;
        const x0 = ln.bx + ndx * elen * BEGIN_OFF;
        const y0 = ln.by + ndy * elen * BEGIN_OFF;
        const x1 = ln.bx + ln.ex;
        const y1 = ln.by + ln.ey;

        const t_col = Math.min(elen / LINE_LEN, 1.0);
        const opacity = Math.min(t_col * 2.2, 1.0);

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = lavaColor(t_col);
        ctx.lineWidth = LINE_WIDTH * (0.5 + t_col * 0.8);
        ctx.globalAlpha = opacity;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="screen-only"
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      />
      {/* Dark veil — lifts text contrast while preserving the amber glow */}
      <div className="screen-only" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "rgba(0,0,0,0.58)" }} />
    </>
  );
}
