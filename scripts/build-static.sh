#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CREPUS_DIR="${CREPUSCULARITY_DIR:-/tmp/crepuscularity-build}"
CREPUS_REF="${CREPUSCULARITY_REF:-web-v3}"
CREPUS_REMOTE="${CREPUSCULARITY_REMOTE:-https://github.com/semitechnological/crepuscularity.git}"

if [[ ! -f "${CREPUS_DIR}/Cargo.toml" ]]; then
  echo "Cloning crepuscularity (${CREPUS_REF}) into ${CREPUS_DIR}..."
  rm -rf "${CREPUS_DIR}"
  git clone --depth 1 --branch "${CREPUS_REF}" "${CREPUS_REMOTE}" "${CREPUS_DIR}"
fi

echo "Building crepus CLI (no desktop features, for CI/Linux)..."
cargo_cmd=(cargo)
if command -v rustup >/dev/null 2>&1 && rustup toolchain list 2>/dev/null | grep -q '^stable'; then
  cargo_cmd=(rustup run stable cargo)
fi
(
  cd "${CREPUS_DIR}"
  "${cargo_cmd[@]}" build --release -p crepuscularity-cli --no-default-features
)

OUT="${ROOT}/dist/index.html"
mkdir -p "${ROOT}/dist"
"${CREPUS_DIR}/target/release/crepus" web build \
  --site "${ROOT}/crepuscularity-site" \
  -o "${OUT}"

node "${ROOT}/scripts/apply-crepus-link-placeholders.mjs" "${OUT}"
echo "Static site: file://${OUT}"
