import type { ReactNode } from "react";
import { C, mono, sans, serif } from "@/components/brief/ui/constants";
import { Ft } from "@/components/brief/ui/Ft";
import { Tb } from "@/components/brief/ui/Tb";
import { resumeDoc } from "@/data/resume-document";
import {
  parseInlineMdSegments,
  resumeItemBlurb,
  resumeItemKey,
  type ResumeListItem,
  type ResumeProjectSection,
  type ResumeSubsection,
} from "@/lib/parse-resume-markdown";

const PAGE_W = "210mm";
const PAGE_H = "297mm";

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

function Bullet({ children, onDark = false }: { children: string; onDark?: boolean }) {
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

function Tag({ children, onDark = false }: { children: string; onDark?: boolean }) {
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

function ProjectCard({ item }: { item: ResumeListItem }) {
  const blurb = resumeItemBlurb(item);
  return (
    <div
      style={{
        background: C.cream,
        border: `1px solid ${C.rule}`,
        borderRadius: 7,
        padding: "7px 8px 6px",
        breakInside: "avoid",
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: C.black,
          lineHeight: 1.15,
          fontFamily: sans,
        }}
      >
        {item.href ? (
          <a href={item.href} style={{ color: C.black, textDecoration: "none" }}>
            {item.name}
          </a>
        ) : (
          item.name
        )}
      </div>
      {blurb ? (
        <div
          style={{
            marginTop: 3,
            fontSize: 6.8,
            color: C.mid,
            lineHeight: 1.32,
          }}
        >
          {blurb}
        </div>
      ) : null}
    </div>
  );
}

function ExpProductLine({ item }: { item: ResumeListItem }) {
  const blurb = resumeItemBlurb(item);
  return (
    <div style={{ fontSize: 7, color: C.mid, lineHeight: 1.32 }}>
      <span style={{ fontWeight: 700, color: C.black }}>{item.name}</span>
      {blurb ? ` — ${blurb}` : null}
    </div>
  );
}

function SubsectionBlock({ sub }: { sub: ResumeSubsection }) {
  return (
    <div style={{ marginTop: 5 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 6,
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color: C.mid,
          marginBottom: 2,
        }}
      >
        {sub.title}
      </div>
      <div style={{ display: "grid", gap: 1 }}>
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
        {doc.contact.map(([label, value]) => (
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
              {value}
            </span>
          </div>
        ))}
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
        padding: "16px 22px 16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
        minHeight: "100%",
        alignSelf: "stretch",
        boxSizing: "border-box",
      }}
    >
      <section>
        <SectionTitle onDark>Technical stack</SectionTitle>
        <div style={{ display: "grid", gap: 2 }}>
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

      <section>
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
        <section>
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

      <section>
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
        <section>
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
          Work & <em style={{ fontStyle: "italic", color: C.orange }}>projects</em>.
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

function ProjectSectionBlock({ section }: { section: ResumeProjectSection }) {
  return (
    <section>
      <SectionTitle>
        <InlineMdText text={section.title} />
      </SectionTitle>
      {section.intro ? (
        <div
          style={{
            marginTop: -4,
            marginBottom: 5,
            fontSize: 6.5,
            color: C.mid,
            lineHeight: 1.3,
          }}
        >
          {section.intro}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 7,
        }}
      >
        {section.items.map((item, i) => (
          <ProjectCard key={resumeItemKey(item, i)} item={item} />
        ))}
      </div>
    </section>
  );
}

function ProjectsPage({ sections }: { sections: ResumeProjectSection[] }) {
  const projectCount = sections.reduce((n, s) => n + s.items.length, 0);

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
          padding: "10px 26px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {sections.map((section) => (
          <ProjectSectionBlock key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
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
        <Ft left="Max Carter — Resume" right={`undivisible.dev · ${page}/${total}`} />
      </div>
    </div>
  );
}

export function HomePrintRoot() {
  const doc = resumeDoc;
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
        <Tb left="Resume" right="undivisible.dev" />
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
              display: "grid",
              gridTemplateColumns: "1.12fr 0.88fr",
              alignItems: "stretch",
              alignSelf: "stretch",
            }}
          >
            <div
              style={{
                background: C.cream,
                height: "100%",
                minHeight: "100%",
                alignSelf: "stretch",
                padding: "18px 20px 18px 26px",
                boxSizing: "border-box",
              }}
            >
              <SectionTitle>Experience</SectionTitle>
              {doc.experience.map((job) => (
                <div
                  key={`${job.org}-${job.role}`}
                  style={{ borderTop: `1px solid ${C.rule}`, padding: "6px 0" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 6,
                      alignItems: "baseline",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
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
                          fontSize: 6.2,
                          textTransform: "uppercase",
                          color: C.mid,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {job.time}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ marginTop: 3, display: "grid", gap: 2 }}>
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
            <ProfileSidebar />
          </div>
        </div>
      </PrintPage>

      <PrintPage page={2} total={totalPages} surface="alt">
        <ProjectsPage sections={doc.projectSections} />
      </PrintPage>
    </div>
  );
}
