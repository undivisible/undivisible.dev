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
  agent-browser eval 'resetLandingReveal()' >/dev/null
  agent-browser click '[data-more]' >/dev/null
  agent-browser wait '.landing[data-view=projects]' >/dev/null
  agent-browser wait --fn 'window.landingRevealReady?.() && !!document.querySelector("canvas[data-reveal-state=complete]")' >/dev/null
  agent-browser eval 'checkLandingViewTransition()'
  agent-browser eval "window.expectedProjects = $expected" >/dev/null
  agent-browser eval '(async () => {
    const controls = [...document.querySelectorAll(".landing-all-projects button")];
    const names = controls.map(control => control.textContent.replace(/[\[\]]/g, "").trim());
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
      if (preview?.querySelector("p").textContent !== project.desc) throw new Error("Preview differs from README: " + project.name + ": " + preview?.querySelector("p").textContent);
      if (project.href !== "#" && preview.querySelector("a").href !== new URL(project.href).href) throw new Error("Wrong project URL");
    }
    return "PASS alphabetical README inventory, Back under B, and every keyboard preview";
  })()'
  agent-browser press Escape >/dev/null
  agent-browser eval 'resetLandingReveal()' >/dev/null
  agent-browser click '[data-back]' >/dev/null
  agent-browser wait '.landing[data-view=home]' >/dev/null
  agent-browser wait --fn 'window.landingRevealReady?.() && !!document.querySelector("canvas[data-reveal-state=complete]")' >/dev/null
  agent-browser eval 'checkLandingViewTransition()'
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
