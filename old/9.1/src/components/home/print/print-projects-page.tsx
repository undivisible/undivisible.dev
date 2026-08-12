import { C, mono, serif } from "@/components/brief/ui/constants";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { resumeProjectCategoryRows } from "@/lib/profile-readme";
import {
  type PrintProjectSection,
} from "@/components/home/print/print-document";
import { InlineMdText } from "@/components/home/print/print-primitives";
import {
  FeaturedProjectRow,
  ProjectCard,
  ProjectHeroCard,
} from "@/components/home/print/print-project-widgets";
import { pt } from "@/components/home/print/print-metrics";

export function ProjectsPageHeader({ projectCount }: { projectCount: number }) {
  return (
    <div
      style={{
        background: C.black,
        color: C.cream,
        padding: "6px 18px 6px",
        borderBottom: `3px solid ${C.orange}`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: pt(18),
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: C.cream,
          }}
        >
          Work &{" "}
          <em style={{ fontStyle: "italic", color: C.orange }}>projects</em>.
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: pt(5.5),
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "rgba(255,248,230,0.45)",
            textAlign: "right",
          }}
        >
          {projectCount} selected
        </div>
      </div>
    </div>
  );
}

function ProjectSectionBlock({ section }: { section: PrintProjectSection }) {
  return (
    <section>
      <div
        style={{
          fontFamily: mono,
          fontSize: pt(6.5),
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color: C.orange,
          marginBottom: 4,
        }}
      >
        <InlineMdText text={section.title} />
      </div>
      {section.intro ? (
        <div
          style={{
            marginTop: -1,
            marginBottom: 2,
            fontSize: pt(5.5),
            color: C.mid,
            lineHeight: 1.2,
          }}
        >
          {section.intro}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4,
        }}
      >
        {section.items.map((item, i) => (
          <ProjectCard key={`${item.name}:${item.href}:${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export function ProjectsPage({
  sections,
  readme,
}: {
  sections: PrintProjectSection[];
  readme: ReadmeBundle;
}) {
  const projectCount = sections.reduce((n, s) => n + s.items.length, 0);
  const heroProject = readme.mainProjects[0];
  const featuredSection = sections.find((s) => s.title === "Flagship projects");
  const otherSection = sections.find((s) => s.title === "Other projects");

  const otherCategories = resumeProjectCategoryRows(readme);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: C.bgAlt,
      }}
    >
      <ProjectsPageHeader projectCount={projectCount} />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: "12px 18px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {heroProject ? (
          <ProjectHeroCard item={heroProject} heroQuote={readme.mainHeroQuote} />
        ) : null}
        {featuredSection ? (
          <section style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: pt(7),
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                color: C.orange,
                marginBottom: 4,
                flexShrink: 0,
              }}
            >
              <InlineMdText text={featuredSection.title} />
            </div>
            <div style={{ flex: 1, minHeight: 0, height: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {featuredSection.items.map((item, i) => (
                <FeaturedProjectRow
                  key={`${item.name}:${item.href}:${i}`}
                  item={item}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Bottom bar — anchored, black bg */}
      {otherSection ? (
        <div
          style={{
            background: C.black,
            color: C.cream,
            padding: "8px 22px 8px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: pt(7.5),
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: C.orange,
              marginBottom: 4,
            }}
          >
            + {otherSection.items.length} more projects across categories
            <span style={{ color: "rgba(255,248,230,0.4)", marginLeft: 6 }}>
              full list on github.com/undivisible & undivisible.dev
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gridAutoRows: "1fr",
              gap: 1,
              background: "rgba(255,248,230,0.12)",
            }}
          >
            {otherCategories.map(({ label, items }) => (
              <div
                key={label}
                style={{
                  background: C.black,
                  padding: "7px 10px",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(255,248,230,0.08)",
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: pt(7.2),
                    letterSpacing: "-0.04em",
                    textTransform: "uppercase",
                    color: C.orange,
                    marginBottom: 3,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: pt(7.8),
                    color: "rgba(255,248,230,0.6)",
                    lineHeight: 1.5,
                  }}
                >
                  {items}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
