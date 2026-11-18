"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Ascii, { type LandingView } from "@/components/Ascii";
import { MainClock } from "@/components/MainClock";
import NowPlaying from "@/components/NowPlaying";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { landingProjectsFromReadme } from "@/data/readme-projects.generated";
import { githubLanguageLabel } from "@/lib/github-repo-languages";

const projects = [
  ...new Map(
    landingProjectsFromReadme.map((project) => [project.key, project]),
  ).values(),
];
const entries: Array<(typeof projects)[number] | "back"> = [
  ...projects,
  "back",
];
entries.sort((a, b) =>
  (typeof a === "string" ? a : a.name).localeCompare(
    typeof b === "string" ? b : b.name,
    "en",
    { sensitivity: "base" },
  ),
);

export default function Home() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const [preview, setPreview] = useState<string | null>(null);
  const [previewInteractive, setPreviewInteractive] = useState(false);
  const [colors, setColors] = useState<string[] | undefined>();
  const [view, setView] = useState<LandingView>("home");
  const [requestedView, setRequestedView] = useState<LandingView>("home");
  const pageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const [previewAnchor, setPreviewAnchor] = useState({ x: 0, y: 0 });
  const focusAfterView = useRef(false);
  const previewTrigger = useRef<HTMLButtonElement | null>(null);
  const navigationPending = useRef(false);

  const changeView = (next: LandingView) => {
    navigationPending.current = true;
    setPreview(null);
    previewTrigger.current = null;
    setRequestedView(next);
  };

  useLayoutEffect(() => {
    const card = previewRef.current;
    if (!card) return;
    const position = () => {
      const { width, height } = card.getBoundingClientRect();
      const x = previewAnchor.x + 16;
      const y = previewAnchor.y + 16;
      card.style.left = `${Math.max(12, Math.min(innerWidth - width - 12, x + width > innerWidth - 12 ? previewAnchor.x - width - 16 : x))}px`;
      card.style.top = `${Math.max(12, Math.min(innerHeight - height - 12, y + height > innerHeight - 12 ? previewAnchor.y - height - 16 : y))}px`;
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(card);
    window.addEventListener("resize", position);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
    };
  }, [preview, previewAnchor]);

  useEffect(() => {
    if (!focusAfterView.current) return;
    focusAfterView.current = false;
    navigationPending.current = false;
    pageRef.current
      ?.querySelector<HTMLButtonElement>(
        view === "projects" ? "[data-back]" : "[data-more]",
      )
      ?.focus({ preventScroll: true });
  }, [view]);

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
      if (event.key === "Escape") {
        setPreview(null);
        if (document.activeElement?.closest(".landing-preview"))
          previewTrigger.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    const dismissOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !previewRef.current?.contains(event.target) &&
        !previewTrigger.current?.contains(event.target)
      )
        setPreview(null);
    };
    const dismissOnScroll = () => {
      const trigger = previewTrigger.current;
      if (trigger?.matches(":focus-visible")) {
        const bounds = trigger.getBoundingClientRect();
        setPreviewAnchor({ x: bounds.left, y: bounds.bottom });
      } else if (!document.activeElement?.closest("#project-preview"))
        setPreview(null);
    };
    window.addEventListener("pointerdown", dismissOutside, true);
    window.addEventListener("scroll", dismissOnScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", dismissOutside, true);
      window.removeEventListener("scroll", dismissOnScroll);
    };
  }, []);

  const project = projects.find((item) => item.key === preview);
  const projectButton = (
    item: (typeof projects)[number],
    label = item.name,
  ) => (
    <button
      type="button"
      className="landing-project"
      data-project-key={item.key}
      aria-expanded={preview === item.key}
      aria-controls="project-preview"
      onPointerMove={(event) => {
        // Scrolling a label under a stationary pointer must not replace a keyboard preview.
        if (event.pointerType !== "mouse" || navigationPending.current) return;
        previewTrigger.current = event.currentTarget;
        if (preview !== item.key) setPreviewInteractive(false);
        setPreviewAnchor({ x: event.clientX, y: event.clientY });
        setPreview(item.key);
      }}
      onPointerLeave={() => {
        if (!previewInteractive) setPreview(null);
      }}
      onFocus={(event) => {
        if (navigationPending.current) return;
        if (
          event.relatedTarget instanceof Element &&
          event.relatedTarget.closest(".landing-preview")
        )
          return;
        previewTrigger.current = event.currentTarget;
        const bounds = event.currentTarget.getBoundingClientRect();
        setPreviewInteractive(true);
        setPreviewAnchor({ x: bounds.left, y: bounds.bottom });
        setPreview(item.key);
      }}
      onClick={(event) => {
        if (navigationPending.current) return;
        previewTrigger.current = event.currentTarget;
        setPreviewInteractive(true);
        if (event.detail > 0)
          setPreviewAnchor({ x: event.clientX, y: event.clientY });
        setPreview(item.key);
      }}
    >
      [{label}]
    </button>
  );

  return (
    <div
      ref={pageRef}
      className="landing"
      data-view={view}
      aria-busy={view !== requestedView}
      onBlurCapture={(event) => {
        const target = event.relatedTarget;
        if (
          !(target instanceof Node) ||
          (!previewRef.current?.contains(target) &&
            !previewTrigger.current?.contains(target))
        )
          setPreview(null);
      }}
    >
      <div className="landing-field" aria-hidden="true">
        <Ascii
          colors={colors}
          ready
          view={requestedView}
          onViewChange={(next) => {
            setPreview(null);
            previewTrigger.current = null;
            focusAfterView.current = true;
            setView(next);
            window.scrollTo(0, 0);
          }}
        />
      </div>
      <header className="landing-status">
        <MainClock dayTheme={dayTheme} now={now} nowArticleOpen={false} />
        <div className="landing-music">
          <NowPlaying />
        </div>
      </header>
      <main className="landing-content">
        {view === "projects" ? (
          <p className="landing-all-projects" aria-label="All projects">
            {entries.map((entry, index) => (
              <span key={typeof entry === "string" ? entry : entry.key}>
                {index > 0 ? " " : ""}
                <span className="landing-project-label">
                  {typeof entry === "string" ? (
                    <button
                      type="button"
                      className="landing-project"
                      data-back
                      onPointerEnter={() => setPreview(null)}
                      onFocus={() => setPreview(null)}
                      onClick={() => changeView("home")}
                    >
                      [back]
                    </button>
                  ) : (
                    projectButton(entry)
                  )}
                  {index < entries.length - 1 ? "," : "."}
                </span>
              </span>
            ))}
          </p>
        ) : (
          <>
            <p>hi, i’m max carter. i make things for people.</p>
            <p>
              i’m a self-taught software engineer and i’ve been building things
              since i was nine. lately that includes{" "}
              {[
                "Inauguration",
                "Space",
                "Alpenglow",
                "Crepuscularity",
                "Moonshine",
              ].map((name, index) => (
                <span key={name}>
                  {index === 0 ? "" : " "}
                  <span className="landing-project-label">
                    {projects
                      .filter((item) => item.key === name.toLowerCase())
                      .map((item) => (
                        <span key={item.key}>{projectButton(item, name)}</span>
                      ))}
                    ,
                  </span>
                </span>
              ))}{" "}
              and{" "}
              <span className="landing-project-label">
                <button
                  type="button"
                  className="landing-project"
                  data-more
                  onPointerEnter={() => setPreview(null)}
                  onFocus={() => setPreview(null)}
                  onClick={() => changeView("projects")}
                >
                  [more]
                </button>
                .
              </span>{" "}
              i like understanding how the whole thing works, then making it
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
          </>
        )}
      </main>
      {project && (
        <aside
          ref={previewRef}
          className="landing-preview"
          data-interactive={previewInteractive}
          id="project-preview"
          aria-label={`${project.name} preview`}
        >
          <button
            type="button"
            className="landing-preview-close"
            onClick={() => {
              setPreview(null);
              previewTrigger.current?.focus();
            }}
            aria-label="Close preview"
          >
            ×
          </button>
          <div className="landing-preview-languages">
            {project.github ? (
              <a
                href={`https://github.com/${project.github.repository}#languages`}
                title="GitHub Linguist language shares"
              >
                {githubLanguageLabel(project.github)}
              </a>
            ) : (
              githubLanguageLabel(null)
            )}
          </div>
          <strong>{project.name}</strong>
          <p>{project.desc}</p>
          {project.href !== "#" && <a href={project.href}>view project ↗</a>}
        </aside>
      )}
    </div>
  );
}
