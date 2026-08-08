"use client";

import { useMemo, useState } from "react";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { LabSwitch } from "@/components/lab/LabSwitch";
import type { LabLayoutProps } from "@/components/lab/lab-layout";
import { LAB_REFS } from "@/data/lab-refs";
import {
  librariesFromReadme,
  mainProjectsFromReadme,
  miniappsFromReadme,
  utilitiesFromReadme,
} from "@/data/readme-projects.generated";
import { organiseProjects } from "@/lib/organise-projects";
import {
  COUNTRIES_IN_A_YEAR,
  IDENTITY,
  LAB_LINKS,
  OMI,
  PLACES,
} from "@/data/lab-facts";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

/** The two that are not projects. Everything below is sorted automatically. */
const FIXED_ITEMS = [
  { label: "now", value: "based hardware · omi", ref: "omi" },
  { label: "mine", value: "tsc.hk", ref: "tschk" },
] as const;

/**
 * A · Margin. The aurora puts its colour at the rim and leaves the centre
 * clear, so the type does the same: everything sits in the four edges and the
 * middle of the page stays sky. Hovering a margin item is what fills it —
 * the empty centre is the reading surface, not decoration.
 */
export default function LabMargin({ onSelect }: LabLayoutProps = {}) {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const [active, setActive] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const entry = active ? LAB_REFS[active] : null;
  const visited = PLACES.filter((place) => !place.next).length;

  // Categories are derived from the README at build time, so the margin
  // reorganises itself when a project is added upstream.
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
  const openGroup = categories.find((category) => category.key === group);
  const total = categories.reduce(
    (count, category) => count + category.items.length,
    0,
  );

  return (
    <div className="lab-root lab-margin" style={dayTheme.style}>
      <LabBackground dayTheme={dayTheme} />

      <main className="lab-margin-frame">
        <div className="lab-margin-tl">
          <LabClock
            dayTheme={dayTheme}
            location={now.location}
            status={now.status}
          />
        </div>

        <div className="lab-margin-tr">
          <p className="lab-margin-name">
            {IDENTITY.name}
            <br />
            <span>{IDENTITY.hanzi}</span>
          </p>
        </div>

        <div className="lab-margin-left">
          <ul className="lab-margin-list">
            {FIXED_ITEMS.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className={`lab-margin-item ${active === item.ref ? "is-active" : ""}`}
                  onMouseEnter={() => {
                    setActive(item.ref);
                    setGroup(null);
                  }}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => {
                    setActive(item.ref);
                    setGroup(null);
                  }}
                  onBlur={() => setActive(null)}
                >
                  <span className="lab-margin-key">{item.label}</span>
                  <span className="lab-margin-val">{item.value}</span>
                </button>
              </li>
            ))}
            {categories.map((category) => (
              <li key={category.key}>
                <button
                  type="button"
                  className={`lab-margin-item ${group === category.key ? "is-active" : ""}`}
                  onMouseEnter={() => {
                    setGroup(category.key);
                    setActive(null);
                  }}
                  onMouseLeave={() => setGroup(null)}
                  onFocus={() => {
                    setGroup(category.key);
                    setActive(null);
                  }}
                  onBlur={() => setGroup(null)}
                >
                  <span className="lab-margin-key">{category.label}</span>
                  <span className="lab-margin-val">
                    {category.items.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* The centre: sky, until something is asked about. */}
        <div className="lab-margin-centre" aria-live="polite">
          {openGroup ? (
            <article className="lab-margin-card lab-margin-group">
              <h2>{openGroup.label}</h2>
              <p className="lab-margin-kind">{openGroup.blurb}</p>
              <ul className="lab-margin-names">
                {openGroup.items.map((project) => (
                  <li key={project.name}>{project.name}</li>
                ))}
              </ul>
            </article>
          ) : entry ? (
            <article className="lab-margin-card">
              <h2>{entry.title}</h2>
              <p className="lab-margin-kind">{entry.kind}</p>
              <p className="lab-margin-body">{entry.body}</p>
              <p className="lab-margin-src">
                {entry.source} — {entry.stat}
              </p>
            </article>
          ) : (
            <h1 className="lab-margin-tagline">
              <GhostTagline block suffixClassName="lab-margin-suffix" />
            </h1>
          )}
        </div>

        <div className="lab-margin-right">
          <dl className="lab-margin-counts">
            <div>
              <dt>prs</dt>
              <dd>{OMI.pullRequests}</dd>
            </div>
            <div>
              <dt>merged</dt>
              <dd>{OMI.merged}</dd>
            </div>
            <div>
              <dt>countries</dt>
              <dd>{visited}</dd>
            </div>
            <div>
              <dt>in one year</dt>
              <dd>{COUNTRIES_IN_A_YEAR}</dd>
            </div>
            <div>
              <dt>left school</dt>
              <dd>17</dd>
            </div>
            <div>
              <dt>repos</dt>
              <dd>{total}</dd>
            </div>
          </dl>
        </div>

        <div className="lab-margin-bottom">
          <nav className="lab-margin-links">
            {LAB_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {link.name}
              </a>
            ))}
          </nav>
          <p className="lab-margin-seal">格物致知</p>
        </div>
      </main>

      <LabSwitch current="margin" onSelect={onSelect} />
    </div>
  );
}
