import { C, mono, sans, serif } from "@/components/brief/ui/constants";
import { Tb } from "@/components/brief/ui/Tb";
import { Ft } from "@/components/brief/ui/Ft";

export function Page2() {
  const cases = [
    {
      n: "01",
      tag: "AI Automation · Financial Services · CRM Integration",
      title: "Operational Audit — Projected ~50% Headcount Reduction",
      body: "Mapped subcontractor hours against rule-based workflows, then designed an AI agent layer for broker quotes, client email, document routing, and intake inside the existing CRM. Projection based on audit model: roughly half of operational headcount exposed to automation.",
      badges: [
        { solid: true, label: "Projected ~50%" },
        { solid: false, label: "Audit model" },
      ],
    },
    {
      n: "02",
      tag: "AI Automation · Service Business · Voice Agents",
      title: "$70,000 / Year Recovered — Voice + Intake Automation",
      body: "Identified technician dispatch, customer qualification, and receptionist triage as rule-based payroll spend. Deployed AI phone agents and automated intake pipelines, with annualized savings framed from the client's existing cost base.",
      badges: [{ solid: true, label: "$70k annualized" }],
    },
    {
      n: "03",
      tag: "Browser Extension · Real Estate · Instant Analysis",
      title: "7 Hours Per Listing → Under 1 Minute — One-Click CMA",
      body: "A real estate agency spent 5–7 hours per property pulling data, formatting reports, and cross-referencing listings. Built a browser extension for one-click comparative market analysis with live aggregation and structured report output.",
      badges: [{ solid: true, label: "7 hrs → <1 min per listing" }],
    },
    {
      n: "04",
      tag: "Graft · Studio of Optimisations · SvelteKit · AI Automation",
      title: "Graft Website — Conversational Automation Funnel",
      body: "Built the Studio of Optimisations site as a live automation intake surface: rotating problem prompts, voice entry, booking handoff, MCP-backed tool streaming, and onboarding paths that carry context forward instead of restarting the user.",
      badges: [{ solid: false, label: "optimisations.studio" }],
    },
    {
      n: "05",
      tag: "Brand · eCommerce · Packaging · Apps",
      title: "Automotive Aftermarket — Brand, Commerce, and Apps",
      body: "Reworked the brand system, product packaging, bespoke commerce surface, and companion app direction for an automotive aftermarket company. Scope combined creative, implementation, and product architecture.",
      badges: [{ solid: false, label: "Brand · Commerce · Apps" }],
    },
  ];

  const techRows = [
    [
      ["Rust", "hot"],
      ["Swift", "hot"],
      ["TypeScript", "hot"],
      ["Go", "hot"],
      ["Python", "hot"],
      ["C / C#", "hot"],
    ],
    [
      ["V", "hot"],
      ["Zig", "hot"],
      ["React / Next.js", "mid"],
      ["Svelte / Solid", "mid"],
      ["React Native", "mid"],
      ["WebGL / WASM", "mid"],
    ],
    [
      ["SurrealDB", "mid"],
      ["PostgreSQL", "mid"],
      ["SQLite", "mid"],
      ["Supabase", "mid"],
      ["RocksDB", "mid"],
      ["Vector DBs", "mid"],
    ],
    [
      ["Embedding Models", ""],
      ["On-Device SLM", ""],
      ["OpenAI / MCP", ""],
      ["Hugging Face", ""],
      ["RAG Pipelines", ""],
      ["AI Agents", ""],
    ],
    [
      ["Docker / K8s", ""],
      ["GitHub Actions", ""],
      ["CI / CD", ""],
      ["Cloudflare", ""],
      ["GPUI / Taffy", ""],
      ["UniFFI / FFI", ""],
    ],
  ] as [string, string][][];

  return (
    <div
      style={{
        width: "210mm",
        height: "297mm",
        background: C.black,
        display: "flex",
        flexDirection: "column",
        fontFamily: sans,
        fontSize: 11,
        color: C.cream,
        lineHeight: 1.5,
        overflow: "hidden",
      }}
    >
      <Tb
        left="Case Studies & Results"
        right="Max Carter · undivisible.dev"
        dark
      />

      <div
        style={{
          padding: "14px 26px 11px",
          borderBottom: "1px solid rgba(255,248,230,0.1)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 8.5,
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
            color: C.orange,
            marginBottom: 4,
          }}
        >
          Proven outcomes
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 26,
            color: C.cream,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Results that speak for{" "}
          <em style={{ color: "#ff5705" }}>themselves.</em>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "0 26px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {cases.map(({ n, tag, title, body, badges }, ci) => (
          <div
            key={n}
            style={{
              display: "grid",
              gridTemplateColumns: "34px 1fr",
              gap: "0 11px",
              padding: "6px 0 7px",
              borderTop: ci > 0 ? "1px solid rgba(255,248,230,0.1)" : "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 25,
                color: "rgba(255,172,46,0.22)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                paddingTop: 2,
              }}
            >
              {n}
            </div>
            <div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 8,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: C.orange,
                  marginBottom: 3,
                }}
              >
                {tag}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: C.cream,
                  lineHeight: 1.18,
                  letterSpacing: "-0.02em",
                  marginBottom: 3,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 8.65,
                  color: "rgba(255,248,230,0.52)",
                  lineHeight: 1.42,
                }}
              >
                {body}
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                {badges.map(({ solid, label }) => (
                  <span
                    key={label}
                    style={{
                      fontFamily: mono,
                      fontSize: 7.4,
                      letterSpacing: "-0.05em",
                      textTransform: "uppercase",
                      padding: "2px 7px",
                      whiteSpace: "nowrap",
                      ...(solid
                        ? {
                            background: C.orange,
                            color: C.black,
                            fontWeight: 600,
                          }
                        : {
                            border: `1px solid rgba(255,172,46,0.5)`,
                            color: C.orange,
                          }),
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 8, paddingTop: 5, flexShrink: 0 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 7.4,
              letterSpacing: "-0.05em",
              textTransform: "uppercase",
              color: C.orange,
              marginBottom: 5,
            }}
          >
            Core technology — primary: Rust · Swift · TypeScript · Go · Python
          </div>
          <div style={{ border: "1px solid rgba(255,248,230,0.1)" }}>
            {techRows.map((row, ri) => (
              <div
                key={ri}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6,1fr)",
                  gap: 1,
                  background: "rgba(255,248,230,0.1)",
                  borderTop:
                    ri > 0 ? "1px solid rgba(255,248,230,0.1)" : "none",
                }}
              >
                {row.map(([label, level]) => (
                  <div
                    key={label}
                    style={{
                      background: C.black,
                      padding: "5px 0",
                      fontFamily: mono,
                      fontSize: 7.6,
                      letterSpacing: "-0.05em",
                      textAlign: "center",
                      color:
                        level === "hot"
                          ? C.cream
                          : level === "mid"
                            ? "rgba(255,248,230,0.65)"
                            : "rgba(255,248,230,0.38)",
                      fontWeight: level === "hot" ? 500 : 400,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Ft
        left="Max Carter — Case Studies · Page 02 of 03"
        right="undivisible.dev"
        dark
      />
    </div>
  );
}
