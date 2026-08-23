export type MachineStage = "cold" | "loading" | "booting" | "ready" | "failed";

export function cssToGuest(
  xCss: number,
  yCss: number,
  rectW: number,
  rectH: number,
  guestW: number,
  guestH: number,
): { x: number; y: number } {
  if (rectW <= 0 || rectH <= 0) return { x: 0, y: 0 };
  return {
    x: Math.max(0, Math.min(guestW, Math.round((xCss / rectW) * guestW))),
    y: Math.max(0, Math.min(guestH, Math.round((yCss / rectH) * guestH))),
  };
}

export function guestDelta(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { dx: number; dy: number } {
  return { dx: to.x - from.x, dy: to.y - from.y };
}

export function coverVisible(opts: {
  skipped: boolean;
  stage: MachineStage;
}): boolean {
  if (opts.skipped) return false;
  return opts.stage === "cold" || opts.stage === "loading";
}
