"use client";

import { useMemo } from "react";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { MergedPrList } from "@/components/lab/MergedPrList";
import { Milestones } from "@/components/lab/Milestones";
import { Odometer } from "@/components/lab/Odometer";
import { OmiCard } from "@/components/lab/OmiCard";
import { GITHUB_ACTIVITY } from "@/data/github-activity";
import {
  COUNTRIES,
  COUNTRIES_IN_A_YEAR,
  HEADLINE_WORKS,
  IDENTITY,
  LAB_LINKS,
  STOPS_THIS_YEAR,
  TSCHK,
} from "@/data/lab-facts";
import {
  librariesFromReadme,
  mainProjectsFromReadme,
  miniappsFromReadme,
  utilitiesFromReadme,
} from "@/data/readme-projects.generated";
import type { LiveGithub } from "@/hooks/use-live-github";
import { organiseProjects } from "@/lib/organise-projects";

const numberFormat = new Intl.NumberFormat("en-US");

/** The hero, at window scale. Same words, same hovers. */
export function AboutPanel({
  github,
  onResume,
}: {
  github: LiveGithub;
  onResume: () => void;
}) {
  return (
    <div className="osp osp-about">
      <h1 className="osp-name">
        {IDENTITY.name} <span className="osp-hanzi">{IDENTITY.hanzi}</span>
      </h1>
      <p className="osp-tagline">
        <GhostTagline suffixClassName="min-suffix" />
      </p>
      <p className="osp-role">
        {IDENTITY.role} at {IDENTITY.org}.{" "}
        <OmiCard github={github}>{IDENTITY.product}</OmiCard>.
      </p>
      <nav className="osp-links">
        {LAB_LINKS.map((link) =>
          link.name === "resume" ? (
            <button key={link.name} type="button" onClick={onResume}>
              resume
            </button>
          ) : (
            <a
              key={link.name}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {link.name}
            </a>
          ),
        )}
      </nav>
    </div>
  );
}

export function ActivityPanel({ github }: { github: LiveGithub }) {
  const figures = [
    { value: numberFormat.format(github.prsThisYear), label: "pull requests" },
    { value: numberFormat.format(github.merged), label: "merged" },
    { value: numberFormat.format(github.commitsThisYear), label: "commits" },
    { value: String(github.repos), label: "repos" },
  ];
  return (
    <div className="osp">
      <div className="osp-figures">
        {figures.map((figure) => (
          <div key={figure.label} className="osp-figure">
            <b>
              <Odometer value={figure.value} />
            </b>
            <i>{figure.label}</i>
          </div>
        ))}
      </div>
      <MergedPrList items={github.recent.slice(0, 4)} />
      <p className="osp-note">
        {github.omiThisMonth} pull requests on{" "}
        <a href={GITHUB_ACTIVITY.allPrsUrl} target="_blank" rel="noopener noreferrer">
          {GITHUB_ACTIVITY.repo}
        </a>{" "}
        this month. {numberFormat.format(github.closedUnmerged)} closed without
        merging — nearly all by me. not rejections.
      </p>
    </div>
  );
}

export function WorksPanel() {
  const categories = useMemo(
    () =>
      organiseProjects([
        ...mainProjectsFromReadme,
        ...utilitiesFromReadme,
        ...miniappsFromReadme,
        ...librariesFromReadme,
      ]),
    [],
  );
  return (
    <div className="osp">
      <ol className="osp-works">
        {HEADLINE_WORKS.map((work) => (
          <li key={work.name}>
            <a href={work.href} target="_blank" rel="noopener noreferrer">
              <b>{work.name}</b>
              <i>{work.what}</i>
              <span>{work.line}</span>
            </a>
          </li>
        ))}
      </ol>
      <p className="osp-note">
        all of it under{" "}
        <a href={TSCHK.href} target="_blank" rel="noopener noreferrer">
          {TSCHK.name}
        </a>
        , {TSCHK.full}.
      </p>
      <dl className="osp-index">
        {categories.map((category) => (
          <div key={category.key}>
            <dt>{category.label}</dt>
            <dd>
              {category.items.map((project, index) => (
                <span key={project.name}>
                  {index > 0 ? " · " : null}
                  {project.href && project.href !== "#" ? (
                    <a href={project.href} target="_blank" rel="noopener noreferrer">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function RoutePanel() {
  return (
    <div className="osp">
      <p className="osp-route">
        {STOPS_THIS_YEAR.map((stop, index) => (
          <span key={`${stop.code}-${index}`}>
            {index > 0 ? <i> → </i> : null}
            <span
              className="osp-route-code"
              data-next={stop.next || undefined}
              title={stop.note ? `${stop.city} — ${stop.note}` : stop.city}
            >
              {stop.code}
            </span>
          </span>
        ))}
      </p>
      <p className="osp-note">
        {COUNTRIES_IN_A_YEAR} countries inside one year, at seventeen —{" "}
        <span title={COUNTRIES.join(" · ")}>{COUNTRIES.length} so far</span>.
        the last two are booked.
      </p>
    </div>
  );
}

export function Before17Panel() {
  return (
    <div className="osp">
      <Milestones />
    </div>
  );
}
