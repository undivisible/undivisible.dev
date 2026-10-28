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
  ["Inauguration", "Crepuscularity", "Alpenglow"].includes(project.name),
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
      <noscript>
        <style>{`
          .personal-font-loader { display: none !important; }
          .personal-page { visibility: visible !important; }
        `}</style>
      </noscript>
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
          <div className="personal-header-identity">
            <a
              href="/"
              className="personal-wordmark"
              aria-label="undivisible home"
            >
              undivisible<span aria-hidden="true">↗</span>
            </a>
            <MainClock
              dayTheme={dayTheme}
              now={now}
              nowArticleOpen={nowArticleOpen}
              onToggleNowArticle={toggleNowArticle}
            />
          </div>
          <div className="personal-header-tools">
            <SiteNav onPrintResume={runPrint} />
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
                  <span>systems</span>
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
                <div className="personal-bio">
                  <p className="personal-intro">i make things for people.</p>
                  <p>
                    I build compilers, operating systems and useful software.
                  </p>
                  <p className="personal-intro">
                    <a href="#contact">Reach out! ↘</a>
                  </p>
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
              </section>
              <section
                className="bento-cell bento-life"
                id="contact"
                aria-labelledby="contact-heading"
              >
                <p className="bento-caption">[ contact / social ]</p>
                <h2 id="contact-heading">say hello.</h2>
                <div
                  className="personal-links"
                  aria-label="Contact and social links"
                >
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
                </div>
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
                  <span aria-hidden="true">[ 01 — 03 ]</span>
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
                        <h3>
                          {project.name.length <= 12 ? (
                            <>
                              <span
                                className="project-name-mark"
                                aria-hidden="true"
                              >
                                &gt;
                              </span>{" "}
                            </>
                          ) : null}
                          {project.name}
                        </h3>
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
