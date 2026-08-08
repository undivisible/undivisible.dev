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
export function LabAurora({ className = "" }: { className?: string }) {
  return (
    <div className={`lab-aurora ${className}`} aria-hidden>
      <div className="lab-aurora-blobs" />
    </div>
  );
}
