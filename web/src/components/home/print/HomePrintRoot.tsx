import type { ReactNode } from "react";
import { C, mono, sans, serif } from "@/components/brief/ui/constants";
import { Ft } from "@/components/brief/ui/Ft";
import { Tb } from "@/components/brief/ui/Tb";
import { lifeTimeline } from "@/data/life-timeline";
import type { ReadmeProject } from "@/lib/profile-readme";
import { getReadmeBundleFromGenerated } from "@/lib/profile-readme";
import { resumeDoc } from "@/data/resume-document";
import {
  parseInlineMdSegments,
  resumeItemBlurb,
  resumeItemKey,
  type ResumeListItem,
  type ResumeSubsection,
} from "@/lib/parse-resume-markdown";

const PAGE_W = "210mm";
const PAGE_H = "297mm";

type PrintProject = ReadmeProject | ResumeListItem;

type PrintProjectSection = {
  title: string;
  intro?: string;
  items: PrintProject[];
};

function contactHref(label: string, value: string) {
  if (label === "Email") return `mailto:${value}`;
  if (label === "Phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (label === "Instagram") return "https://instagram.com/undivisible.dev";
  if (label === "Twitter") return "https://x.com/makethings4ppl";
  if (label === "GitHub") return `https://${value}`;
  return null;
}

function InlineMdText({
  text,
  linkStyle,
}: {
  text: string;
  linkStyle?: React.CSSProperties;
}) {
  const segments = parseInlineMdSegments(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "link" ? (
          <a
            key={`${seg.href}-${i}`}
            href={seg.href}
            style={{
              color: C.orange,
              textDecoration: "underline",
              textUnderlineOffset: "1px",
              ...linkStyle,
            }}
          >
            {seg.label}
          </a>
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </>
  );
}

function SectionTitle({
  children,
  onDark = false,
}: {
  children: ReactNode;
  onDark?: boolean;
}) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 7.2,
        letterSpacing: "-0.04em",
        textTransform: "uppercase",
        color: C.orange,
        marginBottom: onDark ? 6 : 8,
      }}
    >
      {children}
    </div>
  );
}

function Bullet({
  children,
  onDark = false,
}: {
  children: string;
  onDark?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "6px 1fr",
        gap: 6,
        fontSize: 7.8,
        color: onDark ? "rgba(255,248,230,0.62)" : C.mid,
        lineHeight: 1.4,
      }}
    >
      <span style={{ color: C.orange }}>•</span>
      <span>{children}</span>
    </div>
  );
}

function Tag({
  children,
  onDark = false,
}: {
  children: string;
  onDark?: boolean;
}) {
  return (
    <span
      style={{
        border: onDark
          ? "1px solid rgba(255,248,230,0.14)"
          : `1px solid ${C.rule}`,
        background: onDark ? "rgba(255,248,230,0.06)" : "rgba(10,10,10,0.04)",
        padding: "2px 6px",
        fontSize: 7,
        color: onDark ? "rgba(255,248,230,0.58)" : C.mid,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function ProjectCard({ item }: { item: PrintProject }) {
  const isResumeItem = "meta" in item;
  const baseBlurb = isResumeItem ? resumeItemBlurb(item) : item.desc;
  const stack = !isResumeItem ? item.stack?.trim() : undefined;
  const blurb = stack ? `${baseBlurb} Built with ${stack}` : baseBlurb;
  const label = "meta" in item && item.meta ? item.meta : item.name;
  const content = (
    <div
      style={{
        background: C.cream,
        border: `1px solid ${C.rule}`,
        borderRadius: 5,
        padding: "6px 8px",
        height: "100%",
        boxSizing: "border-box",
        breakInside: "avoid",
      }}
    >
      <div
        style={{
          fontSize: 8.8,
          fontWeight: 700,
          color: C.black,
          lineHeight: 1.15,
          fontFamily: sans,
        }}
      >
        {label}
      </div>
      {blurb ? (
        <div
          style={{
            marginTop: 2,
            fontSize: 6.8,
            color: C.mid,
            lineHeight: 1.3,
          }}
        >
          {blurb}
        </div>
      ) : null}
    </div>
  );

  return item.href ? (
    <a
      href={item.href}
      style={{
        color: "inherit",
        textDecoration: "none",
        display: "block",
        height: "100%",
      }}
    >
      {content}
    </a>
  ) : (
    content
  );
}

function ProjectHeroCard({ item }: { item: ReadmeProject }) {
  const stack = item.stack ? ` Built with ${item.stack}` : "";
  const body = `${readmeBundle.mainHeroQuote} ${item.desc}${stack}`;

  return (
    <a
      href={item.href}
      style={{
        display: "block",
        color: "inherit",
        textDecoration: "none",
        background: C.cream,
        border: `1px solid ${C.rule}`,
        borderRadius: 6,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.38fr 1fr",
          gap: 15,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 6.7,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: C.orange,
              marginBottom: 4,
            }}
          >
            Headline platform
          </div>
          <div
            style={{
              color: C.black,
              fontFamily: serif,
              fontSize: 28,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {item.name}
          </div>
        </div>
        <div
          style={{
            fontSize: 9.2,
            color: C.mid,
            lineHeight: 1.42,
            paddingTop: 2,
          }}
        >
          {body}
        </div>
      </div>
    </a>
  );
}

function ExpProductLine({ item }: { item: ResumeListItem }) {
  const meta = item.meta.trim();
  const name = item.name.trim();
  const hasSecondaryLink = item.descSegments.some(
    (segment) => segment.type === "link" && segment.href !== item.href,
  );
  const descSegments = hasSecondaryLink
    ? item.descSegments
    : parseInlineMdSegments(item.desc);
  const parts: ReactNode[] = [];
  if (meta && meta.toLowerCase() !== name.toLowerCase()) {
    parts.push(meta);
  }
  if (item.desc.trim()) {
    if (parts.length) parts.push(" — ");
    parts.push(
      ...descSegments.map((segment, i) =>
        segment.type === "link" ? (
          <a
            key={`${segment.href}-${i}`}
            href={segment.href}
            style={{
              color: C.black,
              textDecoration: "none",
              borderBottom: `1px solid ${C.rule}`,
            }}
          >
            {segment.label}
          </a>
        ) : (
          <span key={`${segment.value}-${i}`}>{segment.value}</span>
        ),
      ),
    );
  }
  if (item.stack.trim()) {
    if (parts.length) parts.push(" — ");
    parts.push(
      <span key="stack" style={{ color: C.orange }}>
        {item.stack.trim()}
      </span>,
    );
  }
  const label = item.href ? (
    <a href={item.href} style={{ color: C.black, textDecoration: "none" }}>
      {item.name}
    </a>
  ) : (
    item.name
  );
  return (
    <div style={{ fontSize: 8.8, color: C.mid, lineHeight: 1.45 }}>
      <span style={{ fontWeight: 700, color: C.black }}>{label}</span>
      {parts.length ? <> — {parts}</> : null}
    </div>
  );
}

function SubsectionBlock({ sub }: { sub: ResumeSubsection }) {
  return (
    <div style={{ marginTop: 9 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 7.1,
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color: C.mid,
          marginBottom: 4,
        }}
      >
        {sub.title}
      </div>
      <div style={{ display: "grid", gap: 3 }}>
        {sub.items.map((item, i) => (
          <ExpProductLine key={resumeItemKey(item, i)} item={item} />
        ))}
      </div>
    </div>
  );
}

function ResumeHeader() {
  const doc = resumeDoc;
  return (
    <div
      style={{
        background: C.black,
        color: C.cream,
        padding: "16px 26px 14px",
        borderBottom: `3px solid ${C.orange}`,
        display: "grid",
        gridTemplateColumns: "1fr 178px",
        gap: 18,
        alignItems: "end",
        flexShrink: 0,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 7.4,
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
            color: C.orange,
            marginBottom: 8,
          }}
        >
          {doc.nameLine}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 34,
            lineHeight: 0.94,
            letterSpacing: "-0.03em",
          }}
        >
          {doc.titleLine}.
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 9,
            lineHeight: 1.45,
            color: "rgba(255,248,230,0.62)",
          }}
        >
          {doc.summary}
        </div>
      </div>
      <div style={{ display: "grid", gap: 3 }}>
        {doc.contact.map(([label, value]) => {
          const href = contactHref(label, value);
          return (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr",
                gap: 5,
                fontSize: 7.3,
                lineHeight: 1.34,
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  textTransform: "uppercase",
                  color: "rgba(255,248,230,0.3)",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  color: label === "Email" ? C.orange : C.cream,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {href ? (
                  <a
                    href={href}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {value}
                  </a>
                ) : (
                  value
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileSidebar() {
  const doc = resumeDoc;
  return (
    <div
      style={{
        background: C.black,
        color: C.cream,
        padding: "11px 26px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 9,
        height: "auto",
        minHeight: 0,
        alignSelf: "stretch",
        boxSizing: "border-box",
      }}
    >
      <section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 1fr)",
            gap: 3,
          }}
        >
          {lifeTimeline.map((item) => (
            <div
              key={`${item.age}-${item.title}`}
              style={{
                border: "1px solid rgba(255,248,230,0.12)",
                padding: "3px 4px",
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 5.5,
                  textTransform: "uppercase",
                  color: C.orange,
                  lineHeight: 1.2,
                }}
              >
                Age {item.age}
              </div>
              <div
                style={{
                  marginTop: 1,
                  fontSize: 6.2,
                  fontWeight: 700,
                  color: C.cream,
                  lineHeight: 1.12,
                }}
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
        <section style={{ flex: "1.75 1 0" }}>
          <SectionTitle onDark>Technical stack</SectionTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3px 10px",
            }}
          >
            {doc.skills.map(([label, value]) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 6,
                    textTransform: "uppercase",
                    color: "rgba(255,248,230,0.35)",
                    marginBottom: 1,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 7.1,
                    color: "rgba(255,248,230,0.62)",
                    lineHeight: 1.32,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ flex: "1.05 1 0" }}>
          <SectionTitle onDark>Education</SectionTitle>
          <div style={{ display: "grid", gap: 2 }}>
            {doc.education.map((item) => (
              <div
                key={item}
                style={{
                  fontSize: 7.1,
                  color: "rgba(255,248,230,0.62)",
                  lineHeight: 1.32,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {doc.humanLanguages.length > 0 ? (
          <section style={{ flex: "0.72 1 0" }}>
            <SectionTitle onDark>Languages</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {doc.humanLanguages.map((item) => (
                <Tag key={item} onDark>
                  {item}
                </Tag>
              ))}
            </div>
          </section>
        ) : null}

        <section style={{ flex: "0.98 1 0" }}>
          <SectionTitle onDark>Community / CTF</SectionTitle>
          <div style={{ display: "grid", gap: 2 }}>
            {doc.community.map((item) => (
              <Bullet key={item} onDark>
                {item}
              </Bullet>
            ))}
          </div>
        </section>

        {doc.interests.length > 0 ? (
          <section style={{ flex: "0.82 1 0" }}>
            <SectionTitle onDark>Interests</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {doc.interests.map((item) => (
                <Tag key={item} onDark>
                  {item}
                </Tag>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ProjectsPageHeader({ projectCount }: { projectCount: number }) {
  return (
    <div
      style={{
        background: C.black,
        color: C.cream,
        padding: "14px 26px 12px",
        borderBottom: `3px solid ${C.orange}`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 26,
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            color: C.cream,
          }}
        >
          Work &{" "}
          <em style={{ fontStyle: "italic", color: C.orange }}>projects</em>.
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 6.5,
            letterSpacing: "-0.03em",
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
          fontSize: 7.5,
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color: C.orange,
          marginBottom: 5,
        }}
      >
        <InlineMdText text={section.title} />
      </div>
      {section.intro ? (
        <div
          style={{
            marginTop: -2,
            marginBottom: 3,
            fontSize: 6,
            color: C.mid,
            lineHeight: 1.22,
          }}
        >
          {section.intro}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
        }}
      >
        {section.items.map((item, i) => (
          <ProjectCard key={`${item.name}:${item.href}:${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function ProjectsPage({ sections }: { sections: PrintProjectSection[] }) {
  const projectCount = sections.reduce((n, s) => n + s.items.length, 0);
  const heroProject = readmeBundle.mainProjects[0];
  const featuredSection = sections.find((s) => s.title === "Flagship projects");
  const otherSection = sections.find((s) => s.title === "Other projects");

  const otherCategories = [
    { label: "macOS / Desktop", items: "rs_peekaboo, rs_imessage, rs_facetime, drift, tile, tabyrus, unelaborate, vro, rover" },
    { label: "Browser Extensions", items: "rs_vimium (Rust rewrite), anywhere (AI chat widgets)" },
    { label: "Developer Tools", items: "incisor (Etcher rewrite), rs_opencode, bluetooth-terminal" },
    { label: "Web Apps", items: "standpoint, notes, bublik, alphabets, infrastruct, soliloquy" },
    { label: "Libraries", items: "rs_ai, stalwart-lite, crosspost-rs, svelte-streamdown, ark-protocol, monoprotocol" },
    { label: "AI & Automation", items: "folk-around, poke-around, unthinkmail" },
  ];

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
          padding: "9px 22px 7px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {heroProject ? <ProjectHeroCard item={heroProject} /> : null}
        {featuredSection ? (
          <section>
            <div
              style={{
                fontFamily: mono,
                fontSize: 7.5,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                color: C.orange,
                marginBottom: 5,
              }}
            >
              <InlineMdText text={featuredSection.title} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {featuredSection.items.map((item, i) => {
                const isResumeItem = "meta" in item;
                const baseBlurb = isResumeItem ? resumeItemBlurb(item) : item.desc;
                const stack = !isResumeItem ? item.stack?.trim() : undefined;
                const blurb = stack ? `${baseBlurb} Built with ${stack}` : baseBlurb;
                const label =
                  "meta" in item && item.meta ? item.meta : item.name;
                const row = (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "140px 1fr auto",
                      gap: "0 12px",
                      padding: "6px 12px",
                      background: C.cream,
                      border: `1px solid ${C.rule}`,
                      borderRadius: 4,
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: C.black,
                        lineHeight: 1.15,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 7,
                        color: C.mid,
                        lineHeight: 1.4,
                        paddingTop: 1,
                      }}
                    >
                      {blurb}
                    </div>
                    {stack ? (
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 6.5,
                          letterSpacing: "-0.04em",
                          color: C.orange,
                          whiteSpace: "nowrap",
                          paddingTop: 1,
                        }}
                      >
                        {stack}
                      </div>
                    ) : null}
                  </div>
                );
                return item.href ? (
                  <a
                    key={`${item.name}:${item.href}:${i}`}
                    href={item.href}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    {row}
                  </a>
                ) : (
                  <div key={`${item.name}:${item.href}:${i}`}>{row}</div>
                );
              })}
            </div>
          </section>
        ) : null}
        {otherSection ? (
          <section>
            <div
              style={{
                fontFamily: mono,
                fontSize: 7.5,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                color: C.orange,
                marginBottom: 5,
              }}
            >
              + {otherSection.items.length} more projects across categories — full list on github.com/undivisible & undivisible.dev
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 1,
                background: C.rule,
                border: `1px solid ${C.rule}`,
              }}
            >
              {otherCategories.map(({ label, items }) => (
                <div
                  key={label}
                  style={{
                    background: C.cream,
                    padding: "6px 9px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 6.8,
                      letterSpacing: "-0.04em",
                      textTransform: "uppercase",
                      color: C.orange,
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 6.8,
                      color: C.mid,
                      lineHeight: 1.45,
                    }}
                  >
                    {items}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const readmeBundle = getReadmeBundleFromGenerated();

const FEATURED_PROJECTS: string[] = [
  "crepuscularity",
  "inauguration",
  "alpenglow",
  "space",
  "wax",
  "rv8",
  "unthinkclaw",
];

function isFeaturedProject(project: ReadmeProject): boolean {
  return FEATURED_PROJECTS.includes(project.key);
}

function websiteProjectSections(): PrintProjectSection[] {
  const allProjects = [
    ...readmeBundle.mainProjects,
    ...readmeBundle.utilities,
    ...readmeBundle.libraries,
    ...readmeBundle.miniapps,
  ];

  const featured = allProjects.filter(isFeaturedProject);
  const rest = allProjects.filter((p) => !isFeaturedProject(p));

  return [
    { title: "Flagship projects", items: featured },
    { title: "Other projects", items: rest },
  ];
}

function PrintPage({
  children,
  page,
  total,
  surface = "cream",
}: {
  children: ReactNode;
  page: number;
  total: number;
  surface?: "cream" | "alt";
}) {
  const bg = surface === "alt" ? C.bgAlt : C.cream;
  return (
    <div
      className="page-wrapper"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        background: bg,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: PAGE_W,
          height: PAGE_H,
          background: bg,
          color: C.black,
          display: "flex",
          flexDirection: "column",
          fontFamily: sans,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {children}
        <Ft
          left="Max Carter — Resume"
          right={`undivisible.dev · ${page}/${total}`}
        />
      </div>
    </div>
  );
}

export function HomePrintRoot() {
  const doc = resumeDoc;
  const projectSections = websiteProjectSections();
  const totalPages = 2;

  return (
    <div
      className="print-only"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: C.cream,
      }}
    >
      <style>{`
        @page { size: A4; margin: 0; background: ${C.cream}; }
        @media print {
          html, body { background: ${C.cream} !important; margin: 0 !important; }
          .page-wrapper {
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            page-break-after: always;
            break-after: page;
          }
          .page-wrapper:last-child {
            page-break-after: auto !important;
            break-after: auto;
          }
        }
      `}</style>

      <PrintPage page={1} total={totalPages}>
        <Tb
          left="RESUME BUILT WITH REACT"
          right={
            <a
              href="https://undivisible.dev"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              undivisible.dev
            </a>
          }
        />
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <ResumeHeader />
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              alignSelf: "stretch",
            }}
          >
            <div
              style={{
                background: C.cream,
                flex: 1,
                minHeight: 0,
                padding: "16px 26px 14px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SectionTitle>Experience</SectionTitle>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {doc.experience.map((job) => (
                  <div
                    key={`${job.org}-${job.role}`}
                    style={{
                      borderTop: `1px solid ${C.rule}`,
                      padding: "10px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 8,
                        alignItems: "baseline",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12.2,
                          fontWeight: 700,
                          color: C.black,
                          lineHeight: 1.12,
                        }}
                      >
                        {job.role}
                        {job.org ? ` · ${job.org}` : ""}
                      </div>
                      {job.time ? (
                        <div
                          style={{
                            fontFamily: mono,
                            fontSize: 7.2,
                            textTransform: "uppercase",
                            color: C.mid,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {job.time}
                        </div>
                      ) : null}
                    </div>
                    <div style={{ marginTop: 5, display: "grid", gap: 3 }}>
                      {job.bullets.map((point) => (
                        <Bullet key={point}>{point}</Bullet>
                      ))}
                    </div>
                    {job.subsections.map((sub) => (
                      <SubsectionBlock key={sub.title} sub={sub} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <ProfileSidebar />
          </div>
        </div>
      </PrintPage>

      <PrintPage page={2} total={totalPages} surface="alt">
        <Tb
          left={
            <a
              href="https://undivisible.dev/#projects"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Selected projects
            </a>
          }
          right={
            <a
              href="https://undivisible.dev"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Descriptions pulled from GitHub README · project names and top
              tabs clickable
            </a>
          }
        />
        <ProjectsPage sections={projectSections} />
      </PrintPage>
    </div>
  );
}
