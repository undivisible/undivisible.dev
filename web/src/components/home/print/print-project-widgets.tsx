import { C, mono, sans, serif } from "@/components/brief/ui/constants";
import type { ReadmeProject } from "@/lib/profile-readme";
import {
  printProjectCopy,
  type PrintProject,
} from "@/components/home/print/print-document";
import { pt } from "@/components/home/print/print-metrics";

export function ProjectCard({ item }: { item: PrintProject }) {
  const { label, blurb, href } = printProjectCopy(item);
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
          fontSize: pt(8),
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
            fontSize: pt(6),
            color: C.mid,
            lineHeight: 1.3,
          }}
        >
          {blurb}
        </div>
      ) : null}
    </div>
  );

  return href ? (
    <a
      href={href}
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

export function FeaturedProjectRow({ item }: { item: PrintProject }) {
  const { label, blurb, stack, href } = printProjectCopy(item);
  const row = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "70px 1fr 175px",
        gap: "0 10px",
        padding: "6px 10px",
        flex: 1,
        minHeight: 0,
        background: C.cream,
        border: `1px solid ${C.rule}`,
        borderRadius: 4,
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: pt(8.5),
          fontWeight: 700,
          color: C.black,
          lineHeight: 1.15,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: pt(7),
          color: C.mid,
          lineHeight: 1.4,
        }}
      >
        {blurb}
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: pt(7),
          letterSpacing: "-0.04em",
          color: C.orange,
          textAlign: "right",
          lineHeight: 1.35,
          alignSelf: "center",
        }}
      >
        {stack ?? ""}
      </div>
    </div>
  );
  return href ? (
    <a
      href={href}
      style={{
        color: "inherit",
        textDecoration: "none",
        flex: 1,
        display: "flex",
      }}
    >
      {row}
    </a>
  ) : (
    <div style={{ flex: 1, display: "flex" }}>{row}</div>
  );
}

export function ProjectHeroCard({
  item,
  heroQuote,
}: {
  item: ReadmeProject;
  heroQuote: string;
}) {
  const stack = item.stack ? item.stack.trim() : "";
  const body = `${heroQuote} ${item.desc}`;

  return (
    <a
      href={item.href}
      style={{
        display: "block",
        flex: "0 0 auto",
        color: "inherit",
        textDecoration: "none",
        background: C.cream,
        border: `1px solid ${C.rule}`,
        borderRadius: 6,
        padding: "16px 12px 10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: pt(20),
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: C.black,
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: pt(6.5),
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: C.orange,
            whiteSpace: "nowrap",
          }}
        >
          {stack}
        </div>
      </div>
      <div
        style={{
          fontSize: pt(7.5),
          color: C.mid,
          lineHeight: 1.4,
        }}
      >
        {body}
      </div>
    </a>
  );
}
