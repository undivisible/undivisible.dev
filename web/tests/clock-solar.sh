#!/usr/bin/env bash
set -euo pipefail
export AGENT_BROWSER_SESSION="clock-solar-$$"
trap 'agent-browser close >/dev/null 2>&1 || true' EXIT
agent-browser open "${1:-http://localhost:4321}" >/dev/null
agent-browser set viewport 1280 800 2 >/dev/null
for motion in no-preference reduce; do
  agent-browser set media --reduced-motion "$motion" >/dev/null
  agent-browser reload >/dev/null
  agent-browser mouse move 1200 750 >/dev/null
  agent-browser wait 'canvas[data-reveal-state=complete]' >/dev/null
  agent-browser eval '(() => {
    window.solarAscii = document.querySelector(".landing-field canvas:not(.invisible)");
    if (document.querySelector(".landing-solar")) throw new Error("Solar scene active at idle");
    const wheel = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
    if (!document.querySelector(".landing-content").dispatchEvent(wheel)) throw new Error("Page wheel was intercepted");
    if (document.querySelector(".landing-solar")) throw new Error("Page wheel activated solar scene");
  })()' >/dev/null
  agent-browser hover '[data-time-scrubber]' >/dev/null
  agent-browser wait '.landing-solar canvas' >/dev/null
  agent-browser wait --fn 'document.querySelector(".landing-solar canvas")?.getContext("2d").getImageData(0, 0, 1, 1).data[3] > 0' >/dev/null
  agent-browser eval '(async () => {
    const clock = document.querySelector("[data-time-scrubber]");
    const time = clock.querySelector("a:has(> span) > span:last-child");
    const minute = () => { const [h,m] = time.textContent.split(":").map(Number); return h * 60 + m; };
    const sky = document.querySelector(".landing-solar canvas");
    const pixels = () => sky.toDataURL();
    const beforePixels = pixels();
    for (const [deltaY, shiftKey, step] of [[100, false, 12], [-100, true, -48]]) {
      const start = minute();
      const event = new WheelEvent("wheel", { deltaY, shiftKey, bubbles: true, cancelable: true });
      if (clock.dispatchEvent(event)) throw new Error("Clock wheel did not prevent page scroll");
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if ((minute() - start + 1440) % 1440 !== (step + 1440) % 1440) throw new Error("Clock wheel changed the original scrub step");
    }
    if (pixels() === beforePixels) throw new Error("Solar canvas did not repaint after scrubbing");
    if (window.solarAscii !== document.querySelector(".landing-field canvas:not(.invisible)")) throw new Error("Scrubbing replaced persistent ASCII canvas");
    return "PASS idle, scoped wheel, original 12/48 minute steps, solar paint and persistent ASCII";
  })()'
  agent-browser mouse move 1200 750 >/dev/null
  agent-browser wait --fn '!document.querySelector(".landing-solar") && document.querySelector(".personal-clock").dataset.timePreview === "false"' >/dev/null
  agent-browser hover '[data-time-scrubber]' >/dev/null
  agent-browser wait '.landing-solar canvas' >/dev/null
  # Keyboard activation while the pointer remains on the clock exercises navigation cleanup.
  agent-browser focus '[data-more]' >/dev/null
  agent-browser press Enter >/dev/null
  agent-browser wait '.landing[data-view=projects]' >/dev/null
  agent-browser wait 'canvas[data-reveal-state=complete]' >/dev/null
  agent-browser eval '(() => {
    if (document.querySelector(".landing-solar")) throw new Error("Solar scene survived navigation");
    if (window.solarAscii !== document.querySelector(".landing-field canvas:not(.invisible)")) throw new Error("Navigation replaced persistent ASCII canvas");
    return "PASS leave/reset and keyboard navigation cleanup";
  })()'
done
