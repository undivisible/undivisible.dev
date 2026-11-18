#!/usr/bin/env bash
set -euo pipefail
export AGENT_BROWSER_SESSION="landing-reveal-$$"
trap 'agent-browser close >/dev/null 2>&1 || true' EXIT
root="$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")"
expected=$(bun --cwd "$root/web" -e 'import { landingProjectsFromReadme } from "./src/data/readme-projects.generated"; console.log(JSON.stringify(landingProjectsFromReadme))')
agent-browser --init-script "$(dirname "$(realpath "$0")")/landing-reveal.js" open about:blank >/dev/null
for viewport in '412 740' '1440 900'; do
  read -r width height <<< "$viewport"
  agent-browser set viewport "$width" "$height" 2 >/dev/null
  agent-browser open "${1:-http://localhost:4321}" >/dev/null
  agent-browser wait --fn 'window.landingRevealReady?.()' >/dev/null
  agent-browser eval 'checkLandingReveal()'
  sample=$(agent-browser eval 'resolvedCellSample()' --json | jq -c '.data.result')
  agent-browser reload >/dev/null
  agent-browser wait --fn 'window.landingRevealReady?.()' >/dev/null
  agent-browser eval "(() => { const before = $sample; const after = resolvedCellSample(); if (before.length !== 40 || after.length !== 40 || after.filter(cell => before.includes(cell)).length > 28) throw new Error('Reveal order repeats between loads'); return 'PASS fresh randomized cell order'; })()"
  agent-browser hover '[data-project-key=moonshine]' >/dev/null
  agent-browser wait '#project-preview' >/dev/null
  agent-browser mouse move 2 2 >/dev/null
  agent-browser hover '[data-more]' >/dev/null
  agent-browser eval 'if (document.querySelector("#project-preview")) throw new Error("More inherited a project preview")' >/dev/null
  agent-browser eval 'preparePreviewNavigation("[data-more]")' >/dev/null
  agent-browser eval 'resetLandingReveal()' >/dev/null
  agent-browser click '[data-more]' >/dev/null
  agent-browser wait '.landing[data-view=projects]' >/dev/null
  agent-browser wait --fn 'window.landingRevealReady?.() && !!document.querySelector("canvas[data-reveal-state=complete]")' >/dev/null
  agent-browser eval 'checkLandingViewTransition()'
  agent-browser eval 'if (previewNavigationLeak || document.querySelector("#project-preview")) throw new Error("Preview reopened during More transition")' >/dev/null
  agent-browser eval "window.expectedProjects = $expected" >/dev/null
  agent-browser eval '(async () => {
    const controls = [...document.querySelectorAll(".landing-all-projects button")];
    const names = controls.map(control => control.textContent.replace(/[\[\]]/g, "").trim());
    if (document.querySelector("[data-back]").textContent.trim() !== "[back]") throw new Error("back must be lowercase");
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
    if (JSON.stringify(names) !== JSON.stringify(sorted)) throw new Error("Projects and Back are not alphabetized together");
    for (const control of controls) {
      const bounds = control.getBoundingClientRect();
      if (bounds.left < 0 || bounds.right > innerWidth) throw new Error("Project label clips the viewport: " + control.textContent);
    }
    if (document.documentElement.scrollWidth > innerWidth) throw new Error("Expanded projects overflow horizontally");
    if (controls.length !== new Set(expectedProjects.map(project => project.key)).size + 1) throw new Error("README inventory differs");
    for (const project of expectedProjects) {
      const control = controls.find(control => control.dataset.projectKey === project.key);
      if (!control) throw new Error("Missing README project " + project.name);
      control.focus();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const preview = document.querySelector("#project-preview");
      const bounds = preview.getBoundingClientRect();
      if (bounds.left < 12 || bounds.top < 12 || bounds.right > innerWidth - 11 || bounds.bottom > innerHeight - 11) throw new Error("Preview escapes viewport: " + project.name);
      if (preview?.querySelector("p").textContent !== project.desc) throw new Error("Preview differs from README: " + project.name + ": " + preview?.querySelector("p").textContent);
      if (project.href !== "#" && preview.querySelector(":scope > a").href !== new URL(project.href).href) throw new Error("Wrong project URL");
      const stats = preview.querySelector(".landing-preview-languages");
      const entries = Object.entries(project.github?.languages ?? {}).filter(([, bytes]) => bytes > 0).sort((a,b) => b[1]-a[1]);
      const total = entries.reduce((sum, [,bytes]) => sum + bytes, 0);
      const top = entries.filter(([, bytes]) => bytes / total >= 0.001).slice(0,3);
      const other = entries.slice(top.length).reduce((sum, [,bytes]) => sum + bytes, 0);
      if (other) top.push(["Other", other]);
      const label = !project.github ? "GitHub languages: no linked repository" : project.github.languages === null ? "GitHub languages unavailable" : !total ? "GitHub reports no language data" : top.map(([name,bytes]) => name + " " + (bytes/total < 0.001 ? "<0.1" : (bytes/total*100).toFixed(1)) + "%").join(" · ");
      if (stats.textContent !== label) throw new Error("Wrong GitHub language shares: " + project.name);
      for (const share of stats.querySelectorAll(".landing-preview-language-share")) {
        const range = document.createRange();
        range.selectNodeContents(share);
        if (range.getClientRects().length !== 1) throw new Error("Language percentage separated from its name: " + share.textContent);
      }
      if (project.github && stats.querySelector("a").href !== "https://github.com/" + project.github.repository + "#languages") throw new Error("Stats link has wrong repository");
    }
    return "PASS alphabetical README inventory, Back under B, and every keyboard preview";
  })()'
  agent-browser press Escape >/dev/null
  agent-browser scroll up 10000 >/dev/null
  point=$(agent-browser eval '(() => { const r = document.querySelector("[data-project-key=akh]").getBoundingClientRect(); return {x: Math.round(r.left + 2), y: Math.round(r.top + r.height / 2)} })()' --json)
  x=$(printf '%s' "$point" | jq '.data.result.x')
  y=$(printf '%s' "$point" | jq '.data.result.y')
  agent-browser mouse move "$x" "$y" >/dev/null
  agent-browser wait '#project-preview' >/dev/null
  agent-browser eval "window.hoverPoint = {x: $x, y: $y}; window.hoverCard = document.querySelector('#project-preview').getBoundingClientRect().toJSON()" >/dev/null
  agent-browser mouse move "$((x + 8))" "$y" >/dev/null
  agent-browser eval '(() => {
    const card = document.querySelector("#project-preview");
    const box = card.getBoundingClientRect();
    if (getComputedStyle(card).pointerEvents === "none") throw new Error("Hover preview must accept pointer input");
    if (Math.abs(box.top - hoverPoint.y) > 20) throw new Error("Preview is not beside the pointer");
    if (innerWidth > 650 && Math.abs(box.left - hoverCard.left - 8) > 1) throw new Error("Preview did not track pointer movement");
    return "PASS cursor-adjacent hover, pointer tracking and viewport bounds";
  })()'
  agent-browser press Escape >/dev/null
  agent-browser hover '[data-project-key=alpenglow]' >/dev/null
  agent-browser wait '#project-preview' >/dev/null
  agent-browser mouse move 2 2 >/dev/null
  agent-browser hover '[data-back]' >/dev/null
  agent-browser eval 'if (document.querySelector("#project-preview")) throw new Error("back inherited a project preview")' >/dev/null
  agent-browser eval 'preparePreviewNavigation("[data-back]")' >/dev/null
  agent-browser eval 'resetLandingReveal()' >/dev/null
  agent-browser click '[data-back]' >/dev/null
  agent-browser wait '.landing[data-view=home]' >/dev/null
  agent-browser wait --fn 'window.landingRevealReady?.() && !!document.querySelector("canvas[data-reveal-state=complete]")' >/dev/null
  agent-browser eval 'checkLandingViewTransition()'
  agent-browser eval 'if (previewNavigationLeak || document.querySelector("#project-preview")) throw new Error("Preview reopened during back transition")' >/dev/null
  agent-browser eval 'if (!document.activeElement.matches("[data-more]")) throw new Error("Back did not restore keyboard focus")' >/dev/null
done
agent-browser set media dark reduced-motion >/dev/null
agent-browser reload >/dev/null
agent-browser wait --fn 'window.landingRevealReady?.()' >/dev/null
agent-browser eval 'checkLandingReveal(true)'
for target in projects home; do
  agent-browser eval 'resetLandingReveal()' >/dev/null
  if [ "$target" = projects ]; then control='[data-more]'; else control='[data-back]'; fi
  agent-browser click "$control" >/dev/null
  agent-browser wait ".landing[data-view=$target]" >/dev/null
  agent-browser wait --fn 'window.landingRevealReady?.()' >/dev/null
  agent-browser eval 'checkLandingViewTransition(true)'
done
