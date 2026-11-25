import { useEffect, useRef } from "react";

export function WeatherRain({ animated }: { animated: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panel = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !panel || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = 0;
    let entrance: Animation | undefined;
    let drops: { x: number; y: number; speed: number; length: number }[] = [];
    const splashes: { x: number; y: number; age: number }[] = [];

    const resize = () => {
      // Exclude the absolute canvas when measuring the scrollable window.
      canvas.style.height = "0px";
      width = panel.clientWidth;
      height = panel.scrollHeight;
      canvas.style.height = `${height}px`;
      const scale = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      drops = Array.from(
        { length: Math.ceil((width * height) / 5500) },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 270 + Math.random() * 250,
          length: 8 + Math.random() * 11,
        }),
      );
      splashes.length = 0;
    };

    const paint = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      context.clearRect(0, 0, width, height);
      context.strokeStyle = getComputedStyle(canvas).color;
      context.lineWidth = 0.8;
      const bounds = panel.getBoundingClientRect();
      const forecast = panel.querySelector(".weather-forecast");
      const viewport = forecast?.getBoundingClientRect();
      const edges = viewport
        ? [...panel.querySelectorAll(".weather-hour")]
            .map((card) => card.getBoundingClientRect())
            .filter(
              (card) =>
                card.right > viewport.left && card.left < viewport.right,
            )
            .map((card) => ({
              left: Math.max(card.left, viewport.left) - bounds.left,
              right: Math.min(card.right, viewport.right) - bounds.left,
              top: card.top - bounds.top + panel.scrollTop,
            }))
        : [];

      for (const drop of drops) {
        const lastY = drop.y;
        if (animated) {
          drop.x -= dt * 38;
          drop.y += dt * drop.speed;
        }
        const edge = edges.find(
          (card) =>
            lastY < card.top &&
            drop.y >= card.top &&
            drop.x > card.left + 3 &&
            drop.x < card.right - 3,
        );
        if (edge) {
          splashes.push({ x: drop.x, y: edge.top, age: 0 });
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
        if (drop.y > height + drop.length || drop.x < -drop.length) {
          drop.y = -drop.length;
          drop.x = Math.random() * (width + 60);
        }
        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(drop.x + 1.8, drop.y - drop.length);
        context.stroke();
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        const splash = splashes[i];
        splash.age += dt;
        if (splash.age > 0.32) {
          splashes.splice(i, 1);
          continue;
        }
        const progress = splash.age / 0.32;
        context.globalAlpha = 1 - progress;
        for (const direction of [-1, 1]) {
          context.beginPath();
          context.moveTo(splash.x, splash.y);
          context.quadraticCurveTo(
            splash.x + direction * (3 + progress * 3),
            splash.y - 6 * Math.sin(progress * Math.PI),
            splash.x + direction * (4 + progress * 7),
            splash.y - 2 * Math.sin(progress * Math.PI),
          );
          context.stroke();
        }
      }
      context.globalAlpha = 1;
      if (animated) frame = requestAnimationFrame(paint);
    };

    const resizeAndPaint = () => {
      cancelAnimationFrame(frame);
      resize();
      paint(performance.now());
    };
    const observer = new ResizeObserver(resizeAndPaint);
    observer.observe(panel);
    for (const child of panel.children) {
      if (child !== canvas) observer.observe(child);
    }
    resizeAndPaint();
    if (animated)
      entrance = canvas.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 500,
        easing: "ease-out",
      });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      entrance?.cancel();
    };
  }, [animated]);

  return (
    <canvas
      ref={canvasRef}
      className="weather-window-rain"
      aria-hidden="true"
    />
  );
}
