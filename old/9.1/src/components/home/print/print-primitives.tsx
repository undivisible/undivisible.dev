import type { ReactNode } from "react";
import { C, mono } from "@/components/brief/ui/constants";
import { parseInlineMdSegments } from "@/lib/parse-resume-markdown";
import { pt } from "@/components/home/print/print-metrics";

export function InlineMdText({
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

export function SectionTitle({
  children,
  onDark = false,
  fontSize = pt(7.2),
}: {
  children: ReactNode;
  onDark?: boolean;
  fontSize?: number;
}) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize,
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

export function Bullet({
  children,
  onDark = false,
  fontSize = pt(7),
}: {
  children: string;
  onDark?: boolean;
  fontSize?: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "5px 1fr",
        gap: 5,
        fontSize,
        color: onDark ? "rgba(255,248,230,0.62)" : C.mid,
        lineHeight: 1.35,
      }}
    >
      <span style={{ color: C.orange }}>•</span>
      <span>{children}</span>
    </div>
  );
}

export function Tag({
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
        padding: "1px 4px",
        fontSize: pt(6),
        color: onDark ? "rgba(255,248,230,0.58)" : C.mid,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
