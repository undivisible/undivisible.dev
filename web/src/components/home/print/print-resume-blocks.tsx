import type { ReactNode } from "react";
import { C, mono, serif } from "@/components/brief/ui/constants";
import { lifeTimeline } from "@/data/life-timeline";
import {
  parseInlineMdSegments,
  resumeItemKey,
  type ResumeListItem,
  type ResumeSubsection,
} from "@/lib/parse-resume-markdown";
import { contactHref } from "@/lib/resume-contact";
import { getCachedResumeDocument } from "@/components/home/print/print-document";
import { Bullet, SectionTitle, Tag } from "@/components/home/print/print-primitives";
import { EXP_PAGE, pt } from "@/components/home/print/print-metrics";

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
    <div
      style={{
        fontSize: EXP_PAGE.productLine,
        color: C.mid,
        lineHeight: 1.45,
      }}
    >
      <span style={{ fontWeight: 700, color: C.black }}>{label}</span>
      {parts.length ? <> — {parts}</> : null}
    </div>
  );
}

export function SubsectionBlock({ sub }: { sub: ResumeSubsection }) {
  return (
    <div style={{ marginTop: 9 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: EXP_PAGE.subTitle,
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

export function ResumeHeader() {
  const doc = getCachedResumeDocument();
  return (
    <div
      style={{
        background: C.black,
        color: C.cream,
        padding: "8px 16px 6px",
        borderBottom: `3px solid ${C.orange}`,
        display: "grid",
        gridTemplateColumns: "1fr 120px",
        gap: 10,
        alignItems: "end",
        flexShrink: 0,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: mono,
            fontSize: pt(6),
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
            color: C.orange,
            marginBottom: 3,
          }}
        >
          {doc.nameLine}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: pt(22),
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {doc.titleLine}.
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: pt(7),
            lineHeight: 1.35,
            color: "rgba(255,248,230,0.62)",
          }}
        >
          {doc.summary}
        </div>
      </div>
      <div style={{ display: "grid", gap: 2 }}>
        {doc.contact.map(([label, value]) => {
          const href = contactHref(label, value);
          return (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr",
                gap: 2,
                fontSize: pt(6),
                lineHeight: 1.25,
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

export function ProfileSidebar() {
  const doc = getCachedResumeDocument();
  return (
    <div
      style={{
        background: C.black,
        color: C.cream,
        padding: "7px 14px 9px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
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
            gap: 2,
          }}
        >
          {lifeTimeline.map((item) => (
            <div
              key={`${item.age}-${item.title}`}
              style={{
                border: "1px solid rgba(255,248,230,0.12)",
                padding: "2px 3px",
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: pt(5.5),
                  textTransform: "uppercase",
                  color: C.orange,
                  lineHeight: 1.15,
                }}
              >
                Age {item.age}
              </div>
              <div
                style={{
                  marginTop: 1,
                  fontSize: pt(6),
                  fontWeight: 700,
                  color: C.cream,
                  lineHeight: 1.15,
                }}
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <section style={{ flex: "1.4 1 0" }}>
          <SectionTitle onDark>Technical stack</SectionTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px 8px",
            }}
          >
            {doc.skills.map(([label, value]) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: pt(5.5),
                    textTransform: "uppercase",
                    color: "rgba(255,248,230,0.35)",
                    marginBottom: 1,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: pt(6.5),
                    color: "rgba(255,248,230,0.62)",
                    lineHeight: 1.25,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ flex: "1 1 0" }}>
          <SectionTitle onDark>Education</SectionTitle>
          <div style={{ display: "grid", gap: 1 }}>
            {doc.education.map((item) => (
              <div
                key={item}
                style={{
                  fontSize: pt(6.5),
                  color: "rgba(255,248,230,0.62)",
                  lineHeight: 1.25,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {doc.humanLanguages.length > 0 ? (
          <section style={{ flex: "0.6 1 0" }}>
            <SectionTitle onDark>Languages</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {doc.humanLanguages.map((item) => (
                <Tag key={item} onDark>
                  {item}
                </Tag>
              ))}
            </div>
          </section>
        ) : null}

        <section style={{ flex: "0.8 1 0" }}>
          <SectionTitle onDark>Community / CTF</SectionTitle>
          <div style={{ display: "grid", gap: 1 }}>
            {doc.community.map((item) => (
              <Bullet key={item} onDark>
                {item}
              </Bullet>
            ))}
          </div>
        </section>

        {doc.interests.length > 0 ? (
          <section style={{ flex: "0.7 1 0" }}>
            <SectionTitle onDark>Interests</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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
