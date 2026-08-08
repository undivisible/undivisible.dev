"use client";

/**
 * The edge-lit gradient from the Omi onboarding backdrop, brought to the web.
 *
 * Nine colour blobs sit just outside the viewport, the whole stack is blurred
 * hard, and a radial mask clears the middle — so colour blooms around the rim
 * and the centre stays quiet enough to set type on. The blobs drift on a slow
 * loop; the mask is what keeps it from reading as a gradient wallpaper.
 *
 * Same nine colours as `app/lib/features/onboarding/backdrop.dart` in omi-v4,
 * so the two projects light the same way.
 */
export function LabAurora({
  className = "",
  /** 0–1 daylight; the aurora belongs to dusk, so it fades as the sun rises. */
  daylight = 0,
}: {
  className?: string;
  daylight?: number;
}) {
  const opacity = 0.85 - Math.min(Math.max(daylight, 0), 1) * 0.62;
  return (
    <div className={`lab-aurora ${className}`} aria-hidden style={{ opacity }}>
      <div className="lab-aurora-blobs" />
    </div>
  );
}
