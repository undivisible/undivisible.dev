"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Ascii, { type LandingView } from "@/components/Ascii";
import { MainClock } from "@/components/MainClock";
import { Light } from "@/components/Light";
import NowPlaying from "@/components/NowPlaying";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { useSiteVisualEffects } from "@/hooks/use-site-visual-effects";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { skyTextColor } from "@/lib/album-theme";
import { landingProjectsFromReadme } from "@/data/readme-projects.generated";
import { GithubLanguageBar } from "@/components/GithubLanguageBar";
import { prepareGithubLanguages } from "@/lib/github-repo-languages";

function distanceToPreview(point: { x: number; y: number }, bounds: DOMRect) {
  return Math.hypot(
    point.x - (bounds.left + bounds.right) / 2,
    point.y - (bounds.top + bounds.bottom) / 2,
  );
}

function inPreviewCorridor(
  x: number,
  y: number,
  origin: { x: number; y: number },
  bounds: DOMRect,
) {
  const buffer = 16;
  if (
    x < Math.min(origin.x, bounds.left) - buffer ||
    x > Math.max(origin.x, bounds.right) + buffer ||
    y < Math.min(origin.y, bounds.top) - buffer ||
    y > Math.max(origin.y, bounds.bottom) + buffer
  )
    return false;
  const corners: Array<[number, number]> = [
    [bounds.left - 6, bounds.top - 6],
    [bounds.right + 6, bounds.top - 6],
    [bounds.right + 6, bounds.bottom + 6],
    [bounds.left - 6, bounds.bottom + 6],
  ];
  return corners.some(([ax, ay], index) => {
    const [bx, by] = corners[(index + 1) % corners.length]!;
    const area =
      (ax - origin.x) * (by - origin.y) - (ay - origin.y) * (bx - origin.x);
    if (Math.abs(area) < 0.001) return false;
    const u =
      ((x - origin.x) * (by - origin.y) - (y - origin.y) * (bx - origin.x)) /
      area;
    const v =
      ((ax - origin.x) * (y - origin.y) - (ay - origin.y) * (x - origin.x)) /
      area;
    return (
      u >=
        (-buffer * Math.hypot(bx - origin.x, by - origin.y)) / Math.abs(area) &&
      v >=
        (-buffer * Math.hypot(ax - origin.x, ay - origin.y)) / Math.abs(area) &&
      u + v <= 1 + (buffer * Math.hypot(bx - ax, by - ay)) / Math.abs(area)
    );
  });
}

const projects = [
  ...new Map(
    landingProjectsFromReadme.map((project) => [project.key, project]),
  ).values(),
].map((project) => ({
  ...project,
  githubLanguages: prepareGithubLanguages(project.github),
}));
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
  const visualEffects = useSiteVisualEffects();
  const [solarPreview, setSolarPreview] = useState(false);
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
  const hoverOrigin = useRef<{ x: number; y: number } | null>(null);
  const hoverPoint = useRef({ x: 0, y: 0 });
  const hoverTarget = useRef<HTMLButtonElement | null>(null);
  const hoverApproachDistance = useRef(Infinity);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const dismissPreview = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = undefined;
    hoverOrigin.current = null;
    setPreview(null);
  };

  const changeView = (next: LandingView) => {
    navigationPending.current = true;
    setSolarPreview(false);
    dayTheme.resetScrub();
    dismissPreview();
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
        dismissPreview();
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
        dismissPreview();
    };
    const dismissOnScroll = () => {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = undefined;
      const trigger = previewTrigger.current;
      if (trigger?.matches(":focus-visible")) {
        const bounds = trigger.getBoundingClientRect();
        setPreviewAnchor({ x: bounds.left, y: bounds.bottom });
      } else if (!document.activeElement?.closest("#project-preview"))
        dismissPreview();
    };
    window.addEventListener("pointerdown", dismissOutside, true);
    window.addEventListener("scroll", dismissOnScroll, { passive: true });
    return () => {
      clearTimeout(hoverTimer.current);
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", dismissOutside, true);
      window.removeEventListener("scroll", dismissOnScroll);
    };
  }, []);

  useEffect(() => {
    if (!preview || previewInteractive) {
      hoverOrigin.current = null;
      return;
    }
    const followPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (
        event.target instanceof Node &&
        (previewRef.current?.contains(event.target) ||
          previewTrigger.current?.contains(event.target))
      )
        return;
      const bounds = previewRef.current?.getBoundingClientRect();
      if (
        bounds &&
        hoverOrigin.current &&
        inPreviewCorridor(
          event.clientX,
          event.clientY,
          hoverOrigin.current,
          bounds,
        )
      )
        return;
      dismissPreview();
    };
    const leaveWindow = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && !event.relatedTarget)
        dismissPreview();
    };
    window.addEventListener("pointermove", followPointer);
    window.addEventListener("pointerout", leaveWindow);
    return () => {
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("pointerout", leaveWindow);
    };
  }, [preview, previewInteractive]);

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
        const bounds = previewRef.current?.getBoundingClientRect();
        const approaching = Boolean(
          previewTrigger.current !== event.currentTarget &&
          hoverOrigin.current &&
          bounds &&
          inPreviewCorridor(
            event.clientX,
            event.clientY,
            hoverOrigin.current,
            bounds,
          ),
        );
        if (!approaching) hoverOrigin.current = null;
        const point = { x: event.clientX, y: event.clientY };
        const distance = bounds ? distanceToPreview(point, bounds) : Infinity;
        const movingTowardPreview =
          approaching && distance < hoverApproachDistance.current - 0.5;
        hoverPoint.current = point;
        if (
          preview === item.key &&
          previewTrigger.current === event.currentTarget
        ) {
          setPreviewAnchor(hoverPoint.current);
          return;
        }
        if (
          hoverTimer.current &&
          ((previewTrigger.current === event.currentTarget && !approaching) ||
            (hoverTarget.current === event.currentTarget &&
              approaching &&
              !movingTowardPreview))
        )
          return;
        clearTimeout(hoverTimer.current);
        const trigger = event.currentTarget;
        hoverTarget.current = trigger;
        hoverApproachDistance.current = distance;
        if (!approaching) {
          previewTrigger.current = trigger;
          setPreview(null);
        }
        hoverTimer.current = setTimeout(
          () => {
            hoverTimer.current = undefined;
            if (navigationPending.current || !trigger.matches(":hover")) return;
            hoverOrigin.current = null;
            previewTrigger.current = trigger;
            setPreviewInteractive(false);
            setPreviewAnchor(hoverPoint.current);
            setPreview(item.key);
          },
          approaching ? 250 : 100,
        );
      }}
      onPointerLeave={(event) => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = undefined;
        if (
          event.pointerType === "mouse" &&
          !previewInteractive &&
          previewTrigger.current === event.currentTarget
        )
          hoverOrigin.current = hoverPoint.current;
      }}
      onFocus={(event) => {
        if (navigationPending.current) return;
        clearTimeout(hoverTimer.current);
        hoverTimer.current = undefined;
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
        clearTimeout(hoverTimer.current);
        hoverTimer.current = undefined;
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
      data-solar-tone={
        solarPreview && skyTextColor([dayTheme.shader.base]) === "#000000"
          ? "light"
          : undefined
      }
      aria-busy={view !== requestedView}
      onBlurCapture={(event) => {
        const target = event.relatedTarget;
        if (
          !(target instanceof Node) ||
          (!previewRef.current?.contains(target) &&
            !previewTrigger.current?.contains(target))
        )
          dismissPreview();
      }}
    >
      {solarPreview && (
        <div
          className="landing-solar"
          aria-hidden="true"
          style={{ background: dayTheme.shader.base }}
        >
          <Light scene={dayTheme.shader} animated={visualEffects} />
        </div>
      )}
      <div className="landing-field" aria-hidden="true">
        <Ascii
          colors={colors}
          ready
          view={requestedView}
          onViewChange={(next) => {
            setSolarPreview(false);
            dayTheme.resetScrub();
            dismissPreview();
            previewTrigger.current = null;
            focusAfterView.current = true;
            setView(next);
            window.scrollTo(0, 0);
          }}
        />
      </div>
      <header className="landing-status">
        <MainClock
          dayTheme={dayTheme}
          now={now}
          nowArticleOpen={false}
          onTimeHoverChange={setSolarPreview}
        />
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
                      onPointerEnter={dismissPreview}
                      onFocus={dismissPreview}
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
                  onPointerEnter={dismissPreview}
                  onFocus={dismissPreview}
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
              dismissPreview();
              previewTrigger.current?.focus();
            }}
            aria-label="Close preview"
          >
            ×
          </button>
          <div className="landing-preview-languages">
            <GithubLanguageBar languages={project.githubLanguages} />
          </div>
          <strong>{project.name}</strong>
          <p>{project.desc}</p>
          {project.href !== "#" && <a href={project.href}>view project ↗</a>}
        </aside>
      )}
    </div>
  );
}
