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

# The machine has a real browser (links, framebuffer graphics) but no
# network, so the site travels with it: the pages the static build just
# produced go in as file:// content. Nothing is committed twice — these
# come from out/, which is generated.
SITE="$WORK/usr/share/alpenglowed/web"
if [ -d "$DIR/out" ]; then
  mkdir -p "$SITE"
  for f in index.html agent.html 404.html resume.md agent.md llms.txt now.md favicon.svg banner.png opengraph.jpg; do
    [ -e "$DIR/out/$f" ] && cp "$DIR/out/$f" "$SITE/" || true
  done
  [ -d "$DIR/out/refs" ] && cp -a "$DIR/out/refs" "$SITE/" || true
  cat > "$SITE/start.html" <<'HTML'
<!doctype html>
<meta charset="utf-8">
<title>alpenglow — local</title>
<body bgcolor="#f4f4f2">
<h1>undivisible.dev, offline</h1>
<p>This machine has no network. These pages were baked into the initramfs
by the same build that made the site you are looking at.</p>
<ul>
  <li><a href="index.html">index.html</a> — the home page</li>
  <li><a href="agent.html">agent.html</a> — the page written for agents</li>
  <li><a href="resume.md">resume.md</a></li>
  <li><a href="llms.txt">llms.txt</a></li>
  <li><a href="now.md">now.md</a></li>
</ul>
<p>No JavaScript here — links renders the markup and nothing else runs.</p>
</body>
HTML
fi
# Only the overlay's own files — busybox symlinks in usr/bin dangle here.
(cd "$DIR/os-image/overlay" && find . -type f) | while read -r f; do
  chmod 755 "$WORK/${f#./}"
done
(cd "$WORK" && find . | cpio -o -H newc 2>/dev/null | gzip -9) > "$DIR/public/v86/alpenglowed-initrd.cpio.gz"
ls -lh "$DIR/public/v86/alpenglowed-initrd.cpio.gz"
