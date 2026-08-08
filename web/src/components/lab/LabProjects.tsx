"use client";

import { useMemo, useState } from "react";
import {
  librariesFromReadme,
  mainProjectsFromReadme,
  miniappsFromReadme,
  utilitiesFromReadme,
} from "@/data/readme-projects.generated";
import { Ref } from "@/components/lab/Ref";
import { LAB_REFS } from "@/data/lab-refs";

type Project = {
  key?: string;
  name: string;
  href?: string;
  desc?: string;
  stack?: string;
};

/**
 * Everything, from the README — not a curated six.
 *
 * The list is synced at build time from `undivisible/undivisible`, so adding a
 * project there adds it here. Groups collapse so the whole body of work is
 * present without the page becoming a wall.
 */
export function LabProjects() {
  const groups = useMemo(
    () =>
      [
        { title: "the framework", items: mainProjectsFromReadme as Project[] },
        { title: "systems & tools", items: utilitiesFromReadme as Project[] },
        { title: "miniapps", items: miniappsFromReadme as Project[] },
        { title: "libraries", items: librariesFromReadme as Project[] },
      ].filter((group) => group.items?.length),
    [],
  );

  const total = groups.reduce((count, group) => count + group.items.length, 0);
  const [open, setOpen] = useState<string[]>(() =>
    groups.slice(0, 2).map((group) => group.title),
  );

  return (
    <section className="lab-ledger-section">
      <h2>everything else · {total} projects</h2>
      {groups.map((group) => {
        const isOpen = open.includes(group.title);
        return (
          <div key={group.title}>
            <button
              type="button"
              className="lab-group"
              aria-expanded={isOpen}
              onClick={() =>
                setOpen((current) =>
                  current.includes(group.title)
                    ? current.filter((title) => title !== group.title)
                    : [...current, group.title],
                )
              }
            >
              <span className="lab-group-name">{group.title}</span>
              <span className="lab-group-count">
                {group.items.length}
                <i aria-hidden>{isOpen ? "−" : "+"}</i>
              </span>
            </button>
            {isOpen ? (
              <div className="lab-group-body">
                {group.items.map((project) => {
                  const slug =
                    project.key && LAB_REFS[project.key] ? project.key : null;
                  const name = slug ? (
                    <Ref slug={slug}>{project.name}</Ref>
                  ) : (
                    project.name
                  );
                  return (
                    <div className="lab-project" key={project.name}>
                      <h3>
                        {project.href && project.href !== "#" ? (
                          <a
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {name}
                          </a>
                        ) : (
                          name
                        )}
                      </h3>
                      <p>{project.desc}</p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
