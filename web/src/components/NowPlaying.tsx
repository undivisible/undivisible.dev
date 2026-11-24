"use client";

import { useEffect, useRef, useState } from "react";
import type { LastFmTrackNormalized } from "../lib/lastfmClient";

const profileUrl = `https://www.last.fm/user/${encodeURIComponent(process.env.NEXT_PUBLIC_LASTFM_USERNAME ?? "undivisible")}`;

function safeUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function AlbumPreview({ art }: { art: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    let cancelled = false;
    let frame = 0;
    const reveal = async () => {
      if (!image.naturalWidth) return;
      try {
        await image.decode();
      } catch {
        return;
      }
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      });
    };
    image.addEventListener("load", reveal);
    if (image.complete) void reveal();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      image.removeEventListener("load", reveal);
    };
  }, [art]);

  return (
    <div className="now-playing-preview" data-ready={ready}>
      <img
        ref={imageRef}
        className="now-playing-preview-art"
        src={art}
        alt=""
        width={96}
        height={96}
        decoding="async"
      />
      <div
        className="now-playing-progress"
        role="progressbar"
        aria-label="Playback progress"
        aria-valuetext="Progress unavailable"
      >
        <span className="now-playing-progress-track" aria-hidden="true" />
        <span className="now-playing-progress-label">progress unavailable</span>
      </div>
    </div>
  );
}

export default function NowPlaying({ className = "" }: { className?: string }) {
  const [track, setTrack] = useState<LastFmTrackNormalized | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let current = "";
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    const receive = (event?: Event) => {
      let next: LastFmTrackNormalized | undefined;
      try {
        next =
          event instanceof CustomEvent
            ? event.detail
            : JSON.parse(document.documentElement.dataset.albumTrack ?? "null");
      } catch {
        return;
      }
      if (
        !next ||
        typeof next.track !== "string" ||
        typeof next.artist !== "string"
      )
        return;
      const identity = JSON.stringify(next);
      if (identity === current) return;
      const first = !current;
      current = identity;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      setVisible(false);
      const update = () => {
        setTrack(next!);
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => setVisible(true));
        });
      };
      if (
        first ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        update();
      else timer = setTimeout(update, 180);
    };
    window.addEventListener("site:album-track", receive);
    receive();
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("site:album-track", receive);
    };
  }, []);

  if (!track) return null;
  const art = safeUrl(track.albumArt ?? "");
  const href = safeUrl(track.trackUrl ?? "");
  const artistHref = safeUrl(track.artistUrl ?? "");
  return (
    <div
      className={`now-playing ${className}`}
      data-visible={visible}
      data-playing={track.isNowPlaying}
      aria-live="polite"
    >
      <div className="now-playing-copy">
        <a
          className="now-playing-status"
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
        >
          {track.isNowPlaying ? "listening to" : "last played"}
        </a>
        <a
          className="now-playing-song"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {track.track}
        </a>
        <a
          className="now-playing-artist"
          href={artistHref}
          target="_blank"
          rel="noreferrer"
        >
          {track.artist}
        </a>
        <span
          className="now-playing-palette"
          role="img"
          aria-label="Colors from album artwork"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              style={{
                backgroundColor: `var(--album-color-${i + 1}, var(--album-accent))`,
              }}
            />
          ))}
        </span>
      </div>
      {art && <AlbumPreview key={art} art={art} />}
    </div>
  );
}
