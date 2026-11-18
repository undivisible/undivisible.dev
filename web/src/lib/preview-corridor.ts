export function inPreviewCorridor(
  x: number,
  y: number,
  origin: { x: number; y: number },
  bounds: DOMRect,
) {
  const buffer = 16;
  if (
    x < Math.min(origin.x, bounds.left) - buffer ||
    x > Math.max(origin.x, bounds.right) + buffer ||
    y < Math.min(origin.y, bounds.top) - buffer ||
    y > Math.max(origin.y, bounds.bottom) + buffer
  )
    return false;
  const corners: Array<[number, number]> = [
    [bounds.left - 6, bounds.top - 6],
    [bounds.right + 6, bounds.top - 6],
    [bounds.right + 6, bounds.bottom + 6],
    [bounds.left - 6, bounds.bottom + 6],
  ];
  return corners.some(([ax, ay], index) => {
    const [bx, by] = corners[(index + 1) % corners.length]!;
    const area =
      (ax - origin.x) * (by - origin.y) - (ay - origin.y) * (bx - origin.x);
    if (Math.abs(area) < 0.001) return false;
    const u =
      ((x - origin.x) * (by - origin.y) - (y - origin.y) * (bx - origin.x)) /
      area;
    const v =
      ((ax - origin.x) * (y - origin.y) - (ay - origin.y) * (x - origin.x)) /
      area;
    return (
      u >=
        (-buffer * Math.hypot(bx - origin.x, by - origin.y)) / Math.abs(area) &&
      v >=
        (-buffer * Math.hypot(ax - origin.x, ay - origin.y)) / Math.abs(area) &&
      u + v <= 1 + (buffer * Math.hypot(bx - ax, by - ay)) / Math.abs(area)
    );
  });
}
