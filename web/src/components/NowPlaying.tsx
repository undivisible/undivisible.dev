"use client";

import { useEffect, useState } from "react";
import type { LastFmTrackNormalized } from "../lib/lastfmClient";

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
  return (
    <div
      className={`now-playing ${className}`}
      data-visible={visible}
      data-playing={track.isNowPlaying}
      aria-live="polite"
    >
      {art && (
        <img
          className="now-playing-art"
          src={art}
          alt=""
          width={48}
          height={48}
          loading="lazy"
        />
      )}
      <div className="now-playing-copy">
        <span className="now-playing-status">
          {track.isNowPlaying ? "listening to" : "last played"}
        </span>
        <a
          className="now-playing-song"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {track.track}
        </a>
        <span className="now-playing-artist">{track.artist}</span>
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
    </div>
  );
}
