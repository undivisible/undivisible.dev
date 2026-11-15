#!/usr/bin/env bash
# Run against a built site: bash web/tests/landing-layout.sh http://localhost:4321
# Requires the orb's agent-browser and Chromium.
set -euo pipefail
export AGENT_BROWSER_SESSION="landing-layout-$$"
trap 'agent-browser close >/dev/null 2>&1 || true' EXIT
agent-browser open "${1:-http://localhost:4321}" >/dev/null
agent-browser wait '.landing.unicode-content-ready' >/dev/null

for viewport in '320 700' '412 740' '430 932' '768 1024' '1440 900'; do
  read -r width height <<< "$viewport"
  agent-browser set viewport "$width" "$height" 2 >/dev/null
  for size in 14 12 18; do
    agent-browser eval "(() => {
      const page = document.querySelector('.landing');
      page.style.fontSize = '${size}px';
      page.style.lineHeight = '${size}' === '18' ? '28px' : '20px';
      window.dispatchEvent(new Event('resize'));
      return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    })()" >/dev/null
    agent-browser eval '(() => {
      const main = document.querySelector(".landing-content");
      const bounds = main.getBoundingClientRect();
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        const style = getComputedStyle(node.parentElement);
        if (style.color === "transparent" || /rgba\([^)]*, 0\)$/.test(style.color))
          throw new Error("Readable text was hidden in favor of canvas glyphs");
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)
            throw new Error("Text escapes its content bounds: " + node.textContent);
        }
      }
      const projects = [...main.querySelectorAll("button")];
      const links = [...main.querySelectorAll("nav a")];
      if (projects.length !== 5 || links.length !== 5)
        throw new Error("Missing project or navigation control");
      const controls = [...projects, ...links];
      for (let i = 0; i < controls.length; i++) {
        const label = controls[i].textContent.trim();
        if (!label.startsWith("[") || !label.endsWith("]"))
          throw new Error("Incomplete brackets: " + label);
        const a = controls[i].getBoundingClientRect();
        for (const other of controls.slice(i + 1)) {
          const b = other.getBoundingClientRect();
          if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)
            throw new Error("Overlapping controls: " + label + " and " + other.textContent);
        }
      }
      if (document.documentElement.scrollWidth > innerWidth)
        throw new Error("Horizontal overflow");
      return "Text visible, contained, and controls complete without overlap";
    })()' >/dev/null
    printf 'PASS %sx%s, %spx text\n' "$width" "$height" "$size"
  done
done
