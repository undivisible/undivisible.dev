#!/usr/bin/env bash
set -euo pipefail
root="$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")"
mkdir -p "$root/.amp/in/orb-backup"
bundle="$root/.amp/in/orb-backup/mobile-effects.js"
bun build "$root/web/tests/mobile-effects.js" --outfile "$bundle" >/dev/null
export AGENT_BROWSER_SESSION="mobile-effects-$$"
trap 'agent-browser close >/dev/null 2>&1 || true' EXIT
agent-browser --init-script "$bundle" open about:blank >/dev/null
agent-browser set viewport 412 740 2 >/dev/null
agent-browser open "${1:-http://localhost:4321}" >/dev/null
agent-browser wait --fn 'document.querySelector(".now-playing") && getComputedStyle(document.querySelector(".now-playing")).opacity === "1"' >/dev/null
agent-browser eval 'checkMobileShader()'
agent-browser eval 'checkMusicFade()'
agent-browser eval 'checkVisibleAlbumColor()'
