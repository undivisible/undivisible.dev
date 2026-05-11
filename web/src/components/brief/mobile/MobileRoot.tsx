import { useRef } from "react";
import { motion } from "motion/react";
import {
  mono,
  sans,
  serif,
  GRADIENT,
  C,
  TILE_LINK_HOVER,
} from "@/components/brief/ui/constants";
import { Background } from "@/components/brief/desktop/Background";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

const stats = [
  { v: "9", s: "yrs", l: "Building software\nsince age 8" },
  { v: "40", s: "+", l: "Open source\nrepos" },
  { v: "6", s: "", l: "Platforms:\nweb iOS macOS\nvisionOS Android TUI" },
  { v: "∞", s: "", l: "Unusual\nrequests" },
];

const svcs = [
  {
    n: "01",
    title: "Micro-Startup Studio",
    body: "Napkin sketch to live product in weeks. Full stack, designed, deployed, and shaped around a clear outcome.",
  },
  {
    n: "02",
    title: "AI Automation",
    body: "Audit → build. AI agents handling phone reception, quote pipelines, client comms, intake, reporting, and admin.",
  },
  {
    n: "03",
    title: "Bespoke Web & Apps",
    body: "WebGL, spatial interfaces, eCommerce, dashboards, and native-feeling apps built around the business.",
  },
  {
    n: "04",
    title: "Complex & Unusual",
    body: "OS kernels, compilers, browser runtimes, AI agents, CRMs, and cybersecurity tooling.",
  },
];

const cases = [
  {
    metric: "50%",
    tag: "AI Automation · Financial Services",
    title: "Projected ~50% headcount exposure",
    body: "Operational audit mapped subcontractor hours to rule-based workflows, then designed AI agents for quotes, email, routing, and intake.",
    badge: "Projected audit model",
    solid: true,
  },
  {
    metric: "$70k",
    tag: "AI Automation · Service Business · Voice Agents",
    title: "$70,000 / yr annualized savings",
    body: "Technician dispatch, customer qualification, and receptionist triage moved into AI phone agents and automated intake.",
    badge: "$70k annualized",
    solid: true,
  },
  {
    metric: "420×",
    tag: "Browser Extension · Real Estate",
    title: "7 hours → under 1 minute",
    body: "One-click CMA extension for live data aggregation, listing comparison, and structured report generation.",
    badge: "7 hrs → <1 min",
    solid: true,
  },
  {
    metric: "live",
    tag: "Graft · Studio of Optimisations",
    title: "Conversational automation funnel",
    body: "Voice entry, booking, MCP-backed tool streaming, status updates, and onboarding handoffs at optimisations.studio. Includes a custom voice agent you can call from a telephone number.",
    badge: "optimisations.studio",
    solid: false,
    badgeHref: "https://optimisations.studio",
  },
  {
    metric: "0→1",
    tag: "Brand · eCommerce · Packaging · Apps",
    title: "Automotive aftermarket transformation",
    body: "Brand system, packaging, bespoke commerce surface, and companion app direction across creative and implementation.",
    badge: "Brand · Commerce · Apps",
    solid: false,
  },
];

const tech: [string, "hot" | "mid" | ""][] = [
  ["Rust", "hot"],
  ["Swift", "hot"],
  ["TypeScript", "hot"],
  ["Go", "hot"],
  ["Python", "hot"],
  ["C / C#", "hot"],
  ["V", "hot"],
  ["Zig", "hot"],
  ["React / Next.js", "mid"],
  ["Svelte / Solid", "mid"],
  ["React Native", "mid"],
  ["WebGL / WASM", "mid"],
  ["SurrealDB", "mid"],
  ["PostgreSQL", "mid"],
  ["SQLite", "mid"],
  ["Supabase", "mid"],
  ["RocksDB", "mid"],
  ["Vector DBs", "mid"],
  ["Embedding Models", ""],
  ["On-Device SLM", ""],
  ["OpenAI / MCP", ""],
  ["Hugging Face", ""],
  ["RAG Pipelines", ""],
  ["AI Agents", ""],
  ["Docker / K8s", ""],
  ["GitHub Actions", ""],
  ["CI / CD", ""],
  ["Cloudflare", ""],
  ["GPUI / Taffy", ""],
  ["UniFFI / FFI", ""],
];

const projs = [
  {
    org: "semitechnological",
    name: "Crepuscularity + Aurorality",
    tech: ["Rust", "Swift", "GPUI", "SwiftUI", "UniFFI"],
    desc: "Experimental GPUI component system with hot reload. One template targets desktop, TUI, browser extensions, HTML, and mobile. Aurorality compiles to native SwiftUI.",
    tag: "Framework",
  },
  {
    org: "semitechnological",
    name: "Wax",
    tech: ["Rust", "Tokio", "Async"],
    desc: "System package manager in Rust — parity with Homebrew, Scoop, and Nix. Handles system packages, casks, lockfile pinning, custom taps. 16–20× faster search, 4× faster installs.",
    tag: "Package Manager",
  },
  {
    org: "semitechnological",
    name: "Equilibrium + eqswift",
    tech: ["Rust", "Bindgen", "UniFFI", "Zig", "Nim"],
    desc: "Load foreign code with one call — C, C++, C#, Zig, Nim, Odin. Zero-config Rust-to-Swift FFI, no UDL files required.",
    tag: "Interop / FFI",
  },
  {
    org: "atechnology company",
    name: "Soliloquy + rv8",
    tech: ["Rust", "Servo", "V8", "Alpine"],
    desc: "Experimental OS on Alpine with kernel-level modifications — Rust shell, Servo rendering, V8 runtime. Prototype target: much faster browser-like runtime with sharply lower memory use.",
    tag: "OS / Runtime",
  },
  {
    org: "undivisible",
    name: "Atmosphere",
    tech: ["Swift", "Rust", "iOS", "Windows", "Android"],
    desc: "Cross-device sync for Apple, Windows, Android, and browsers. Universal clipboard, continuity, file sharing, share extensions, keyboard extensions, P2P tunneling.",
    tag: "Ecosystem",
  },
  {
    org: "undivisible",
    name: "unthinkclaw + unthinkmail",
    tech: ["Rust", "SurrealDB", "MCP", "IMAP"],
    desc: "Local-first Rust agent runtime — 1/100 the size of OpenClaw, runs on your device with agent swarms for speed. Telegram, Discord, Slack, WhatsApp, Matrix, Signal, IRC. unthinkmail adds native IMAP via MCP.",
    tag: "AI Agent Runtime",
  },
];

const contacts = [
  { label: "max@undivisible.dev", href: "mailto:max@undivisible.dev" },
  { label: "+61 481 729 894", href: "tel:+61481729894" },
  { label: "undivisible.dev", href: "https://undivisible.dev" },
  { label: "github.com/undivisible", href: "https://github.com/undivisible" },
];

const P = 24; // horizontal padding

export function MobileRoot({ embed = false }: { embed?: boolean } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      style={{
        color: "#ffffff",
        fontFamily: sans,
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {embed ? (
        <Background containerRef={containerRef} />
      ) : (
        <Background />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── HERO ── */}
        <motion.div {...fadeIn} style={{ padding: `64px ${P}px 48px` }}>
          {/* Overline */}
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 20,
              letterSpacing: "0.02em",
            }}
          >
            Max Carter · Builder · Melbourne / Sydney / Hong Kong
          </div>

          {/* Headline */}
          <div
            style={{
              fontFamily: serif,
              fontSize: "clamp(36px,9vw,52px)",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            <span style={{ color: "#ffffff" }}>Building the</span>
            <br />
            <span style={{ color: "#ff5705", fontStyle: "italic" }}>
              unthought of.
            </span>
          </div>

          {/* Subline */}
          <p
            style={{
              fontFamily: sans,
              fontSize: 15,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.65,
              margin: "0 0 24px",
            }}
          >
            9 years shipping unusual software — from operating systems to AI
            agents for real business workflows.
          </p>

          {/* Contacts */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginBottom: 32,
            }}
          >
            {contacts.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              overflowX: "scroll",
              gap: 0,
              marginLeft: -P,
              marginRight: -P,
              paddingLeft: P,
              paddingRight: P,
              scrollbarWidth: "none",
            }}
          >
            {stats.map(({ v, s, l }, i) => (
              <div
                key={v + l}
                style={{
                  flexShrink: 0,
                  padding: "16px 20px",
                  borderLeft:
                    i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 32,
                    lineHeight: 1,
                    marginBottom: 6,
                    letterSpacing: "-0.03em",
                    color: "#ffffff",
                  }}
                >
                  {v === "∞" ? (
                    <span
                      style={{
                        background: GRADIENT,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      ∞
                    </span>
                  ) : (
                    <>
                      {v}
                      <span
                        style={{
                          background: GRADIENT,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          fontSize: 16,
                        }}
                      >
                        {s}
                      </span>
                    </>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    color: "rgba(255,255,255,0.28)",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── SERVICES ── */}
        <motion.div {...fadeIn} style={{ padding: `40px ${P}px` }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 24,
            }}
          >
            What I do
          </div>
          {svcs.map(({ n, title, body }, i) => (
            <div
              key={n}
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 16,
                paddingBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.25)",
                  marginBottom: 6,
                  letterSpacing: "-0.02em",
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 17,
                  color: "#ffffff",
                  fontWeight: 700,
                  marginBottom: 6,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.7,
                }}
              >
                {body}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── RESULTS ── */}
        <motion.div {...fadeIn} style={{ padding: `40px ${P}px` }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 24,
            }}
          >
            Proven outcomes
          </div>
          {cases.map(({ metric, tag, title, body, badge, solid, badgeHref }) => (
            <div key={metric + tag} style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(36px,9vw,52px)",
                  fontStyle: "italic",
                  lineHeight: 1,
                  marginBottom: 6,
                  background: GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {metric}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}
              >
                {tag}
              </div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 17,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                  marginBottom: 6,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  lineHeight: 1.6,
                  marginBottom: 10,
                }}
              >
                {body}
              </div>
              {badgeHref ? (
                <a
                  href={badgeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    solid
                      ? `${TILE_LINK_HOVER} hover:brightness-105`
                      : `${TILE_LINK_HOVER} bg-transparent hover:bg-white/[0.12]`
                  }
                  style={{
                    fontFamily: mono,
                    fontSize: 8,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: 75,
                    textDecoration: "none",
                    display: "inline-block",
                    ...(solid
                      ? {
                          background: "#ffffff",
                          color: "#000000",
                          fontWeight: 600,
                        }
                      : {
                          border: "1px solid rgba(255,255,255,0.25)",
                          color: "rgba(255,255,255,0.55)",
                        }),
                  }}
                >
                  {badge}
                </a>
              ) : (
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 8,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: 75,
                    ...(solid
                      ? {
                          background: "#ffffff",
                          color: "#000000",
                          fontWeight: 600,
                        }
                      : {
                          border: "1px solid rgba(255,255,255,0.25)",
                          color: "rgba(255,255,255,0.55)",
                        }),
                  }}
                  className={
                    solid
                      ? `cursor-default ${TILE_LINK_HOVER} hover:brightness-105`
                      : `cursor-default bg-white/[0.04] ${TILE_LINK_HOVER} hover:bg-white/[0.12]`
                  }
                >
                  {badge}
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {/* ── TECH GRID ── */}
        <motion.div {...fadeIn} style={{ padding: `40px ${P}px` }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 16,
            }}
          >
            Core technology
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            {tech.map(([label, level]) => (
              <div
                key={label}
                style={{
                  background: "rgba(5,5,5,0.9)",
                  padding: "8px 4px",
                  fontFamily: mono,
                  fontSize: 9,
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                  color:
                    level === "hot"
                      ? "rgba(255,255,255,0.85)"
                      : level === "mid"
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.3)",
                  fontWeight: level === "hot" ? 500 : 400,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── PROJECTS ── */}
        <motion.div {...fadeIn} style={{ padding: `40px ${P}px` }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 24,
            }}
          >
            Building sharp tools.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {projs.map((p, i) => (
              <div
                key={p.name}
                style={{
                  padding: "20px 18px",
                  background: [0, 2, 4].includes(i)
                    ? "linear-gradient(135deg, rgba(160,224,171,0.08) 0%, rgba(255,172,46,0.06) 50%, rgba(165,45,37,0.08) 100%)"
                    : "rgba(12,12,12,0.9)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 8,
                    color: "rgba(255,255,255,0.28)",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    marginBottom: 4,
                  }}
                >
                  {p.org}
                </div>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 17,
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                    marginBottom: 8,
                    lineHeight: 1.2,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    marginBottom: 8,
                  }}
                >
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily: mono,
                        fontSize: 8,
                        letterSpacing: "-0.02em",
                        padding: "2px 6px",
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.55)",
                        borderRadius: 3,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}
                >
                  {p.desc}
                </div>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 8,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.4)",
                    borderRadius: 75,
                  }}
                >
                  {p.tag}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── FOOTER ── */}
        <div style={{ padding: `32px ${P}px 48px`, textAlign: "center" }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "-0.02em",
            }}
          >
            max@undivisible.dev · github.com/undivisible
          </div>
        </div>
      </div>
    </div>
  );
}
