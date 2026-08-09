#!/bin/sh
# Repacks the pristine upstream alpenglow v86 initrd with the alpenglowed
# desktop overlay (bar, launcher, apps, baked site content, init).
# Output: public/v86/alpenglowed-initrd.cpio.gz — committed, so the site
# build never needs cpio.
set -eu
DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
gzip -dc "$DIR/public/v86/alpenglow-v86-initrd.cpio.gz" | (cd "$WORK" && cpio -idm 2>/dev/null)
cp -a "$DIR/os-image/overlay/." "$WORK/"
# Only the overlay's own files — busybox symlinks in usr/bin dangle here.
(cd "$DIR/os-image/overlay" && find . -type f) | while read -r f; do
  chmod 755 "$WORK/${f#./}"
done
(cd "$WORK" && find . | cpio -o -H newc 2>/dev/null | gzip -9) > "$DIR/public/v86/alpenglowed-initrd.cpio.gz"
ls -lh "$DIR/public/v86/alpenglowed-initrd.cpio.gz"
