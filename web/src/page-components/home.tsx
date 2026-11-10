"use client";

import { useEffect, useState } from "react";
import Ascii from "@/components/Ascii";
import { MainClock } from "@/components/MainClock";
import NowPlaying from "@/components/NowPlaying";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { projects } from "@/data/profile";

export default function Home() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const [preview, setPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<string[] | undefined>();

  useEffect(() => {
    window.dispatchEvent(new Event("site:mode-ready"));
  }, []);

  useEffect(() => {
    const readPalette = () => {
      const next = document.documentElement.dataset.albumColors?.split(" ");
      if (
        next?.length === 5 &&
        next.every((color) => /^#[0-9a-f]{6}$/i.test(color))
      ) {
        setColors(next);
      }
    };
    readPalette();
    window.addEventListener("site:album-palette", readPalette);
    return () => window.removeEventListener("site:album-palette", readPalette);
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const project = projects.find((item) => item.name === preview);

  return (
    <div className="landing">
      <div className="landing-field" aria-hidden="true">
        <Ascii colors={colors} ready />
      </div>
      <header className="landing-status">
        <MainClock dayTheme={dayTheme} now={now} nowArticleOpen={false} />
        <div className="landing-music">
          <NowPlaying />
        </div>
      </header>
      <main className="landing-content">
        <p>hi, i’m max carter. i make things for people.</p>
        <p>
          i’m a self-taught software engineer and i’ve been building things
          since i was nine. lately that includes{" "}
          {["Inauguration", "Space", "Alpenglow", "Crepuscularity", "Moonshine"].map((name, index) => (
            <span key={name}>
              {index === 0 ? "" : index === 4 ? ", and " : ", "}
              <button
                type="button"
                className="landing-project"
                aria-expanded={preview === name}
                aria-controls="project-preview"
                onMouseEnter={() => setPreview(name)}
                onFocus={() => setPreview(name)}
                onClick={() => setPreview(name)}
              >
                [{name}]
              </button>
            </span>
          ))}
          . i like understanding how the whole thing works, then making it
          easier to use.
        </p>
        <nav aria-label="Links">
          <a href="https://next.undivisible.dev/">[ enter the OS ↗ ]</a>{" "}
          <a href="mailto:max@tsc.hk">[ email ↗ ]</a>{" "}
          <a href="https://github.com/undivisible">[ github ↗ ]</a>{" "}
          <a href="https://x.com/makethings4ppl">[ x ↗ ]</a>{" "}
          <a href="https://www.instagram.com/ihatemaxcarter/">
            [ instagram ↗ ]
          </a>
        </nav>
      </main>
      {project && (
        <aside
          className="landing-preview"
          id="project-preview"
          aria-label={`${project.name} preview`}
        >
          <button
            type="button"
            className="landing-preview-close"
            onClick={() => setPreview(null)}
            aria-label="Close preview"
          >
            ×
          </button>
          <strong>{project.name}</strong>
          <p>{project.description}</p>
          <a href={project.href}>view project ↗</a>
        </aside>
      )}
    </div>
  );
}
