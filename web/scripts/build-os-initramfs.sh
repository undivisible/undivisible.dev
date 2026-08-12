#!/bin/sh
# Repacks the pristine upstream alpenglow v86 initrd with the undesk
# desktop overlay (bar, launcher, apps, baked site content, init).
# Output: public/v86/undesk-initrd.cpio.gz — committed, so the site
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
SITE="$WORK/usr/share/undesk/web"
if [ -d "$DIR/out" ]; then
  mkdir -p "$SITE"
  for f in index.html agent.html 404.html resume.md agent.md llms.txt now.md favicon.svg banner.png opengraph.jpg; do
    [ -e "$DIR/out/$f" ] && cp "$DIR/out/$f" "$SITE/" || true
  done
  [ -d "$DIR/out/refs" ] && cp -a "$DIR/out/refs" "$SITE/" || true
  # The stylesheet and its images too, so netsurf's CSS engine has the real
  # site's CSS to lay out — index.html links /assets/site-*.css. The JS
  # bundle is prerendered content; netsurf's duktape can't run the SPA, so
  # the styled static markup is what a visitor actually sees.
  if [ -d "$DIR/out/assets" ]; then
    mkdir -p "$SITE/assets"
    for a in "$DIR/out/assets/"*.css; do [ -e "$a" ] && cp "$a" "$SITE/assets/"; done
  fi
  for f in favicon.svg banner.png opengraph.jpg; do
    [ -e "$DIR/out/$f" ] && cp "$DIR/out/$f" "$SITE/" || true
  done
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
# The site's own history: every static-era version (v1-v6) travels with the
# machine, browsable offline. v6.5/v8/v9 are unbuilt framework projects and
# stay out; v9.1 and v10 are the two live deployments.
OLD="$WORK/usr/share/undesk/old"
mkdir -p "$OLD"
for v in 1 2 3 4 5 6; do
  [ -d "$DIR/../old/$v" ] && cp -a "$DIR/../old/$v" "$OLD/$v" || true
done
rm -f "$OLD"/*/mail.php
cat > "$OLD/index.html" <<'HTML'
<!doctype html>
<meta charset="utf-8">
<title>undivisible.dev — history</title>
<body bgcolor="#10131c" text="#c4cad6" link="#7ec8e8" vlink="#7ec8e8">
<h1>every undivisible.dev</h1>
<p>The site's whole history, baked into this machine. Versions 1-6 are the
static originals, byte for byte.</p>
<ul>
  <li><a href="1/index.html">v1</a> — where it started</li>
  <li><a href="2/index.html">v2</a></li>
  <li><a href="3/index.html">v3</a></li>
  <li><a href="4/index.html">v4</a></li>
  <li><a href="5/index.html">v5</a></li>
  <li><a href="6/index.html">v6</a></li>
</ul>
<p>v6.5, v8 and v9 were framework builds and need a real toolchain; v9.1
lives at undivisible.dev and v10 is the machine you are inside right now.</p>
<p><a href="../web/index.html">back to the current site</a></p>
</body>
HTML

# Only the overlay's own files — busybox symlinks in usr/bin dangle here.
(cd "$DIR/os-image/overlay" && find . -type f) | while read -r f; do
  chmod 755 "$WORK/${f#./}"
done
# Gzip for the wire only: the host decompresses natively (vm.ts,
# DecompressionStream) and hands v86 the raw cpio, so the emulated cpu
# never pays for the gunzip and the download stays ~10 MB.
(cd "$WORK" && find . | cpio -o -H newc 2>/dev/null | gzip -9) > "$DIR/public/v86/undesk-initrd.cpio.gz"
rm -f "$DIR/public/v86/undesk-initrd.cpio"
ls -lh "$DIR/public/v86/undesk-initrd.cpio.gz"
