"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SiteNav } from "@/components/SiteNav";
import { profile, projects } from "@/data/profile";
import { useRemoteReadme } from "@/hooks/use-remote-content";
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

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      window.dispatchEvent(new Event("site:mode-ready")),
    );
    return () => cancelAnimationFrame(id);
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
      <div className="main-bento screen-only">
        <a className="profile-skip" href="#main-content">
          Skip to content
        </a>
        <header className="bento-masthead">
          <a href="/main/" aria-label="undivisible home">
            undivisible<span>.</span>
          </a>
          <span className="bento-edition">
            personal index / software & systems
          </span>
          <SiteNav onPrintResume={runPrint} />
        </header>
        <main id="main-content" className="bento-grid" tabIndex={-1}>
          <section
            className="bento-pane bento-identity"
            aria-labelledby="bento-name"
          >
            <div className="bento-label">
              <span>01 / about</span>
              <span lang="zh">{profile.hanzi}</span>
            </div>
            <h1 id="bento-name">
              Max
              <br />
              Carter<span>.</span>
            </h1>
            <p>{profile.description}</p>
            <div className="bento-identity-footer">
              <span>independent software development</span>
              <span aria-hidden="true">↗</span>
            </div>
          </section>
          <section
            className="bento-pane bento-studio"
            aria-labelledby="studio-heading"
          >
            <div className="bento-label">
              <span>02 / studio</span>
              <span aria-hidden="true">＋</span>
            </div>
            <h2 id="studio-heading">
              the software
              <br />
              company of
              <br />
              <span>hong kong</span>
            </h2>
            <a href="https://tsc.hk">
              explore tsc.hk <span aria-hidden="true">↗</span>
            </a>
          </section>
          <section
            className="bento-pane bento-work"
            aria-labelledby="work-heading"
          >
            <div className="bento-label">
              <span>03 / work</span>
            </div>
            <h2 id="work-heading">Building with</h2>
            <p className="bento-role">
              Chert <span>software engineer</span>
            </p>
            <p className="bento-role">
              Twenify <span>cto</span>
            </p>
            <button type="button" onClick={runPrint}>
              experience & résumé <span aria-hidden="true">↓</span>
            </button>
          </section>
          {selectedProjects.map((project, index) => (
            <a
              className={`bento-pane bento-project bento-project-${index}`}
              href={project.href}
              key={project.name}
            >
              <div className="bento-label">
                <span>
                  0{index + 4} / {project.kind}
                </span>
                <span aria-hidden="true">↗</span>
              </div>
              <div className="bento-project-mark" aria-hidden="true">
                {["{ ; }", "⏣", " /\\ ", "◐"][index]}
              </div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
            </a>
          ))}
          <section
            className="bento-pane bento-contact"
            aria-labelledby="contact-heading"
          >
            <div className="bento-label">
              <span>08 / elsewhere</span>
            </div>
            <h2 id="contact-heading">
              Say hello<span>↗</span>
            </h2>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <div>
              <a href={profile.github}>GitHub ↗</a>
              <a href="https://x.com/makethings4ppl">X ↗</a>
              <a href="/simple/">text version ↗</a>
            </div>
          </section>
        </main>
        <footer className="bento-colophon">
          <span>max carter / 祁明思</span>
          <a href={`${profile.github}?tab=repositories`}>all repositories ↗</a>
          <span>undivisible.dev</span>
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
