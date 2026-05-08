import {
  C,
  GRADIENT,
  mono,
  sans,
  serif,
} from "@/components/brief/ui/constants";
import { Rule } from "@/components/brief/ui/Rule";
import { Tb } from "@/components/brief/ui/Tb";
import { Ft } from "@/components/brief/ui/Ft";

function SectionHead({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 7.5,
          letterSpacing: "-0.05em",
          textTransform: "uppercase",
          color: C.orange,
          background: dark ? C.cream : C.black,
          padding: "2px 7px",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <Rule color={dark ? "rgba(255,248,230,0.15)" : C.rule} />
    </div>
  );
}

export function Page1() {
  const svcs = [
    {
      n: "01 / Micro-Startup Studio",
      t: "Idea → Live Product",
      b: "You bring the napkin sketch, late-night note, or awkward product gap. I turn it into a working, designed, deployable product quickly enough that the idea stays alive.",
    },
    {
      n: "02 / AI Automation",
      t: "Remove the Busywork",
      b: "I audit where hours and money disappear, then build AI agents and integrations for reception, quote generation, broker pipelines, client comms, intake, and reporting.",
    },
    {
      n: "03 / Bespoke Web & Apps",
      t: "Distinct Digital Surfaces",
      b: "WebGL, spatial interfaces, live chat surfaces, eCommerce, dashboards, and native-feeling apps. Built around the business and brand, not a template.",
    },
    {
      n: "04 / Complex & Unusual",
      t: "Hard Systems Work",
      b: "Operating systems, compilers, package managers, browser extensions, AI agents, CRMs, cybersecurity tooling, and custom runtimes. Broad enough to connect product, design, and infrastructure.",
    },
  ];
  const stats = [
    { v: "9", s: "yrs", l: "Building software\nsince age 8" },
    { v: "40", s: "+", l: "Open source\nrepos on GitHub" },
    { v: "5", s: "+", l: "Languages spoken\nincl. Cantonese, Russian" },
    { v: "∞", s: "", l: "Unusual project\nrequests welcome" },
  ];
  const contacts = [
    {
      k: "Email",
      v: "max@undivisible.dev",
      href: "mailto:max@undivisible.dev",
    },
    { k: "Web", v: "undivisible.dev", href: "https://undivisible.dev" },
    {
      k: "GitHub",
      v: "github.com/undivisible",
      href: "https://github.com/undivisible",
    },
    { k: "Location", v: "Melbourne · Sydney · HK", href: undefined },
    { k: "Core Stack", v: "Rust · Swift · TypeScript", href: undefined },
  ];

  return (
    <div
      style={{
        width: "210mm",
        height: "297mm",
        background: C.cream,
        display: "flex",
        flexDirection: "column",
        fontFamily: sans,
        fontSize: 11,
        color: C.black,
        lineHeight: 1.5,
        overflow: "hidden",
      }}
    >
      <Tb left="Services Overview — 2025" right="undivisible.dev" />

      {/* HERO */}
      <div
        style={{
          background: C.black,
          padding: "22px 26px 20px",
          flexShrink: 0,
          borderBottom: `3px solid ${C.orange}`,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 8.5,
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
            color: C.orange,
            marginBottom: 9,
          }}
        >
          Max Carter · Builder · Melbourne / Sydney / Hong Kong
        </div>
        {/* Two separate block divs: inline em clip causes print artifacts */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 54,
            fontWeight: 400,
            lineHeight: 1.0,
            color: C.cream,
            letterSpacing: "-0.02em",
          }}
        >
          Building the
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 54,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            fontStyle: "italic",
            color: C.orange,
            paddingBottom: "0.1em",
          }}
        >
          unthought of.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 13,
          }}
        >
          <div
            style={{
              fontSize: 12.5,
              fontStyle: "italic",
              color: "rgba(255,248,230,0.62)",
              maxWidth: 360,
              lineHeight: 1.42,
            }}
          >
            9 years shipping unusual software —<br />
            from operating systems to AI agents for real business workflows.
          </div>
          <div style={{ textAlign: "right" }}>
            {(
              [
                ["o", "max@undivisible.dev", "mailto:max@undivisible.dev"],
                ["", "+61 481 729 894", "tel:+61481729894"],
                ["", "@undivisible.dev", "https://undivisible.dev"],
                [
                  "",
                  "github.com/undivisible",
                  "https://github.com/undivisible",
                ],
              ] as [string, string, string][]
            ).map(([cls, t, href]) => (
              <a
                key={t}
                href={href}
                style={{
                  display: "block",
                  fontFamily: mono,
                  fontSize: 9,
                  letterSpacing: "-0.05em",
                  color: cls ? C.orange : "rgba(255,248,230,0.38)",
                  lineHeight: 1.9,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div
        style={{
          flex: 1,
          padding: "14px 26px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: serif,
            fontSize: 25,
            fontWeight: 400,
            lineHeight: 1.12,
            color: C.black,
            letterSpacing: "-0.02em",
            borderLeft: `3px solid ${C.orange}`,
            paddingLeft: 14,
          }}
        >
          Your next project needs someone who can
          <br />
          design, build, and ship the{" "}
          <em style={{ fontStyle: "italic", color: "#ff5705" }}>unusual.</em>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: C.rule,
            border: `1px solid ${C.rule}`,
            flexShrink: 0,
          }}
        >
          {[
            {
              overline: "Why hire me",
              body: "I work best with clear outcomes, loose constraints, and hard problems. Give me a bottleneck, product idea, or missing system and I will turn it into something testable fast.",
              bold: "No slow handoff between strategy, design, and build.",
              dark: false,
            },
            {
              overline: "What I bring",
              body: "operating systems, AI agents, eCommerce, brand design, packaging, cross-platform frameworks, cybersecurity tooling, and automation work. I work contract, across time zones, and I charge for outcomes, not hours.",
              bold: "Breadth grounded in shipped projects:",
              dark: true,
            },
          ].map(({ overline, body, bold, dark }) => (
            <div
              key={overline}
              style={{
                background: dark ? C.black : C.cream,
                padding: "10px 13px",
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 8,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: C.orange,
                  marginBottom: 5,
                }}
              >
                {overline}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: dark ? "rgba(255,248,230,0.6)" : C.mid,
                  lineHeight: 1.62,
                }}
              >
                {dark ? (
                  <>
                    <strong style={{ color: C.cream }}>{bold}</strong> {body}
                  </>
                ) : (
                  <>
                    {body} <strong style={{ color: C.black }}>{bold}</strong>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 1,
            background: C.rule,
            border: `1px solid ${C.rule}`,
            overflow: "hidden",
          }}
        >
          {svcs.map(({ n, t, b }) => (
            <div
              key={n}
              style={{
                background: C.cream,
                padding: "10px 13px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 8,
                  letterSpacing: "-0.05em",
                  color: C.orange,
                  marginBottom: 4,
                  textTransform: "uppercase",
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.black,
                  marginBottom: 4,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                {t}
              </div>
              <div style={{ fontSize: 10.5, color: C.mid, lineHeight: 1.58 }}>
                {b}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            border: `1px solid ${C.rule}`,
            flexShrink: 0,
          }}
        >
          {stats.map(({ v, s, l }, i) => (
            <div
              key={v}
              style={{
                flex: 1,
                padding: "9px 13px",
                borderRight:
                  i < stats.length - 1 ? `1px solid ${C.rule}` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 26,
                  lineHeight: 1,
                  marginBottom: 3,
                  letterSpacing: "-0.02em",
                }}
              >
                {v === "∞" ? (
                  <span style={{ color: C.orange }}>∞</span>
                ) : (
                  <>
                    {v}
                    <span style={{ color: C.orange }}>{s}</span>
                  </>
                )}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 8,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: C.mid,
                  lineHeight: 1.55,
                  whiteSpace: "pre-line",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", background: C.black, flexShrink: 0 }}>
        {contacts.map(({ k, v, href }, i) => (
          <div
            key={k}
            style={{
              flex: 1,
              padding: "9px 11px",
              borderRight:
                i < contacts.length - 1
                  ? "1px solid rgba(255,248,230,0.07)"
                  : "none",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 7.5,
                letterSpacing: "-0.05em",
                textTransform: "uppercase",
                color: "rgba(255,248,230,0.26)",
                whiteSpace: "nowrap",
              }}
            >
              {k}
            </span>
            {href ? (
              <a
                href={href}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: C.cream,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: "none",
                }}
              >
                {v}
              </a>
            ) : (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: C.cream,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {v}
              </span>
            )}
          </div>
        ))}
      </div>

      <Ft
        left="Max Carter — Services Brief · Page 01 of 03"
        right="undivisible.dev"
      />
    </div>
  );
}
