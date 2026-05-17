import { Fragment, type ReactNode } from "react";
import { C, mono, sans, serif } from "@/components/brief/ui/constants";
import { Ft } from "@/components/brief/ui/Ft";
import { Tb } from "@/components/brief/ui/Tb";
import { resumeDoc } from "@/data/resume-document";
import {
  resumeItemKey,
  type ResumeListItem,
  type ResumeProjectSection,
  type ResumeSubsection,
} from "@/lib/parse-resume-markdown";

const PAGE_W = "210mm";

function SectionTitle({
  children,
}: {
  children: string;
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
        marginBottom: 5,
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
        gap: 5,
        fontSize: 7.8,
        color: onDark ? "rgba(255,248,230,0.62)" : C.mid,
        lineHeight: 1.38,
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
        background: onDark ? "rgba(255,248,230,0.06)" : "transparent",
        padding: "2px 5px",
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

function ProjectCell({ item }: { item: ResumeListItem }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${C.rule}`,
        paddingTop: 2,
        breakInside: "avoid",
      }}
    >
      <div
        style={{
          fontSize: 8.2,
          fontWeight: 700,
          color: C.black,
          lineHeight: 1.12,
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
      {(item.meta || item.desc) && (
        <div
          style={{
            marginTop: 1,
            fontSize: 6.8,
            color: C.mid,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {[item.meta, item.desc].filter(Boolean).join(" — ")}
        </div>
      )}
    </div>
  );
}

function ExpProductLine({ item }: { item: ResumeListItem }) {
  const blurb = [item.meta, item.desc].filter(Boolean).join(" — ");
  return (
    <div style={{ fontSize: 7.2, color: C.mid, lineHeight: 1.32 }}>
      <span style={{ fontWeight: 700, color: C.black }}>{item.name}</span>
      {blurb ? ` — ${blurb}` : null}
    </div>
  );
}

function SubsectionBlock({ sub }: { sub: ResumeSubsection }) {
  return (
    <div style={{ marginTop: 4 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 6.2,
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
  <>
      <Tb left="Resume" right="undivisible.dev" />
      <div
        style={{
          background: C.black,
          color: C.cream,
          padding: "14px 22px 12px",
          borderBottom: `3px solid ${C.orange}`,
          display: "grid",
          gridTemplateColumns: "1fr 178px",
          gap: 16,
          alignItems: "end",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 7.6,
              letterSpacing: "-0.05em",
              textTransform: "uppercase",
              color: C.orange,
              marginBottom: 6,
            }}
          >
            {doc.nameLine}
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 36,
              lineHeight: 0.94,
              letterSpacing: "-0.03em",
            }}
          >
            {doc.titleLine}.
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 9.2,
              lineHeight: 1.44,
              color: "rgba(255,248,230,0.62)",
            }}
          >
            {doc.summary}
          </div>
        </div>
        <div style={{ display: "grid", gap: 2 }}>
          {doc.contact.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr",
                gap: 5,
                fontSize: 7.4,
                lineHeight: 1.32,
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
    </>
  );
}

function ProfileSidebar() {
  const doc = resumeDoc;
  return (
    <div
      style={{
        background: C.black,
        color: C.cream,
        padding: "10px 20px 10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <section>
        <SectionTitle onDark>Technical stack</SectionTitle>
        <div style={{ display: "grid", gap: 3 }}>
          {doc.skills.map(([label, value]) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 6.2,
                  textTransform: "uppercase",
                  color: "rgba(255,248,230,0.35)",
                  marginBottom: 1,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 7.4,
                  color: "rgba(255,248,230,0.62)",
                  lineHeight: 1.36,
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
        <div style={{ display: "grid", gap: 3 }}>
          {doc.education.map((item) => (
            <div
              key={item}
              style={{
                fontSize: 7.4,
                color: "rgba(255,248,230,0.62)",
                lineHeight: 1.36,
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

function ProjectCatalog({ sections }: { sections: ResumeProjectSection[] }) {
  let itemIndex = 0;
  return (
    <div style={{ padding: "10px 22px 8px" }}>
      <SectionTitle>Work & projects</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          columnGap: 7,
          rowGap: 0,
          alignContent: "start",
        }}
      >
        {sections.map((section) => (
          <Fragment key={section.title}>
            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: section.title === sections[0]?.title ? 0 : 8,
                marginBottom: 3,
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 6.8,
                  letterSpacing: "-0.04em",
                  textTransform: "uppercase",
                  color: C.orange,
                }}
              >
                {section.title}
              </div>
              {section.intro ? (
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 7,
                    color: C.mid,
                    lineHeight: 1.32,
                  }}
                >
                  {section.intro}
                </div>
              ) : null}
            </div>
            {section.items.map((item) => {
              const key = resumeItemKey(item, itemIndex++);
              return (
                <ProjectCell key={key} item={item} />
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function PrintPage({
  children,
  page,
  total,
}: {
  children: ReactNode;
  page: number;
  total: number;
  last?: boolean;
}) {
  return (
    <div
      className="page-wrapper"
      style={{
        width: PAGE_W,
        background: C.cream,
      }}
    >
      <div
        style={{
          width: PAGE_W,
          background: C.cream,
          color: C.black,
          display: "flex",
          flexDirection: "column",
          fontFamily: sans,
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
          .page-wrapper { box-shadow: none !important; margin: 0 !important; }
          .page-wrapper:last-child { page-break-after: auto !important; }
        }
      `}</style>

      <PrintPage page={1} total={totalPages}>
        <ResumeHeader />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            alignItems: "stretch",
          }}
        >
          <div style={{ padding: "10px 12px 8px 22px" }}>
            <SectionTitle>Experience</SectionTitle>
            {doc.experience.map((job) => (
              <div
                key={`${job.org}-${job.role}`}
                style={{ borderTop: `1px solid ${C.rule}`, padding: "4px 0" }}
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
                      fontSize: 10.2,
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
                        fontSize: 6.4,
                        textTransform: "uppercase",
                        color: C.mid,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {job.time}
                    </div>
                  ) : null}
                </div>
                <div style={{ marginTop: 2, display: "grid", gap: 1 }}>
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
      </PrintPage>

      <PrintPage page={2} total={totalPages}>
        <Tb left="Resume" right="undivisible.dev" />
        <ProjectCatalog sections={doc.projectSections} />
      </PrintPage>
    </div>
  );
}
