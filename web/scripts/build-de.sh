#!/bin/sh
# Builds the alpenglowed compositor and its widget clients as static i686
# binaries, straight into the initramfs overlay. Zig is the cross compiler:
# no system 32-bit toolchain, no container.
set -eu
DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
SRC="$DIR/os-image/de"
OUT="$DIR/os-image/overlay/usr/bin"

cd "$SRC"
zig build
zig cc -target x86-linux-musl -static -O2 -s -I. -o "$OUT/alpenresize" alpenresize.c
echo "built alpenresize"
for prog in alpenglowd alpenwall alpenclock alpenmachine alpenname alpenpanel; do
  cp "zig-out/bin/$prog" "$OUT/$prog"
  echo "built $prog"
done
ls -l "$OUT"
