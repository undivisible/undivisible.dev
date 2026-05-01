"use client";

import { motion } from "motion/react";
import { GRADIENT, mono, sans, serif } from "@/components/brief/ui/constants";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const cases = [
  {
    n: "01", tag: "AI Automation · Financial Services",
    title: "~50% headcount automated",
    metric: "50%",
    body: "End-to-end audit → AI agent layer: broker quotes, automated emails, document routing, intake workflows — projected ~50% reduction in operational headcount.",
    badge: "~50% headcount automated", solid: true,
  },
  {
    n: "02", tag: "AI Automation · Service Business · Voice Agents",
    title: "$70,000 / yr recovered",
    metric: "$70k",
    body: "Dispatching, qualification, and reception triage were all rule-based payroll spend. Deployed AI phone agents and automated intake pipelines end-to-end.",
    badge: "$70,000 / yr recovered", solid: true,
  },
  {
    n: "03", tag: "Browser Extension · Real Estate",
    title: "7 hours → under 1 minute",
    metric: "420×",
    body: "Full CMA in one click — live data aggregation, structured report generation. What took a full working day per listing is now under sixty seconds.",
    badge: "7 hrs → <1 min", solid: true,
  },
  {
    n: "04", tag: "Brand · eCommerce · Packaging · Apps",
    title: "Full digital transformation",
    metric: "0→1",
    body: "Bespoke eCommerce, product packaging design, companion apps, new brand identity. No templates. The kind of presence that makes competitors look like afterthoughts.",
    badge: "eCommerce · Brand · Apps", solid: false,
  },
];

const tech: [string, "hot" | "mid" | ""][] = [
  ["Rust", "hot"],            ["Swift", "hot"],         ["TypeScript", "hot"],
  ["Go", "hot"],              ["Python", "hot"],         ["C / C#", "hot"],
  ["V", "hot"],               ["Zig", "hot"],            ["React / Next.js", "mid"],
  ["Svelte / Solid", "mid"],  ["React Native", "mid"],  ["WebGL / WASM", "mid"],
  ["SurrealDB", "mid"],       ["PostgreSQL", "mid"],    ["SQLite", "mid"],
  ["Supabase", "mid"],        ["RocksDB", "mid"],       ["Vector DBs", "mid"],
  ["Embedding Models", ""],   ["On-Device SLM", ""],    ["OpenAI / MCP", ""],
  ["Hugging Face", ""],       ["RAG Pipelines", ""],    ["AI Agents", ""],
  ["Docker / K8s", ""],       ["GitHub Actions", ""],   ["CI / CD", ""],
  ["Cloudflare", ""],         ["GPUI / Taffy", ""],     ["UniFFI / FFI", ""],
];

export function CasesSection() {
  return (
    <section
      id="cases"
      style={{
        height: "100vh",
        scrollSnapAlign: "start",
        display: "flex",
        flexDirection: "column",
        padding: "40px 80px 28px",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        fontFamily: sans,
        background: "transparent",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}
      >
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
            Proven outcomes
          </div>
          <div style={{ fontFamily: serif, fontSize: "clamp(32px, 3.6vw, 52px)", color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Results that speak for{" "}
            <em style={{
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>themselves.</em>
          </div>
        </div>
        <a href="mailto:max@undivisible.dev" style={{ fontFamily: mono, fontSize: 10, letterSpacing: "-0.03em", textTransform: "uppercase", color: "#ffffff", opacity: 0.15, textDecoration: "none", transition: "opacity 0.18s ease" }}>
          max@undivisible.dev
        </a>
      </motion.div>

      {/* Cases */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {cases.map(({ n, tag, title, metric, body, badge, solid }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
              style={{
                display: "grid",
                gridTemplateColumns: "36px 110px 1fr auto",
                gap: "0 24px",
                alignItems: "center",
                padding: "10px 0",
                borderTop: `1px solid rgba(255,255,255,${i === 0 ? "0.1" : "0.06"})`,
              }}
            >
              {/* Ghost number */}
              <div style={{ fontFamily: serif, fontSize: 18, color: "rgba(255,255,255,0.08)", letterSpacing: "-0.04em", lineHeight: 1, userSelect: "none" }}>{n}</div>

              {/* Metric */}
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: EASE, delay: i * 0.08 + 0.18 }}
                style={{
                  fontFamily: serif,
                  fontSize: 38,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  fontStyle: "italic",
                  background: GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {metric}
              </motion.div>

              {/* Text */}
              <div>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "-0.03em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{tag}</div>
                <div style={{ fontFamily: serif, fontSize: "clamp(15px, 1.5vw, 21px)", color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, maxWidth: 580 }}>{body}</div>
              </div>

              {/* Badge */}
              <div style={{
                fontFamily: mono,
                fontSize: 8,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                padding: "5px 12px",
                whiteSpace: "nowrap",
                alignSelf: "flex-start",
                marginTop: 18,
                borderRadius: 75,
                ...(solid
                  ? { background: "#ffffff", color: "#000000", fontWeight: 600 }
                  : { border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.55)" }
                ),
              }}>{badge}</div>
            </motion.div>
          ))}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Tech grid footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ paddingTop: 14, flexShrink: 0 }}
        >
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>
            Core technology
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 1,
            background: "rgba(255,255,255,0.08)",
            width: "100%",
          }}>
            {tech.map(([label, level]) => (
              <div key={label} style={{
                background: "rgba(0,0,0,0.75)",
                padding: "8px 6px",
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: "-0.02em",
                textAlign: "center",
                color: level === "hot"
                  ? "rgba(255,255,255,0.85)"
                  : level === "mid"
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.3)",
                fontWeight: level === "hot" ? 500 : 400,
              }}>{label}</div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
