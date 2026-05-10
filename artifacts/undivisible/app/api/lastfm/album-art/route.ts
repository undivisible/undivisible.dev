import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isTrustedAlbumArtUrl(candidate: URL): boolean {
  if (candidate.protocol !== "https:") {
    return false;
  }

  const host = candidate.hostname.toLowerCase();

  if (host === "lastfm.freetls.fastly.net" || host === "userserve.last.fm") {
    return true;
  }

  if (
    host.endsWith(".fastly.net") &&
    (host.includes("lastfm") || host.includes("last-fm"))
  ) {
    return true;
  }

  if (host.endsWith(".last.fm")) {
    return true;
  }

  if (
    (host.endsWith(".akamaized.net") || host.endsWith(".akamaihd.net")) &&
    host.includes("lastfm")
  ) {
    return true;
  }

  return host.includes("lastfm");
}

/** Same-origin bitmap proxy — lets the client sample palette without canvas tainting. */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("u");
  if (!raw || raw.trim() === "") {
    return NextResponse.json({ error: "missing_album_art_url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "invalid_album_art_url" }, { status: 400 });
  }

  if (!isTrustedAlbumArtUrl(target)) {
    return NextResponse.json({ error: "untrusted_art_host" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.href, {
      redirect: "follow",
      headers: { Accept: "image/*,*/*;q=0.8" },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "upstream_art_fetch_failed", status: upstream.status },
        { status: upstream.status >= 400 ? upstream.status : 502 },
      );
    }

    const contentLength = upstream.headers.get("content-length");
    if (
      typeof contentLength === "string" &&
      Number(contentLength) > 6 * 1024 * 1024
    ) {
      return NextResponse.json({ error: "album_art_too_large" }, { status: 413 });
    }

    const contentType =
      upstream.headers.get("content-type")?.split(";")[0]?.trim() ?? "image/jpeg";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "album_art_proxy_error" }, { status: 502 });
  }
}
