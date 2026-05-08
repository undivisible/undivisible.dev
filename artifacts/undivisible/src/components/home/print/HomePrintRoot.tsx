import { C, mono, sans, serif } from "@/components/brief/ui/constants";
import { Ft } from "@/components/brief/ui/Ft";
import { Tb } from "@/components/brief/ui/Tb";

const contact = [
  ["Email", "max@undivisible.dev"],
  ["Phone", "+61 481 729 894"],
  ["Web", "undivisible.dev"],
  ["GitHub", "github.com/undivisible"],
  ["LinkedIn", "linkedin.com/in/undivisible"],
  ["Location", "Melbourne / Hong Kong"],
];

const experience = [
  {
    role: "Founder / engineering lead",
    org: "The Software Company of Hong Kong",
    time: "2024-present",
    points: [
      "Build custom AI automation systems, product prototypes, client-facing web surfaces, and internal tooling.",
      "Recent work includes Studio of Optimisations, Pava, MCP-backed tool flows, voice interfaces, booking handoffs, and business workflow automation.",
    ],
  },
  {
    role: "Open-source systems builder",
    org: "semitechnological / undivisible",
    time: "2023-present",
    points: [
      "Maintain 32 public GitHub repositories across systems, runtimes, interfaces, developer tools, AI SDKs, and miniapps.",
      "Primary projects include Crepuscularity, Aurorality, Wax, Equilibrium, eqswift, rs_ai, unthinkmail, drift, notes, alphabets, and bublik.",
    ],
  },
  {
    role: "Systems and Product Architect",
    org: "Gizzmo Electronics",
    time: "late 2024",
    points: [
      "Created websites and companion app direction for hardware products, with supporting work across product surfaces, packaging, manuals, and marketing.",
    ],
  },
];

const projects = [
  {
    name: "Crepuscularity",
    href: "https://crepuscularity.undivisible.dev",
    desc: "Cross-platform application framework targeting GPUI desktop apps, Ratatui TUIs, MV3 browser extensions, websites, and mobile.",
  },
  {
    name: "Aurorality",
    href: "https://github.com/semitechnological/aurorality",
    desc: "SwiftUI-native output for web-style frontends, with Swift, TypeScript, JavaScript, or Rust backend support.",
  },
  {
    name: "Wax",
    href: "https://github.com/semitechnological/wax",
    desc: "Fast Homebrew-compatible Rust package manager using formulae, bottles, casks, APIs, lockfiles, and async execution.",
  },
  {
    name: "Equilibrium",
    href: "https://github.com/semitechnological/equilibrium",
    desc: "FFI tooling for loading C-compiling languages into Rust through a simple module-handle workflow.",
  },
  {
    name: "Eqswift",
    href: "https://github.com/semitechnological/eqswift",
    desc: "Rust-to-Swift binding tooling designed to reduce UniFFI boilerplate and make interop practical.",
  },
  {
    name: "Pava",
    href: "https://pava.studio",
    desc: "AI content marketing platform with chat onboarding, idea generation, calendar, analytics, voice, agency workspaces, and crossposting.",
  },
  {
    name: "Soliloquy",
    href: "https://atechnology.company",
    desc: "Experimental web-native operating system model on a modified Alpine base with Servo and V8.",
  },
  {
    name: "Atmosphere",
    href: "https://github.com/undivisible",
    desc: "Native sync and ecosystem layer for cross-device clipboard, continuity, file sharing, and local-first setups.",
  },
  {
    name: "Unthinkmail",
    href: "https://unthinkmail.undivisible.dev",
    desc: "MCP server for IMAP-supported email workflows.",
  },
  {
    name: "Stalwart Lite",
    href: "https://github.com/undivisible/stalwart-lite",
    desc: "Lightweight embeddable mail-server fork focused on IMAP, SMTP delivery/submission, and local-first deployments.",
  },
  {
    name: "Anywhere",
    href: "https://github.com/undivisible/anywhere",
    desc: "Browser extension that turns AI chat responses into interactive interfaces with widgets, panels, forms, charts, and tools.",
  },
  {
    name: "Poke Around",
    href: "https://github.com/undivisible/poke-around",
    desc: "Tooling for letting AI agents interact with local computers across major operating systems.",
  },
  {
    name: "Drift",
    href: "https://github.com/undivisible/drift-wallpaper",
    desc: "macOS Drift screensaver as wallpaper across desktop platforms, with music integration.",
  },
  {
    name: "Unelaborate",
    href: "https://github.com/undivisible/unelaborate",
    desc: "SwiftUI Minecraft client with Modrinth-style modpack, shader, and resource-pack loading.",
  },
  {
    name: "Notes",
    href: "https://notes.undivisible.dev",
    desc: "Minimal markdown note-taking app with font controls and Notion-style editing.",
  },
  {
    name: "Bublik",
    href: "https://bublik.undivisible.dev",
    desc: "Canvas tool for generating custom frequency soundscapes.",
  },
  {
    name: "Alphabets",
    href: "https://alphabets.undivisible.dev",
    desc: "Cards, quizzes, and completion tables for learning unicode-supported alphabets.",
  },
];

const skillGroups = [
  ["Languages", "Rust, Swift, TypeScript, Python, Go, V, Zig, C / C#"],
  ["Frontend", "React, Next.js, SvelteKit, Solid, Tailwind, WebGL, SwiftUI"],
  ["Systems", "GPUI, Ratatui, MV3 extensions, FFI, UniFFI, Servo, V8, WASM"],
  [
    "AI / Data",
    "OpenAI, MCP, RAG, local models, Hugging Face, Supabase, PostgreSQL",
  ],
  ["Infra", "Cloudflare, Docker, Kubernetes, GitHub Actions, CI/CD, SQLite"],
];

const education = [
  "Certificate III in Information Technology coursework, Box Hill Institute.",
  "VCE coursework at Eltham High School, including Information Technology, Applied Computing, Politics, Philosophy, Extended Investigation, Linguistics, and Indonesian; left before Year 12 completion to build full time.",
];

const languages = [
  "English native",
  "Cantonese native",
  "Russian conversational to fluent",
  "Mandarin conversational",
  "Indonesian beginner to intermediate",
];

const community = [
  "Volunteer English teacher for Russian speakers, 2022-present.",
  "Barbie CTF 2023, Petrozavodsk: 12th place in Russian exploit competition.",
  "PECAN CTF 2025: 15th nationally, 4th in division.",
];

const interests = [
  "Learning",
  "Travel",
  "Cooking",
  "Photography",
  "Phenomenology",
  "Existentialism",
  "Consciousness hacking",
  "Language learning",
  "Low-level systems",
  "Science-based lifting",
];

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
              {contact.map(([label, value]) => (
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
                {experience.map((job) => (
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
                  {projects.map(({ name, href, desc }) => (
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
                  {skillGroups.map(([label, value]) => (
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
                  {education.map((item) => (
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
                  {languages.map((item) => (
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
                  {community.map((item) => (
                    <ListItem key={item}>{item}</ListItem>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>Interests</SectionTitle>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {interests.map((item) => (
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
