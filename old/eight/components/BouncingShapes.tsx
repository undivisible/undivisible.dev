"use client";

import { useRef, useEffect, useState } from "react";

type ShapeType = "triangle" | "circle" | "square";

interface Shape {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  type: ShapeType;
  dx: number;
  dy: number;
  rotationSpeed: number;
  gradientId: string;
}

interface BouncingShapesProps {
  colorMode: "rgb" | "orange";
}

const GRADIENTS = {
  red: { start: "#660000", end: "#ff007f" },      // Deep Red to Neon Pink
  green: { start: "#004400", end: "#00ffcc" },    // Deep Green to bright Teal
  blue: { start: "#000066", end: "#00f2ff" },     // Deep Blue to Electric Cyan
  orange: { start: "#882200", end: "#ffff00" },   // Deep Burnt Orange to bright Yellow
};

function createShape(
  id: number,
  type: ShapeType,
  colorMode: "rgb" | "orange"
): Shape {
  const size = 30;
  const x = 10 + Math.random() * 80;
  const y = 10 + Math.random() * 80;
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 0.03 + 0.025;
  const gradientId = `grad-${type}-${id}`;

  const colorMap: Record<ShapeType, string> = {
    triangle: "url(#grad-red)",
    circle: "url(#grad-green)",
    square: "url(#grad-blue)",
  };

  return {
    id,
    x,
    y,
    size,
    rotation: Math.random() * 360,
    color: colorMode === "orange" ? "url(#grad-orange)" : colorMap[type],
    type,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    rotationSpeed: (Math.random() - 0.5) * 0.4,
    gradientId,
  };
}

export default function BouncingShapes({ colorMode }: BouncingShapesProps) {
  const shapesRef = useRef<Shape[]>([]);
  const rafRef = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRefs = useRef<Record<number, SVGGElement | null>>({});
  const [shapes, setShapes] = useState<Shape[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const types: ShapeType[] = ["triangle", "circle", "square"];
      const created = types.map((type, i) =>
        createShape(i, type, colorMode)
      );
      shapesRef.current = created;
      setShapes([...created]);
    }

    const animate = () => {
      shapesRef.current.forEach((shape) => {
        shape.x += shape.dx;
        shape.y += shape.dy;
        shape.rotation = (shape.rotation + shape.rotationSpeed) % 360;

        const half = shape.size / 2;
        if (shape.x - half <= 0) {
          shape.x = half;
          shape.dx = Math.abs(shape.dx);
        } else if (shape.x + half >= 100) {
          shape.x = 100 - half;
          shape.dx = -Math.abs(shape.dx);
        }
        if (shape.y - half <= 0) {
          shape.y = half;
          shape.dy = Math.abs(shape.dy);
        } else if (shape.y + half >= 100) {
          shape.y = 100 - half;
          shape.dy = -Math.abs(shape.dy);
        }

        const g = groupRefs.current[shape.id];
        if (g) {
          g.setAttribute(
            "transform",
            `translate(${shape.x} ${shape.y}) rotate(${shape.rotation})`
          );
        }
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [colorMode]);

  useEffect(() => {
    shapesRef.current.forEach((shape) => {
      const colorMap: Record<ShapeType, string> = {
        triangle: "url(#grad-red)",
        circle: "url(#grad-green)",
        square: "url(#grad-blue)",
      };
      shape.color = colorMode === "orange" ? "url(#grad-orange)" : colorMap[shape.type];
    });
    setShapes([...shapesRef.current]);
  }, [colorMode]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{
        maskImage:
          "radial-gradient(circle, rgba(255,255,255,1) 2.5px, transparent 2.5px)",
        maskSize: "20px 20px",
        WebkitMaskImage:
          "radial-gradient(circle, rgba(255,255,255,1) 2.5px, transparent 2.5px)",
        WebkitMaskSize: "20px 20px",
      }}
    >
      <defs>
        <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GRADIENTS.red.start} />
          <stop offset="50%" stopColor="#ff0000" />
          <stop offset="100%" stopColor={GRADIENTS.red.end} />
        </linearGradient>
        <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GRADIENTS.green.start} />
          <stop offset="50%" stopColor="#00ff00" />
          <stop offset="100%" stopColor={GRADIENTS.green.end} />
        </linearGradient>
        <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GRADIENTS.blue.start} />
          <stop offset="50%" stopColor="#0000ff" />
          <stop offset="100%" stopColor={GRADIENTS.blue.end} />
        </linearGradient>
        <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GRADIENTS.orange.start} />
          <stop offset="50%" stopColor="#ff5705" />
          <stop offset="100%" stopColor={GRADIENTS.orange.end} />
        </linearGradient>
      </defs>
      {shapes.map((shape) => {
        const s = shape.size;
        return (
          <g
            key={shape.id}
            ref={(el: SVGGElement | null) => {
              groupRefs.current[shape.id] = el;
            }}
            transform={`translate(${shape.x} ${shape.y}) rotate(${shape.rotation})`}
          >
            {shape.type === "square" && (
              <rect
                x={-s / 2}
                y={-s / 2}
                width={s}
                height={s}
                fill={shape.color}
                style={{ mixBlendMode: "screen", filter: "blur(0.3px)" }}
              />
            )}
            {shape.type === "circle" && (
              <circle
                r={s / 2}
                fill={shape.color}
                style={{ mixBlendMode: "screen", filter: "blur(0.3px)" }}
              />
            )}
            {shape.type === "triangle" && (
              <polygon
                points={`0,${-s * 0.866 / 2} ${s / 2},${s * 0.866 / 2} ${-s / 2},${s * 0.866 / 2}`}
                fill={shape.color}
                style={{ mixBlendMode: "screen", filter: "blur(0.3px)" }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
