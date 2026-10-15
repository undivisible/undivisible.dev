"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MainClock } from "@/components/MainClock";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { formatNowMarkdown } from "@/lib/format-now-markdown";
import NowPlaying from "@/components/NowPlaying";
import { AlbumBackground } from "@/components/AlbumBackground";
import { SiteNav } from "@/components/SiteNav";
import { profile, projects } from "@/data/profile";
import { useSiteVisualEffects } from "@/hooks/use-site-visual-effects";
import { useNowMarkdown, useRemoteReadme } from "@/hooks/use-remote-content";
import { clearSitePrintTarget, printSitePdf } from "@/lib/site-print";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { fetchResumeMarkdownCached } from "@/lib/remote-markdown";

const HomePrintRoot = dynamic(
  () =>
    import("@/components/home/print/HomePrintRoot").then(
      (m) => m.HomePrintRoot,
    ),
  { ssr: false },
);
const selectedProjects = projects.filter((project) =>
  ["Inauguration", "Crepuscularity", "Alpenglow", "Moonshine"].includes(
    project.name,
  ),
);

export default function Home({ readme }: { readme: ReadmeBundle }) {
  const { readme: activeReadme, refreshReadme } = useRemoteReadme(readme);
  const [printMounted, setPrintMounted] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const dayTheme = useHongKongDayTheme();
  const visualEffects = useSiteVisualEffects();
  const now = useNowMarkdown();
  const [nowArticleOpen, setNowArticleOpen] = useState(false);
  const toggleNowArticle = useCallback(() => {
    if (now.article) setNowArticleOpen((open) => !open);
  }, [now.article]);

  useEffect(() => {
    if (!now.article) setNowArticleOpen(false);
  }, [now.article]);

  useEffect(() => {
    if (!nowArticleOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNowArticleOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nowArticleOpen]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      document.fonts.load('400 14px "JetBrains Mono"', "Alpenglow"),
      document.fonts.load("700 160px Barlow", "MAX CARTER"),
      document.fonts.load("400 14px Barlow"),
    ])
      .then(() => {
        if (cancelled) return;
        setFontsReady(true);
        window.dispatchEvent(new Event("site:mode-ready"));
      })
      .catch(() => window.dispatchEvent(new Event("site:mode-failed")));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void import("@/components/home/print/HomePrintRoot");
    setPrintMounted(true);
    const onAfterPrint = () => clearSitePrintTarget();
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const runPrint = useCallback(async () => {
    await Promise.all([
      fetchResumeMarkdownCached({ forceRefresh: true }),
      refreshReadme({ forceRefresh: true }),
    ]);
    if (!printMounted) setPrintMounted(true);
    await printSitePdf("resume");
  }, [printMounted, refreshReadme]);

  return (
    <>
      <div
        className="personal-font-loader screen-only"
        role="status"
        aria-label="Loading type and character field"
      >
        <i />
        <i />
        <i />
        <i />
      </div>
      <div
        className={`personal-page screen-only${fontsReady ? " site-fonts-ready" : ""}${visualEffects ? " character-field-enabled" : ""}`}
      >
        <AlbumBackground
          dayTheme={dayTheme}
          fontsReady={fontsReady}
          visualEffects={visualEffects}
        />
        <a className="profile-skip" href="#main-content">
          Skip to content
        </a>
        <header className="personal-masthead">
          <a
            href="/"
            className="personal-wordmark"
            aria-label="undivisible — open OS"
          >
            undivisible<span aria-hidden="true">↗</span>
          </a>
          <div className="personal-header-tools">
            <SiteNav onPrintResume={runPrint} />
            <MainClock
              dayTheme={dayTheme}
              now={now}
              nowArticleOpen={nowArticleOpen}
              onToggleNowArticle={toggleNowArticle}
            />
          </div>
        </header>
        <main
          id="main-content"
          className={`personal-main ${nowArticleOpen && now.article ? "personal-now" : "personal-bento"}`}
          tabIndex={-1}
        >
          {nowArticleOpen && now.article ? (
            <article
              className="personal-now-article"
              aria-labelledby="now-heading"
            >
              <div className="personal-section-title">
                <h2 id="now-heading">now</h2>
                <button type="button" onClick={() => setNowArticleOpen(false)}>
                  back to the page
                </button>
              </div>
              {formatNowMarkdown(now.article)}
            </article>
          ) : (
            <>
              <section
                className="personal-hero bento-cell"
                aria-labelledby="personal-name"
              >
                <p className="personal-kicker">
                  <span lang="zh">{profile.hanzi}</span>
                  <span>software / systems / people</span>
                </p>
                <h1 id="personal-name" aria-label="Max Carter">
                  <span className="name-reveal">
                    <span>
                      max carter<span className="name-dot">.</span>
                    </span>
                  </span>
                </h1>
                <div className="personal-listening">
                  <NowPlaying />
                </div>
                <p className="personal-intro">i make things for people.</p>
                <div className="personal-bio">
                  <p>
                    I’m a self-taught software engineer. I build compilers,
                    operating systems, apps and the tools that connect them. I
                    like understanding how the whole thing works, then making it
                    easier to use.
                  </p>
                  <p>
                    I started building software at eight and left school at
                    seventeen to do it full time. My independent projects live
                    at{" "}
                    <a href="https://tsc.hk">
                      the software company of hong kong ↗
                    </a>
                    .
                  </p>
                </div>
                <div className="personal-links">
                  <a href={`mailto:${profile.email}`}>
                    <span>email ↗</span>
                  </a>
                  <a href={profile.github}>
                    <span>github ↗</span>
                  </a>
                  <a href="https://x.com/makethings4ppl">
                    <span>x ↗</span>
                  </a>
                  <a href="https://www.instagram.com/undivisible.dev/">
                    <span>instagram ↗</span>
                  </a>
                  <button type="button" onClick={runPrint}>
                    résumé ↓
                  </button>
                </div>
              </section>
              <section
                className="bento-cell bento-current"
                aria-labelledby="current-heading"
              >
                <p className="bento-caption">[ work / current ]</p>
                <h2 id="current-heading">building with</h2>
                <div className="bento-job">
                  <strong>Chert</strong>
                  <span>software engineer</span>
                </div>
                <div className="bento-job">
                  <strong>Twenify</strong>
                  <span>cto</span>
                </div>
                <p className="bento-previous">previously at Omi</p>
              </section>
              <section
                className="bento-cell bento-life"
                aria-labelledby="life-heading"
              >
                <p className="bento-caption">[ away from the keyboard ]</p>
                <h2 id="life-heading">a few other things.</h2>
                <ul>
                  <li>philosophy</li>
                  <li>cooking & photography</li>
                  <li>languages & lifting</li>
                </ul>
                <span className="bento-life-mark" aria-hidden="true">
                  ( 祁 )
                </span>
              </section>
              <section
                className="personal-work"
                aria-labelledby="personal-work-heading"
              >
                <div className="personal-section-title">
                  <h2 id="personal-work-heading">[ projects ]</h2>
                  <span aria-hidden="true">[ 01 — 04 ]</span>
                </div>
                <div className="personal-projects">
                  {selectedProjects.map((project, index) => (
                    <a
                      className={`personal-project project-${index}`}
                      href={project.href}
                      key={project.name}
                    >
                      <span className="project-index">0{index + 1}</span>
                      <div>
                        <span className="project-kind">{project.kind}</span>
                        <h3>{project.name}</h3>
                        <p>{project.description}</p>
                      </div>
                      <span className="project-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
        <footer className="personal-footer">
          <span>max carter / {profile.hanzi}</span>
          <a href={`${profile.github}?tab=repositories`}>
            more things on github ↗
          </a>
          <a href="/simple/">simple version ↗</a>
        </footer>
      </div>
      {printMounted ? (
        <div className="print-only print-layer-resume" aria-hidden>
          <HomePrintRoot readme={activeReadme} />
        </div>
      ) : null}
    </>
  );
}
