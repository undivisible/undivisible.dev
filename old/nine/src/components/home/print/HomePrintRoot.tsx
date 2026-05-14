import { C, mono, sans, serif } from "@/components/brief/ui/constants";
import { Ft } from "@/components/brief/ui/Ft";
import { Tb } from "@/components/brief/ui/Tb";
import {
  resumeCommunity,
  resumeContact,
  resumeEducation,
  resumeExperience,
  resumeHumanLanguages,
  resumeInterests,
  resumePrintProjects,
  resumeSkillGroups,
} from "@/data/resume-document";

function SectionTitle({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 7.4,
        letterSpacing: "-0.04em",
        textTransform: "uppercase",
        color: C.orange,
        marginBottom: 7,
      }}
    >
      {children}
    </div>
  );
}

function ListItem({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "7px 1fr",
        gap: 6,
        fontSize: 8.8,
        color: C.mid,
        lineHeight: 1.45,
      }}
    >
      <span style={{ color: C.orange, lineHeight: 1.2 }}>•</span>
      <span>{children}</span>
    </div>
  );
}

export function HomePrintRoot() {
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
        @page {
          size: A4;
          margin: 0;
          background: ${C.cream};
        }
        @media print {
          html,
          body {
            background: ${C.cream} !important;
          }
          .page-wrapper {
            background: ${C.cream} !important;
          }
        }
      `}</style>
      <div className="page-wrapper" style={{ flexShrink: 0 }}>
        <div
          style={{
            width: "210mm",
            height: "297mm",
            background: C.cream,
            color: C.black,
            display: "flex",
            flexDirection: "column",
            fontFamily: sans,
            overflow: "hidden",
          }}
        >
          <Tb left="Resume" right="undivisible.dev" />

          <div
            style={{
              background: C.black,
              color: C.cream,
              padding: "18px 24px 16px",
              borderBottom: `3px solid ${C.orange}`,
              display: "grid",
              gridTemplateColumns: "1fr 185px",
              gap: 18,
              alignItems: "end",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 8,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: C.orange,
                  marginBottom: 7,
                }}
              >
                Max Carter · 祁明思
              </div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 40,
                  lineHeight: 0.94,
                  letterSpacing: "-0.03em",
                }}
              >
                Software systems builder.
              </div>
              <div
                style={{
                  marginTop: 10,
                  maxWidth: 420,
                  fontSize: 10.2,
                  lineHeight: 1.48,
                  color: "rgba(255,248,230,0.62)",
                }}
              >
                Self-taught full-stack and low-level developer building systems,
                runtimes, native interfaces, AI agents, automation products, and
                unusual software that feels inevitable. Building production
                software since age 8. I love learning and experiencing new
                things, then turning that breadth into better products.
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 3,
              }}
            >
              {resumeContact.map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr",
                    gap: 6,
                    fontSize: 7.8,
                    lineHeight: 1.35,
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
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1.12fr 0.88fr",
              gap: 0,
              background: C.cream,
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: C.cream,
                padding: "14px 14px 14px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
                overflow: "hidden",
              }}
            >
              <section>
                <SectionTitle>Experience</SectionTitle>
                {resumeExperience.map((job) => (
                  <div
                    key={`${job.org}-${job.role}`}
                    style={{
                      borderTop: `1px solid ${C.rule}`,
                      padding: "6px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 12,
                        alignItems: "baseline",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11.1,
                          fontWeight: 700,
                          color: C.black,
                          lineHeight: 1.15,
                        }}
                      >
                        {job.role} · {job.org}
                      </div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 6.8,
                          letterSpacing: "-0.04em",
                          textTransform: "uppercase",
                          color: C.mid,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {job.time}
                      </div>
                    </div>
                    <div style={{ marginTop: 5, display: "grid", gap: 3 }}>
                      {job.points.map((point) => (
                        <ListItem key={point}>{point}</ListItem>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              <section>
                <SectionTitle>Selected projects</SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    columnGap: 8,
                    rowGap: 4,
                  }}
                >
                  {resumePrintProjects.map(({ name, href, desc }) => (
                    <div
                      key={name}
                      style={{
                        borderTop: `1px solid ${C.rule}`,
                        paddingTop: 3,
                        minHeight: 38,
                      }}
                    >
                      <a
                        href={href}
                        style={{
                          display: "block",
                          fontSize: 9.2,
                          fontWeight: 700,
                          color: C.black,
                          lineHeight: 1,
                          textDecoration: "none",
                          margin: 0,
                          padding: 0,
                        }}
                      >
                        {name}
                      </a>
                      <div
                        style={{
                          marginTop: 3,
                          fontSize: 7.75,
                          color: C.mid,
                          lineHeight: 1.34,
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div
              style={{
                background: C.black,
                color: C.cream,
                padding: "14px 24px 14px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                overflow: "hidden",
              }}
            >
              <section>
                <SectionTitle>Technical stack</SectionTitle>
                <div style={{ display: "grid", gap: 5 }}>
                  {resumeSkillGroups.map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        borderTop: "1px solid rgba(255,248,230,0.1)",
                        paddingTop: 5,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 6.8,
                          letterSpacing: "-0.04em",
                          textTransform: "uppercase",
                          color: "rgba(255,248,230,0.35)",
                          marginBottom: 2,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 8.6,
                          color: "rgba(255,248,230,0.65)",
                          lineHeight: 1.42,
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>Education</SectionTitle>
                <div style={{ display: "grid", gap: 4 }}>
                  {resumeEducation.map((item) => (
                    <div
                      key={item}
                      style={{
                        fontSize: 8.5,
                        color: "rgba(255,248,230,0.62)",
                        lineHeight: 1.42,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>Languages</SectionTitle>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {resumeHumanLanguages.map((item) => (
                    <span
                      key={item}
                      style={{
                        border: "1px solid rgba(255,248,230,0.12)",
                        padding: "3px 6px",
                        fontSize: 7.8,
                        color: "rgba(255,248,230,0.58)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>Community / CTF</SectionTitle>
                <div style={{ display: "grid", gap: 3 }}>
                  {resumeCommunity.map((item) => (
                    <ListItem key={item}>{item}</ListItem>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>Interests</SectionTitle>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {resumeInterests.map((item) => (
                    <span
                      key={item}
                      style={{
                        background: "rgba(255,248,230,0.06)",
                        color: "rgba(255,248,230,0.58)",
                        padding: "3px 6px",
                        fontSize: 7.8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <Ft left="Max Carter — Resume PDF" right="undivisible.dev" />
        </div>
      </div>
    </div>
  );
}
