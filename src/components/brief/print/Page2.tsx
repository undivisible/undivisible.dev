import { C, GRADIENT, mono, sans, serif } from "@/components/brief/ui/constants";
import { Tb } from "@/components/brief/ui/Tb";
import { Ft } from "@/components/brief/ui/Ft";

export function Page2() {
  const cases = [
    {
      n: "01", tag: "AI Automation · Financial Services · CRM Integration",
      title: "Audited a Financial Services Firm — Mapped ~50% Headcount Reduction via AI Agents",
      body: "End-to-end operational audit revealed most subcontractor hours were spent on rule-based work. Designed a full AI agent layer handling broker quote generation, automated client emails, document routing, and intake workflows — integrated into their existing CRM. Also scoped a fully custom CRM to replace their stack. Projected: ~50% reduction in operational headcount with faster turnaround and fewer errors.",
      badges: [{ solid: true, label: "~50% headcount automated" }, { solid: false, label: "Custom CRM scoped" }],
    },
    {
      n: "02", tag: "AI Automation · Service Business · Voice Agents",
      title: "$70,000 / Year Recovered — AI Agents Replace Technician Triage & Reception",
      body: "Identified that technician dispatching, customer qualification, and receptionist triage were consuming a disproportionate share of payroll for entirely rule-based work. Deployed AI phone agents and automated intake pipelines end-to-end — faster response times, higher satisfaction, and over $70,000 per year returned directly to the bottom line.",
      badges: [{ solid: true, label: "$70,000 / yr recovered" }],
    },
    {
      n: "03", tag: "Browser Extension · Real Estate · Instant Analysis",
      title: "7 Hours Per Listing → Under 1 Minute — One-Click Comparative Market Analysis",
      body: "A real estate agency was manually spending 5–7 hours per property pulling data across platforms, formatting reports, and cross-referencing listings. Built a browser extension performing a full CMA in a single click — live data aggregation, structured report generation, instant insights. What was a full working day is now under a minute.",
      badges: [{ solid: true, label: "7 hrs → <1 min per listing" }],
    },
    {
      n: "04", tag: "Brand · eCommerce · Packaging · Apps · Automotive Aftermarket",
      title: "Full Creative & Digital Transformation — Automotive Aftermarket Brand",
      body: "Rebuilt an automotive aftermarket products company from the ground up — bespoke eCommerce platform, product packaging design, companion apps, and a new brand identity. No templates, no themes. The kind of presence that makes the company look like an industry leader.",
      badges: [{ solid: false, label: "eCommerce · Packaging · Brand · Apps" }],
    },
  ];

  const techRows = [
    [["Rust","hot"],["Swift","hot"],["TypeScript","hot"],["Go","hot"],["Python","hot"],["C / C#","hot"]],
    [["V","hot"],["Zig","hot"],["React / Next.js","mid"],["Svelte / Solid","mid"],["React Native","mid"],["WebGL / WASM","mid"]],
    [["SurrealDB","mid"],["PostgreSQL","mid"],["SQLite","mid"],["Supabase","mid"],["RocksDB","mid"],["Vector DBs","mid"]],
    [["Embedding Models",""],["On-Device SLM",""],["OpenAI / MCP",""],["Hugging Face",""],["RAG Pipelines",""],["AI Agents",""]],
    [["Docker / K8s",""],["GitHub Actions",""],["CI / CD",""],["Cloudflare",""],["GPUI / Taffy",""],["UniFFI / FFI",""]],
  ] as [string, string][][];

  return (
    <div style={{ width: "210mm", height: "297mm", background: C.black, display: "flex", flexDirection: "column", fontFamily: sans, fontSize: 11, color: C.cream, lineHeight: 1.5, overflow: "hidden" }}>
      <Tb left="Case Studies & Results" right="Max Carter · undivisible.dev" dark />

      <div style={{ padding: "14px 26px 11px", borderBottom: "1px solid rgba(255,248,230,0.1)", flexShrink: 0 }}>
        <div style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.orange, marginBottom: 4 }}>Proven outcomes</div>
        <div style={{ fontFamily: serif, fontSize: 26, color: C.cream, letterSpacing: "-0.02em", lineHeight: 1 }}>
          Results that speak for <em style={{ display: "inline-block", background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>themselves.</em>
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 26px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {cases.map(({ n, tag, title, body, badges }, ci) => (
          <div key={n} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: "0 12px", padding: "9px 0 10px", borderTop: ci > 0 ? "1px solid rgba(255,248,230,0.1)" : "none", flexShrink: 0 }}>
            <div style={{ fontFamily: serif, fontSize: 25, color: "rgba(255,172,46,0.22)", lineHeight: 1, letterSpacing: "-0.04em", paddingTop: 2 }}>{n}</div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.orange, marginBottom: 3 }}>{tag}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.cream, lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 9.5, color: "rgba(255,248,230,0.52)", lineHeight: 1.58 }}>{body}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                {badges.map(({ solid, label }) => (
                  <span key={label} style={{
                    fontFamily: mono, fontSize: 8, letterSpacing: "-0.05em", textTransform: "uppercase",
                    padding: "3px 8px", whiteSpace: "nowrap",
                    ...(solid
                      ? { background: C.orange, color: C.black, fontWeight: 600 }
                      : { border: `1px solid rgba(255,172,46,0.5)`, color: C.orange }
                    )
                  }}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 14, paddingTop: 8, flexShrink: 0 }}>
          <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.orange, marginBottom: 7 }}>Core technology — primary: Rust · Swift · TypeScript · Go · Python</div>
          <div style={{ border: "1px solid rgba(255,248,230,0.1)" }}>
            {techRows.map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 1, background: "rgba(255,248,230,0.1)", borderTop: ri > 0 ? "1px solid rgba(255,248,230,0.1)" : "none" }}>
                {row.map(([label, level]) => (
                  <div key={label} style={{ background: C.black, padding: "7px 0", fontFamily: mono, fontSize: 8.5, letterSpacing: "-0.05em", textAlign: "center", color: level === "hot" ? C.cream : level === "mid" ? "rgba(255,248,230,0.65)" : "rgba(255,248,230,0.38)", fontWeight: level === "hot" ? 500 : 400 }}>{label}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Ft left="Max Carter — Case Studies · Page 02 of 03" right="undivisible.dev" dark />
    </div>
  );
}
