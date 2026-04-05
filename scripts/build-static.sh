#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CREPUS_DIR="${CREPUSCULARITY_DIR:-/tmp/crepuscularity-build}"
CREPUS_REF="${CREPUSCULARITY_REF:-web-v3}"
CREPUS_REMOTE="${CREPUSCULARITY_REMOTE:-https://github.com/semitechnological/crepuscularity.git}"
SITE_DIR="${ROOT}/crepuscularity-site"
OUT_DIR="${ROOT}/dist"

cargo_cmd=(cargo)
if command -v rustup >/dev/null 2>&1 && rustup toolchain list 2>/dev/null | grep -q '^stable'; then
  cargo_cmd=(rustup run stable cargo)
  export CARGO="$(rustup which --toolchain stable cargo)"
  export RUSTC="$(rustup which --toolchain stable rustc)"
fi

if ! rustup target list --toolchain stable --installed 2>/dev/null | grep -q wasm32-unknown-unknown; then
  echo "Adding wasm32-unknown-unknown for stable (required for crepus web build)..."
  rustup target add wasm32-unknown-unknown --toolchain stable
fi

if ! command -v wasm-bindgen >/dev/null 2>&1; then
  echo "wasm-bindgen not in PATH — install with: cargo install wasm-bindgen-cli"
  exit 1
fi

if [[ ! -f "${CREPUS_DIR}/Cargo.toml" ]]; then
  echo "Cloning crepuscularity (${CREPUS_REF}) into ${CREPUS_DIR}..."
  rm -rf "${CREPUS_DIR}"
  git clone --depth 1 --branch "${CREPUS_REF}" "${CREPUS_REMOTE}" "${CREPUS_DIR}"
fi

echo "Building crepus CLI (no desktop features, for CI/Linux)..."
(
  cd "${CREPUS_DIR}"
  "${cargo_cmd[@]}" build --release -p crepuscularity-cli --no-default-features
)

rm -rf "${OUT_DIR}"
mkdir -p "${OUT_DIR}"

echo "crepus web build → ${OUT_DIR}"
"${CREPUS_DIR}/target/release/crepus" web build \
  --site "${SITE_DIR}" \
  --out-dir "${OUT_DIR}"

echo "Built. Open via HTTP (WASM + fetch need a server), e.g.:"
echo "  cd ${OUT_DIR} && python3 -m http.server 8080"
