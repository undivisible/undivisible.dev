"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ShaderPalette } from "@/lib/useHongKongDayTheme";

type BirdGroup = {
  y: number;
  size: number;
  duration: number;
  direction: 1 | -1;
  offset: number;
  count: number;
  spreadX: number;
  spreadY: number;
  depth: number;
  flapSpeed: number;
};

type RainDrop = {
  x: number;
  y: number;
  length: number;
  speed: number;
  drift: number;
  alpha: number;
  width: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgba(hex: string, alpha: number) {
  const color = hexToRgb(hex);
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, flap: number) {
  const wingHeight = size * (0.16 + flap * 0.18);
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(1.1, size * 0.12);
  ctx.strokeStyle = `rgba(8, 8, 8, ${alpha})`;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.48, 0);
  ctx.quadraticCurveTo(-size * 0.2, -wingHeight, 0, 0);
  ctx.quadraticCurveTo(size * 0.2, -wingHeight, size * 0.48, 0);
  ctx.stroke();
  ctx.restore();
}

export function Light({ scene, className = "", opacity = 1 }: { scene: ShaderPalette; className?: string; opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(scene);
  const frameRef = useRef<number>(0);

  const birdGroups = useMemo<BirdGroup[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const groupCount = 2 + Math.floor(Math.random() * 3);
    const groups: BirdGroup[] = [];
    for (let index = 0; index < groupCount; index += 1) {
      groups.push({
        y: 0.14 + Math.random() * 0.34,
        size: 10 + Math.random() * 16,
        duration: 14 + Math.random() * 18,
        direction: Math.random() > 0.5 ? 1 : -1,
        offset: Math.random() * 50,
        count: 4 + Math.floor(Math.random() * 5),
        spreadX: 24 + Math.random() * 52,
        spreadY: 8 + Math.random() * 26,
        depth: 0.7 + Math.random() * 0.6,
        flapSpeed: 3 + Math.random() * 4,
      });
    }
    return groups;
  }, []);

  const rainDrops = useMemo<RainDrop[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const drops: RainDrop[] = [];
    const dropCount = 180;

    for (let index = 0; index < dropCount; index += 1) {
      const layer = Math.random();
      drops.push({
        x: Math.random(),
        y: Math.random(),
        length: 8 + layer * 16,
        speed: 0.08 + layer * 0.22,
        drift: -0.018 + Math.random() * 0.036,
        alpha: 0.08 + layer * 0.18,
        width: 0.7 + layer * 0.9,
      });
    }

    return drops;
  }, []);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }
    resize();

    const render = (timeMs: number) => {
      const current = sceneRef.current;
      const t = timeMs * 0.001;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      const day = clamp(current.daylightStrength, 0, 1);
      const dayFlat = 1 - Math.pow(1 - day, 4);
      const twilight = clamp(current.twilightStrength, 0, 1);
      const deepNight = clamp(current.deepNightStrength, 0, 1);
      const midnight = clamp(current.midnightStrength, 0, 1);
      const night = clamp(Math.max(1 - day, deepNight), 0, 1);
      const sun = clamp(current.sunProgress, 0, 1);

      const wallGradient = ctx.createLinearGradient(0, 0, 0, height);
      wallGradient.addColorStop(0, rgba(current.base, 0.2 + day * 0.25 + twilight * 0.15));
      wallGradient.addColorStop(1, rgba(current.shadow, 0.3 + night * 0.35));
      ctx.fillStyle = wallGradient;
      ctx.fillRect(0, 0, width, height);

      if (current.weatherKind === "clear") {
        const sky = ctx.createLinearGradient(0, 0, 0, height * 0.6);
        sky.addColorStop(0, "rgba(226, 240, 255, 0.34)");
        sky.addColorStop(0.6, "rgba(174, 203, 238, 0.22)");
        sky.addColorStop(1, "rgba(120, 155, 194, 0)");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);
      } else if (current.weatherKind === "cloudy") {
        const cloud = ctx.createLinearGradient(0, 0, 0, height);
        cloud.addColorStop(0, "rgba(170, 178, 192, 0.18)");
        cloud.addColorStop(0.5, "rgba(132, 144, 160, 0.14)");
        cloud.addColorStop(1, "rgba(96, 108, 124, 0.1)");
        ctx.fillStyle = cloud;
        ctx.fillRect(0, 0, width, height);
      } else if (current.weatherKind === "rain" || current.weatherKind === "storm") {
        const overcast = ctx.createLinearGradient(0, 0, 0, height);
        overcast.addColorStop(0, "rgba(94, 109, 130, 0.24)");
        overcast.addColorStop(0.5, "rgba(73, 86, 104, 0.2)");
        overcast.addColorStop(1, "rgba(44, 52, 65, 0.18)");
        ctx.fillStyle = overcast;
        ctx.fillRect(0, 0, width, height);
      }

      if (midnight > 0.62) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.52 + (midnight - 0.62) * 1.55})`;
        ctx.fillRect(0, 0, width, height);
      }

      const colorStrength = dayFlat * 0.95 + twilight * 1.08;
      if (colorStrength > 0.02) {
        const centerX = width * (0.33 + sun * 0.34);
        const centerY = height * (0.25 + (1 - day) * 0.09);
        const wash = ctx.createRadialGradient(
          centerX,
          centerY,
          Math.min(width, height) * 0.05,
          width * 0.5,
          height * 0.55,
          Math.max(width, height) * 0.8,
        );
        wash.addColorStop(0, rgba(current.beam, 0.08 + colorStrength * 0.2));
        wash.addColorStop(0.5, rgba(current.beamSecondary, 0.06 + colorStrength * 0.14));
        wash.addColorStop(1, rgba(current.accent, 0));
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, width, height);
      }

      const dawnWeight = twilight * (1 - smoothstep(0.5, 0.72, sun));
      const duskWeight = twilight * smoothstep(0.28, 0.5, sun);
      const streakWeight = clamp(Math.max(dawnWeight, duskWeight), 0, 1);
      if (streakWeight > 0.01) {
        const streakA = ctx.createLinearGradient(width * 0.04, 0, width * 0.96, height);
        streakA.addColorStop(0, rgba(current.beamSecondary, 0));
        streakA.addColorStop(0.5, rgba(current.beam, streakWeight * 0.34));
        streakA.addColorStop(1, rgba(current.beamSecondary, 0));
        ctx.fillStyle = streakA;
        ctx.fillRect(0, 0, width, height);

        const streakB = ctx.createLinearGradient(0, height * 0.15, width, height * 0.9);
        streakB.addColorStop(0, rgba(current.accent, 0));
        streakB.addColorStop(0.55, rgba(current.accent, streakWeight * 0.26));
        streakB.addColorStop(1, rgba(current.accent, 0));
        ctx.fillStyle = streakB;
        ctx.fillRect(0, 0, width, height);

        const twilightBand = ctx.createLinearGradient(0, 0, 0, height);
        twilightBand.addColorStop(0, rgba("#8F78A7", streakWeight * 0.2));
        twilightBand.addColorStop(0.5, rgba("#6D7594", streakWeight * 0.16));
        twilightBand.addColorStop(1, rgba("#43546F", streakWeight * 0.12));
        ctx.fillStyle = twilightBand;
        ctx.fillRect(0, 0, width, height);
      }

      const twilightFog = clamp(twilight * 0.8 + night * 0.16, 0, 1);
      if (twilightFog > 0.01) {
        const coolFog = ctx.createLinearGradient(0, 0, width, height);
        coolFog.addColorStop(0, rgba("#8E86A5", twilightFog * 0.16));
        coolFog.addColorStop(0.5, rgba("#6D7690", twilightFog * 0.12));
        coolFog.addColorStop(1, rgba("#4E5F77", twilightFog * 0.1));
        ctx.fillStyle = coolFog;
        ctx.fillRect(0, 0, width, height);
      }

      if (dayFlat > 0.12) {
        for (const group of birdGroups) {
          const phase = ((t + group.offset) % group.duration) / group.duration;
          const centerX = group.direction > 0
            ? -width * 0.18 + phase * width * 1.36
            : width * 1.18 - phase * width * 1.36;
          const centerY = height * group.y + Math.sin(t * 0.9 + group.offset) * 7;

          for (let index = 0; index < group.count; index += 1) {
            const ring = index % 3;
            const lane = Math.floor(index / 3);
            const x = centerX + (ring - 1) * group.spreadX * (0.55 + lane * 0.2);
            const y = centerY + (lane - 1) * group.spreadY + Math.sin(t * 0.8 + index + group.offset) * 3;
            const depth = group.depth * (0.72 + lane * 0.22);
            const size = group.size * depth;
            const flap = (Math.sin(t * group.flapSpeed + index * 0.75 + group.offset) + 1) * 0.5;
            drawBird(ctx, x, y, size, 0.2 + dayFlat * 0.26, flap);
          }
        }
      }

      if (current.weatherKind === "rain" || current.weatherKind === "storm") {
        const rainStrength = current.weatherKind === "storm" ? 1 : 0.72;
        ctx.strokeStyle = current.weatherKind === "storm"
          ? "rgba(205, 228, 255, 0.28)"
          : "rgba(172, 206, 241, 0.18)";

        for (const drop of rainDrops) {
          const fall = (drop.y + t * drop.speed) % 1;
          const xJitter = Math.sin((t * 1.7 + drop.y * 13.1) * Math.PI * 2) * width * 0.006;
          const drift = Math.sin((t * 0.5 + drop.x * 9.7) * Math.PI * 2) * width * drop.drift;
          const x = drop.x * width + drift + xJitter;
          const y = fall * (height + drop.length * 2) - drop.length;
          const length = drop.length * (current.weatherKind === "storm" ? 1.12 : 0.92);
          ctx.lineWidth = drop.width * rainStrength;
          ctx.strokeStyle = current.weatherKind === "storm"
            ? `rgba(205, 228, 255, ${drop.alpha * 1.15})`
            : `rgba(172, 206, 241, ${drop.alpha})`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - length * 0.34, y + length);
          ctx.stroke();
        }

        if (current.weatherKind === "storm") {
          const flash = smoothstep(0.987, 1, Math.sin(t * 0.95) * 0.5 + Math.sin(t * 0.23 + 1.7) * 0.18 + 0.5);
          if (flash > 0.02) {
            ctx.fillStyle = `rgba(220, 235, 255, ${flash * 0.35})`;
            ctx.fillRect(0, 0, width, height);
          }
        }
      }

      frameRef.current = window.requestAnimationFrame(render);
    };

    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [birdGroups, rainDrops]);

  return <canvas ref={canvasRef} className={className} style={{ opacity }} />;
}
