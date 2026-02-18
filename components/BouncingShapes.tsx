"use client";

import { useRef, useEffect, useState, useCallback } from "react";

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
}

interface BouncingShapesProps {
  colorMode: "rgb" | "orange";
}

const RGB_COLORS: Record<ShapeType, string> = {
  triangle: "#ff0000",
  circle: "#00ff00",
  square: "#0000ff",
};
const ORANGE_COLOR = "#ff5705";

function createShape(
  id: number,
  type: ShapeType,
  colorMode: "rgb" | "orange",
  w: number,
  h: number
): Shape {
  const size = 30;
  const x = 10 + Math.random() * 80;
  const y = 10 + Math.random() * 80;
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 0.03 + 0.025;

  return {
    id,
    x,
    y,
    size,
    rotation: Math.random() * 360,
    color: colorMode === "orange" ? ORANGE_COLOR : RGB_COLORS[type],
    type,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    rotationSpeed: (Math.random() - 0.5) * 0.4,
  };
}

export default function BouncingShapes({ colorMode }: BouncingShapesProps) {
  const shapesRef = useRef<Shape[]>([]);
  const rafRef = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRefs = useRef<Record<number, SVGGElement | null>>({});
  const [shapes, setShapes] = useState<Shape[]>([]);
  const initializedRef = useRef(false);

  const init = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const types: ShapeType[] = ["triangle", "circle", "square"];
    const created = types.map((type, i) =>
      createShape(i, type, colorMode, 100, 100)
    );
    shapesRef.current = created;
    setShapes([...created]);
  }, [colorMode]);

  useEffect(() => {
    init();

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

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [init]);

  useEffect(() => {
    shapesRef.current.forEach((shape) => {
      shape.color =
        colorMode === "orange" ? ORANGE_COLOR : RGB_COLORS[shape.type];
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
          "radial-gradient(circle, rgba(255,255,255,1) 1.5px, transparent 1.5px)",
        maskSize: "17px 17px",
        WebkitMaskImage:
          "radial-gradient(circle, rgba(255,255,255,1) 1.5px, transparent 1.5px)",
        WebkitMaskSize: "17px 17px",
      }}
    >
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
