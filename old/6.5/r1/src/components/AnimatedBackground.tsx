import { useEffect, useState, useRef } from "react";

type ShapeType = "square" | "triangle" | "circle";

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
  opacity: number;
  retiring?: boolean;
}

export function AnimatedBackground() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const shapesRef = useRef<Shape[]>([]);
  const desiredCountRef = useRef<number>(12);
  const nextIdRef = useRef<number>(10);
  const groupRefs = useRef<Record<number, SVGGElement | null>>({});
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef({ w: window.innerWidth, h: Math.max(window.innerHeight, document.documentElement.scrollHeight || window.innerHeight) });
  const scrollYRef = useRef<number>(window.scrollY || 0);
  const parallax = 0.16; // subtle parallax keeps shapes engaged with scroll

  const brightPalette = useRef<string[]>([
    "#ff0f47", // vivid red
    "#1c6dff", // electric blue
    "#00ff87", // neon green
    "#ffd90f", // bright yellow
  ]);
  const shapeCountRef = useRef<number>(0);

  const pickColorForY = (y: number) => {
    const heroHeight = window.innerHeight * 0.95;
    if (y < heroHeight) {
      // In hero section: white for most shapes, orange for every 5th
      shapeCountRef.current++;
      return shapeCountRef.current % 5 === 0 ? "#ff5705" : "#ffffff";
    }
    // In white sections: cycle through red, blue, green, yellow
    const palette = brightPalette.current;
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const computeTargetCount = () => {
    const viewport = Math.max(1, window.innerHeight || 800);
    const docHeight = sizeRef.current.h;
    const sectionEstimate = Math.max(1, Math.round(docHeight / viewport));
    return Math.min(24, Math.max(12, sectionEstimate * 4));
  };

  useEffect(() => {
    // ensure SVG covers full page so shapes can be placed across document height
    const updateSize = () => {
      const w = window.innerWidth;
      const h = Math.max(window.innerHeight, document.documentElement.scrollHeight || window.innerHeight);
      sizeRef.current = { w, h };
      if (containerRef.current) containerRef.current.style.height = `${h}px`;
      desiredCountRef.current = computeTargetCount();
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const onScroll = () => {
      scrollYRef.current = window.scrollY || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const createShape = (id: number, type: ShapeType): Shape => {
      const { w, h } = sizeRef.current;
      // Spawn GUARANTEED off-screen from random side, like Svelte
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      const margin = 120; // larger margin to ensure off-screen
      let x, y;

      if (side === 0) {
        x = Math.random() * w; // anywhere horizontally
        y = -margin; // above viewport
      } else if (side === 1) {
        x = w + margin; // right of viewport
        y = Math.random() * h;
      } else if (side === 2) {
        x = Math.random() * w;
        y = h + margin; // below viewport
      } else {
        x = -margin; // left of viewport
        y = Math.random() * h;
      }

      // Angle to ensure crossing the screen
      let angle;
      if (side === 0) {
        // From top, angle 30-150° (pointing down)
        angle = ((Math.random() * 120 + 30) * Math.PI) / 180;
      } else if (side === 1) {
        // From right, angle 120-240° (pointing left)
        angle = ((Math.random() * 120 + 120) * Math.PI) / 180;
      } else if (side === 2) {
        // From bottom, angle 210-330° (pointing up)
        angle = ((Math.random() * 120 + 210) * Math.PI) / 180;
      } else {
        // From left, angle 300-60° (pointing right)
        angle = (((Math.random() * 120 + 300) % 360) * Math.PI) / 180;
      }

      const speed = Math.random() * 0.8 + 0.35; // px per frame
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;

      const color = pickColorForY(y);

      return {
        id,
        x,
        y,
        size: Math.random() * 700 + 500, // 1.75x bigger (was 400+300, now 700+500)
        rotation: Math.random() * 360,
        color,
        type,
        dx,
        dy,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        opacity: 0,
      };
    };

    const createInitialShapes = (count: number) => {
      const newShapes: Shape[] = [];
      for (let i = 0; i < count; i++) {
        const types: ShapeType[] = ["square", "triangle", "circle"];
        const type = types[Math.floor(Math.random() * types.length)];
        newShapes.push(createShape(nextIdRef.current++, type));
      }
      shapesRef.current = newShapes;
      setShapes(newShapes);
    };

    const syncShapePool = (target: number) => {
      desiredCountRef.current = target;
      const current = shapesRef.current.slice();
      let mutated = false;

      if (current.length < target) {
        const toAdd = target - current.length;
        for (let i = 0; i < toAdd; i++) {
          const types: ShapeType[] = ["square", "triangle", "circle"];
          const type = types[Math.floor(Math.random() * types.length)];
          current.push(createShape(nextIdRef.current++, type));
        }
        mutated = true;
      } else if (current.length > target) {
        let retiringNeeded = current.length - target;
        for (let i = current.length - 1; i >= 0 && retiringNeeded > 0; i--) {
          if (!current[i].retiring) {
            current[i] = { ...current[i], retiring: true };
            retiringNeeded -= 1;
            mutated = true;
          }
        }
      }

      if (mutated) {
        shapesRef.current = current;
        setShapes(current.slice());
      }
    };

    createInitialShapes(desiredCountRef.current);
    // debug: print initial shapes so devtools can show their coords/colors
    console.debug('AnimatedBackground initial shapes', shapesRef.current.slice(0, 6));

    const adjustInterval = setInterval(() => {
  const base = computeTargetCount();
      const variation = Math.floor(Math.random() * 3) - 1; // -1,0,1
      const newDesired = Math.max(10, Math.min(24, base + variation));
      syncShapePool(newDesired);
    }, 3500);

    const updateShapes = () => {
  const { w, h } = sizeRef.current;
  const heroThreshold = window.innerHeight * 0.95;
      const margin = Math.max(200, Math.floor(w * 0.05));
      const nextShapes: Shape[] = [];
      let removedAny = false;

      shapesRef.current.forEach((shape: Shape) => {
        let newX = shape.x + shape.dx;
        let newY = shape.y + shape.dy;
        let newRotation = (shape.rotation + shape.rotationSpeed) % 360;
        let updatedShape: Shape = { ...shape, x: newX, y: newY, rotation: newRotation };

        const centerY = scrollYRef.current + window.innerHeight / 2;
        const distY = Math.abs(newY - centerY);
        const maxVis = Math.max(window.innerHeight * 0.8, 220);
        let targetOpacity = Math.max(0.7, Math.min(1, 1 - distY / maxVis));
        if (updatedShape.retiring) {
          targetOpacity = 0;
        } else if (updatedShape.y < heroThreshold) {
          // In hero: higher opacity for visibility on black
          targetOpacity = Math.min(targetOpacity, updatedShape.color === "#ff5705" ? 0.9 : 0.75);
        } else {
          // In white sections: VERY bright, vibrant colors - highly visible
          targetOpacity = 1.0;
        }

        if (newX < -margin || newX > w + margin || newY < -margin || newY > h + margin) {
          if (!updatedShape.retiring) {
          // Determine current side
          let newSide: number;
          if (newY < -margin / 2) newSide = 0;
          else if (newX > w + margin / 2) newSide = 1;
          else if (newY > h + margin / 2) newSide = 2;
          else newSide = 3;

          let spawnSide = newSide;
          do {
            spawnSide = Math.floor(Math.random() * 4);
          } while (spawnSide === newSide);

          let spawnX: number;
          let spawnY: number;
          if (spawnSide === 0) {
            spawnX = Math.random() * w;
            spawnY = -margin;
          } else if (spawnSide === 1) {
            spawnX = w + margin;
            spawnY = Math.random() * h;
          } else if (spawnSide === 2) {
            spawnX = Math.random() * w;
            spawnY = h + margin;
          } else {
            spawnX = -margin;
            spawnY = Math.random() * h;
          }

          let newAngle = 0;
          if (spawnSide === 0) {
            newAngle = ((Math.random() * 120 + 30) * Math.PI) / 180;
          } else if (spawnSide === 1) {
            newAngle = ((Math.random() * 120 + 120) * Math.PI) / 180;
          } else if (spawnSide === 2) {
            newAngle = ((Math.random() * 120 + 210) * Math.PI) / 180;
          } else {
            newAngle = (((Math.random() * 120 + 300) % 360) * Math.PI) / 180;
          }

          const newSpeed = Math.random() * 0.8 + 0.35;
          const newDx = Math.cos(newAngle) * newSpeed;
          const newDy = Math.sin(newAngle) * newSpeed;

          updatedShape = {
            ...updatedShape,
            x: spawnX,
            y: spawnY,
            dx: newDx,
            dy: newDy,
            rotation: Math.random() * 360,
            size: Math.random() * 700 + 500, // 1.75x bigger
            color: pickColorForY(spawnY),
            opacity: 0,
          };
          }
        }

        const newOpacity = Math.max(
          0,
          Math.min(1, (updatedShape.opacity ?? 0) + (targetOpacity - (updatedShape.opacity ?? 0)) * 0.32)
        );

        if (updatedShape.retiring && newOpacity <= 0.02) {
          removedAny = true;
          delete groupRefs.current[updatedShape.id];
          return;
        }

        updatedShape = { ...updatedShape, opacity: newOpacity };
        nextShapes.push(updatedShape);

        const g = groupRefs.current[updatedShape.id];
        if (!g) {
          return;
        }

        const renderX = updatedShape.x;
        const renderY = updatedShape.y - scrollYRef.current * parallax;
        g.setAttribute("transform", `translate(${renderX} ${renderY}) rotate(${updatedShape.rotation})`);

        const svgSize = Math.max(1, updatedShape.size * 0.6);

        const rect = g.querySelector("rect");
        if (rect) {
          rect.setAttribute("width", String(svgSize));
          rect.setAttribute("height", String(svgSize));
          rect.setAttribute("x", String(-svgSize / 2));
          rect.setAttribute("y", String(-svgSize / 2));
          rect.setAttribute("fill", updatedShape.color);
          rect.setAttribute("opacity", String(updatedShape.opacity));
        }

        const circle = g.querySelector("circle");
        if (circle) {
          circle.setAttribute("r", String(svgSize / 2));
          circle.setAttribute("fill", updatedShape.color);
          circle.setAttribute("opacity", String(updatedShape.opacity));
        }

        const poly = g.querySelector("polygon");
        if (poly) {
          const points = `0,${-svgSize / 1.732} ${svgSize / 2},${svgSize / 1.732} ${-svgSize / 2},${svgSize / 1.732}`;
          poly.setAttribute("points", points);
          poly.setAttribute("fill", updatedShape.color);
          poly.setAttribute("opacity", String(updatedShape.opacity));
        }
      });

      shapesRef.current = nextShapes;
      if (removedAny) {
        setShapes(nextShapes.slice());
      }

      animationFrameRef.current = requestAnimationFrame(updateShapes);
    };

    animationFrameRef.current = requestAnimationFrame(updateShapes);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      clearInterval(adjustInterval);
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const getSquarePath = (size: number): string => {
    const half = size / 2;
    return `M ${-half} ${-half} L ${half} ${-half} L ${half} ${half} L ${-half} ${half} Z`;
  };

  const getTrianglePath = (size: number): string => {
    const height = size * 0.866;
    return `M 0 ${-height / 2} L ${size / 2} ${height / 2} L ${-size / 2} ${height / 2} Z`;
  };

  return (
  <div ref={containerRef} className="fixed left-0 top-0 w-full overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {/* Dot matrix overlay - darker grid for light sections (reduced opacity) */}
      <div
        className="absolute inset-0 opacity-[0.24]"
        style={{
          // slightly bigger, brighter dark grid for light sections
          backgroundImage:
            "radial-gradient(circle, rgba(0, 0, 0, 0.32) 3px, transparent 3px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* White dots for black hero section (much dimmer) */}
      <div
        className="absolute left-0 top-0 w-full opacity-[0.22]"
        style={{
          height: '100vh', // cover hero height
          // slightly larger, brighter white dots for the hero
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.42) 3px, transparent 3px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* SVG shapes (viewBox matches Svelte: -50 -50 100 100) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${sizeRef.current.w} ${sizeRef.current.h}`}
        preserveAspectRatio="xMidYMid slice"
          style={{
          maskImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          maskSize: "15px 15px",
          maskRepeat: "repeat",
          WebkitMaskImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          WebkitMaskSize: "15px 15px",
          WebkitMaskRepeat: "repeat",
        }}
      >
        {shapes.map((shape) => {
          // shapes use SVG coordinates directly (matching viewBox -50..50 visible)
          const svgX = shape.x;
          const svgY = shape.y;
          // scale size into SVG units to match DOM updates
          const svgSize = Math.max(1, shape.size * 0.6);

          return (
            <g
              key={shape.id}
              ref={(el: SVGGElement | null) => { groupRefs.current[shape.id] = el; }}
              transform={`translate(${svgX} ${svgY}) rotate(${shape.rotation})`}
            >
              {shape.type === "square" && (
                <rect
                  x={-svgSize / 2}
                  y={-svgSize / 2}
                  width={svgSize}
                  height={svgSize}
                  fill={shape.color}
                  opacity={shape.opacity}
                />
              )}
              {shape.type === "triangle" && (
                <polygon
                  points={`0,${-svgSize / 1.732} ${svgSize / 2},${svgSize / 1.732} ${-svgSize / 2},${svgSize / 1.732}`}
                  fill={shape.color}
                  opacity={shape.opacity}
                />
              )}
              {shape.type === "circle" && (
                <circle r={svgSize / 2} fill={shape.color} opacity={shape.opacity} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
