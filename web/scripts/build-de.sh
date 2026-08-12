#!/bin/sh
# Builds undesk (the undivisible /lab desktop) — the compositor and its
# widget clients — as static i686 binaries into the initramfs overlay.
# Zig is the cross compiler: no system 32-bit toolchain, no container.
set -eu
DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
SRC="$DIR/os-image/de"
OUT="$DIR/os-image/overlay/usr/bin"

cd "$SRC"
zig build
for prog in undeskd unwall unclock unmachine uncard unpanel; do
  cp "zig-out/bin/$prog" "$OUT/$prog"
  echo "built $prog"
done
ls -l "$OUT"
