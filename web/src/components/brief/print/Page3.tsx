import { C, mono, sans, serif } from "@/components/brief/ui/constants";
import { Tb } from "@/components/brief/ui/Tb";
import { Ft } from "@/components/brief/ui/Ft";
import { briefOpenSourceCards } from "@/lib/brief-open-source";

export function Page3() {
  const projs = briefOpenSourceCards().map((project) => {
    if (project.name === "Space + rv8") {
      return {
        org: "Maincode",
        name: "Mainrun",
        tech: "C++ · Machine Learning Systems · Apple Silicon",
        desc: "Participated in Maincode's machine learning assessment with no prior LLM training experience. Built a complete GPT-style training pipeline from scratch in C++: transformer architecture, tokenizer integration, data pipeline, optimizers, schedulers, checkpointing, and training loop. Reached ~1,900 tokens/s inference, ~300 ms training steps, final validation loss 0.974555, and best result in the assessment. Also submitted upstream tooling/script fixes.",
        tag: "ML Systems",
        accent: project.accent,
        dark: project.dark,
      };
    }
    if (project.name === "unthinkclaw + unthinkmail") {
      return {
        org: "Oppo / OnePlus",
        name: "Firmware Reverse Engineering",
        tech: "Embedded Systems · Firmware · Reverse Engineering",
        desc: "Recovered a soft-bricked Oppo/OnePlus device without official docs. Reverse engineered vendor flashing validation, bypassed model/package checks safely, rebuilt a compatible firmware package from multiple releases, traced boot loops to the OCDT calibration partition, restored the original backup, and recovered boot, IMEI, and modem functionality.",
        tag: "Firmware RE",
        accent: project.accent,
        dark: project.dark,
      };
    }
    return project;
  });

  const otherCategories = [
    {
      label: "macOS / Desktop Apps",
      items:
        "rs_peekaboo (screen capture crate), rs_imessage, rs_facetime, drift (live wallpaper), tile (tiling WM), tabyrus (AI autocomplete), unelaborate (Minecraft client), vro (text editor)",
    },
    {
      label: "Browser Extensions",
      items:
        "rs_vimium (Rust rewrite), anywhere (AI chat → interactive widgets)",
    },
    {
      label: "Developer Tools",
      items:
        "incisor (Etcher rewrite in Rust), rs_opencode (desktop), bluetooth-terminal, rover (Raycast-like)",
    },
    {
      label: "Web Apps & Experiments",
      items:
        "standpoint (tierlists), notes, bublik (soundscape gen), alphabets, infrastruct (AI search), soliloquy (web OS model), rv8 (browser engine)",
    },
    {
      label: "Libraries & Protocols",
      items:
        "rs_ai (cross-platform AI SDK), stalwart-lite (embeddable mail server), crosspost-rs, svelte-streamdown, ark-protocol, monoprotocol (sync protocol)",
    },
    {
      label: "AI Agent Tooling",
      items:
        "unthinkclaw (local-first Rust agent runtime), unthinkmail (IMAP via MCP), folk-around, poke-around (P2P computer interaction)",
    },
  ];

  const langs = [
    { name: "English", pct: 100, level: "Native" },
    { name: "Cantonese", pct: 100, level: "Native" },
    { name: "Russian", pct: 80, level: "Conv → Fluent" },
    { name: "Mandarin", pct: 55, level: "Conversational" },
    { name: "Indonesian", pct: 35, level: "Beg → Inter." },
  ];

  const achs = [
    {
      strong: "Top 10% nationally",
      rest: " in cybersecurity CTF competitions.",
    },
    {
      strong: "Barbie CTF 2023",
      rest: " (Petrozavodsk) — 12th place, Russian exploit competition.",
    },
    {
      strong: "PECAN CTF 2025",
      rest: " — 15th nationally, 4th in division (ASD-supported).",
    },
    {
      strong: "Volunteer English teacher",
      rest: " to Russian speakers, 2022–present.",
    },
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
      <Tb
        left="Open Source"
        right="github.com/undivisible & github.com/semitechnological"
      />

      <div
        style={{
          padding: "12px 26px 10px",
          borderBottom: `1px solid ${C.rule}`,
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
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
            In progress — 40+ repos
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 23,
              color: C.black,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Building sharp tools.
            <br />
            <em style={{ color: "#ff5705" }}>Real work ships.</em>
          </div>
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 7.5,
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
            color: C.mid,
            textAlign: "right",
            lineHeight: 1.9,
            whiteSpace: "nowrap",
          }}
        >
          undivisible
          <br />
          semitechnological
          <br />
          Graft AI
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "9px 26px 7px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          gap: 7,
        }}
      >
        {/* Featured projects grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: 1,
            background: C.rule,
            border: `1px solid ${C.rule}`,
            overflow: "hidden",
          }}
        >
          {projs.map(({ org, name, tech, desc, tag, accent, dark }) => (
            <div
              key={name}
              style={{
                background: dark ? C.black : C.cream,
                padding: "9px 13px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 7,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: dark
                    ? "rgba(255,248,230,0.28)"
                    : "rgba(78,78,78,0.55)",
                  marginBottom: 2,
                }}
              >
                {org}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: dark ? C.cream : C.black,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  marginBottom: 2,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 7,
                  letterSpacing: "-0.05em",
                  color: C.orange,
                  marginBottom: 4,
                  lineHeight: 1.4,
                }}
              >
                {tech}
              </div>
              <div
                style={{
                  fontSize: 8.5,
                  color: dark ? "rgba(255,248,230,0.45)" : C.mid,
                  lineHeight: 1.55,
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                {desc}
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 5,
                  padding: "2px 7px",
                  fontFamily: mono,
                  fontSize: 7,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  alignSelf: "flex-start",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  ...(accent
                    ? { border: `1px solid ${C.orange}`, color: C.orange }
                    : {
                        border: `1px solid ${dark ? "rgba(255,248,230,0.12)" : C.rule}`,
                        color: dark ? "rgba(255,248,230,0.3)" : C.mid,
                      }),
                }}
              >
                {tag}
              </div>
            </div>
          ))}
        </div>

        {/* Other projects summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            background: C.rule,
            border: `1px solid ${C.rule}`,
            flexShrink: 0,
          }}
        >
          {otherCategories.map(({ label, items }) => (
            <div
              key={label}
              style={{
                background: C.cream,
                padding: "7px 10px",
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 7,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: C.orange,
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 7.5,
                  color: C.mid,
                  lineHeight: 1.5,
                }}
              >
                {items}
              </div>
            </div>
          ))}
        </div>

        {/* Languages + Achievements */}
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
          <div style={{ background: C.bgAlt, padding: "9px 13px" }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 7.5,
                letterSpacing: "-0.05em",
                textTransform: "uppercase",
                color: C.orange,
                marginBottom: 6,
              }}
            >
              Languages
            </div>
            {langs.map(({ name, pct, level }) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: C.black,
                    width: 72,
                    flexShrink: 0,
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 5,
                    background: "rgba(226,217,196,0.6)",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: C.orange,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 7.5,
                    letterSpacing: "-0.05em",
                    color: C.mid,
                    width: 72,
                    flexShrink: 0,
                    textAlign: "right",
                  }}
                >
                  {level}
                </div>
              </div>
            ))}
            <div style={{ height: 1, background: C.rule, margin: "4px 0" }} />
            <div style={{ fontSize: 8.5, color: C.mid, lineHeight: 1.6 }}>
              Currently learning:{" "}
              <strong style={{ color: C.black }}>Japanese</strong>
            </div>
          </div>
          <div style={{ background: C.bgAlt, padding: "9px 13px" }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 7.5,
                letterSpacing: "-0.05em",
                textTransform: "uppercase",
                color: C.orange,
                marginBottom: 6,
              }}
            >
              Achievements
            </div>
            {achs.map(({ strong, rest }) => (
              <div
                key={strong}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    background: C.orange,
                    marginTop: 4,
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 9, color: C.mid, lineHeight: 1.55 }}>
                  <strong style={{ color: C.black }}>{strong}</strong>
                  {rest}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Ft
        left="Max Carter — Open Source · Page 03 of 03"
        right="undivisible.dev"
      />
    </div>
  );
}
