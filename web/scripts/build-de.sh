#!/bin/sh
# Builds the alpenglowed compositor and its widget clients as static i686
# binaries, straight into the initramfs overlay. Zig is the cross compiler:
# no system 32-bit toolchain, no container.
set -eu
DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
SRC="$DIR/os-image/de"
OUT="$DIR/os-image/overlay/usr/bin"
CC="${CC:-zig cc}"
TARGET=x86-linux-musl

for prog in alpenglowd alpenwall alpenclock alpenmachine alpenname alpenpanel; do
  $CC -target "$TARGET" -static -O2 -s -o "$OUT/$prog" "$SRC/$prog.c"
  echo "built $prog"
done
ls -l "$OUT"
