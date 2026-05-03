import { C, GRADIENT, mono, sans, serif } from "@/components/brief/ui/constants";
import { Tb } from "@/components/brief/ui/Tb";
import { Ft } from "@/components/brief/ui/Ft";

export function Page3() {
  const projs = [
    { org: "semitechnological", name: "Crepuscularity + Aurorality", tech: "Rust · Swift · GPUI · Ratatui · MV3 · SwiftUI · UniFFI", desc: "First GPUI component system with hot reload and first plug-and-play browser extension framework in Rust. One .crepus template ships to desktop (GPUI), TUI (Ratatui), browser extensions (MV3), HTML, and mobile. Aurorality compiles those templates into native SwiftUI — Swift, Rust, or JS as backend.", tag: "Framework", accent: true, dark: true },
    { org: "semitechnological", name: "Wax", tech: "Rust · Tokio · Async · Nix · Scoop", desc: "System package manager in Rust with parity to Homebrew, Scoop, and Nix — handles system packages, casks, lockfile pinning, and custom taps. Replaces git tap syncing with direct JSON API access and parallel async: 16–20× faster search, 4× faster installs. Works standalone or alongside existing managers.", tag: "Package Manager", accent: false, dark: false },
    { org: "semitechnological", name: "Equilibrium + eqswift", tech: "Rust · Bindgen · UniFFI · C / C# · Zig · Nim · V · Odin", desc: "Load foreign code with one call. Auto-detects source, compiles to C IR, loads into a Rust module handle — C, C++, C#, D, V, Zig, Nim, Odin, Hare. The eq CLI builds polyglot projects in parallel. eqswift extends this to zero-config Rust-to-Swift FFI via UniFFI — no UDL files required.", tag: "Interop / FFI", accent: false, dark: false },
    { org: "atechnology company", name: "Soliloquy + rv8", tech: "Rust · V · C · Servo · V8 · Alpine · Svelte · Axum", desc: "Experimental OS built on Alpine with kernel-level modifications — Rust shell, Servo rendering, V8 runtime. rv8 handles IPC, rendering, parsing, and JS execution with a live snapshot bridge syncing a narrow DOM surface. Kernel modifications for process scheduling and memory. Goal: 30× faster than Chrome at 1/25 the RAM.", tag: "OS / Runtime", accent: true, dark: true },
    { org: "undivisible", name: "Atmosphere", tech: "Swift · Rust · iOS · macOS · Windows · Android · Node", desc: "Cross-device sync for Apple, Windows, Android, and browsers. Universal clipboard, continuity, file sharing, share extensions, keyboard extensions, and a P2P Node CLI. Hybrid local + web tunneling for ultra-fast networking across every device you own.", tag: "Ecosystem", accent: true, dark: true },
    { org: "undivisible", name: "unthinkclaw + unthinkmail", tech: "Rust · SurrealDB · RocksDB · MCP · IMAP · Cloudflare Workers", desc: "unthinkclaw: local-first Rust agent runtime — 1/100 the size of OpenClaw, runs entirely on your device with agent swarms for parallel speed. Supports Telegram, Discord, Slack, WhatsApp, Matrix, Signal, IRC, and more. unthinkmail adds native IMAP via MCP — no storage, no master key.", tag: "AI Agent Runtime", accent: false, dark: false },
  ];

  const langs = [
    { name: "English", pct: 100, level: "Native" },
    { name: "Cantonese", pct: 100, level: "Native" },
    { name: "Russian", pct: 80, level: "Conv → Fluent" },
    { name: "Mandarin", pct: 55, level: "Conversational" },
    { name: "Indonesian", pct: 35, level: "Beg → Inter." },
  ];

  const achs = [
    { strong: "Top 10% nationally", rest: " in cybersecurity CTF competitions." },
    { strong: "Barbie CTF 2023", rest: " (Petrozavodsk) — 12th place, Russian exploit competition." },
    { strong: "PECAN CTF 2025", rest: " — 15th nationally, 4th in division (ASD-supported)." },
    { strong: "Volunteer English teacher", rest: " to Russian speakers, 2022–present." },
  ];

  return (
    <div style={{ width: "210mm", height: "297mm", background: C.cream, display: "flex", flexDirection: "column", fontFamily: sans, fontSize: 11, color: C.black, lineHeight: 1.5, overflow: "hidden" }}>
      <Tb left="Open Source" right="github.com/undivisible & github.com/semitechnological" />

      <div style={{ padding: "12px 26px 10px", borderBottom: `1px solid ${C.rule}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.orange, marginBottom: 4 }}>In progress — 40+ repos</div>
          <div style={{ fontFamily: serif, fontSize: 23, color: C.black, letterSpacing: "-0.02em", lineHeight: 1 }}>Always building.<br /><em style={{ color: "#ff5705" }}>Everything ships.</em></div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 7.5, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.mid, textAlign: "right", lineHeight: 1.9, whiteSpace: "nowrap" }}>undivisible<br />semitechnological<br />atechnology company</div>
      </div>

      <div style={{ flex: 1, padding: "9px 26px 7px", display: "flex", flexDirection: "column", overflow: "hidden", gap: 7 }}>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(3, 1fr)", gap: 1, background: C.rule, border: `1px solid ${C.rule}`, overflow: "hidden" }}>
          {projs.map(({ org, name, tech, desc, tag, accent, dark }) => (
            <div key={name} style={{ background: dark ? C.black : C.cream, padding: "9px 13px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: mono, fontSize: 7, letterSpacing: "-0.05em", textTransform: "uppercase", color: dark ? "rgba(255,248,230,0.28)" : "rgba(78,78,78,0.55)", marginBottom: 2 }}>{org}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: dark ? C.cream : C.black, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 2 }}>{name}</div>
              <div style={{ fontFamily: mono, fontSize: 7, letterSpacing: "-0.05em", color: C.orange, marginBottom: 4, lineHeight: 1.4 }}>{tech}</div>
              <div style={{ fontSize: 8.5, color: dark ? "rgba(255,248,230,0.45)" : C.mid, lineHeight: 1.55, flex: 1, overflow: "hidden" }}>{desc}</div>
              <div style={{
                display: "inline-block", marginTop: 5, padding: "2px 7px",
                fontFamily: mono, fontSize: 7, letterSpacing: "-0.05em", textTransform: "uppercase",
                alignSelf: "flex-start", flexShrink: 0, whiteSpace: "nowrap",
                ...(accent
                  ? { border: `1px solid ${C.orange}`, color: C.orange }
                  : { border: `1px solid ${dark ? "rgba(255,248,230,0.12)" : C.rule}`, color: dark ? "rgba(255,248,230,0.3)" : C.mid }
                )
              }}>{tag}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.rule, border: `1px solid ${C.rule}`, flexShrink: 0 }}>
          <div style={{ background: C.bgAlt, padding: "9px 13px" }}>
            <div style={{ fontFamily: mono, fontSize: 7.5, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.orange, marginBottom: 6 }}>Languages</div>
            {langs.map(({ name, pct, level }) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.black, width: 72, flexShrink: 0 }}>{name}</div>
                <div style={{ flex: 1, height: 5, background: "rgba(226,217,196,0.6)" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: C.orange }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 7.5, letterSpacing: "-0.05em", color: C.mid, width: 72, flexShrink: 0, textAlign: "right" }}>{level}</div>
              </div>
            ))}
            <div style={{ height: 1, background: C.rule, margin: "4px 0" }} />
            <div style={{ fontSize: 8.5, color: C.mid, lineHeight: 1.6 }}>
              Currently learning: <strong style={{ color: C.black }}>Japanese</strong> · <strong style={{ color: C.black }}>German</strong> · <strong style={{ color: C.black }}>Chechen</strong>
            </div>
          </div>
          <div style={{ background: C.bgAlt, padding: "9px 13px" }}>
            <div style={{ fontFamily: mono, fontSize: 7.5, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.orange, marginBottom: 6 }}>Achievements</div>
            {achs.map(({ strong, rest }) => (
              <div key={strong} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5 }}>
                <div style={{ width: 5, height: 5, background: C.orange, marginTop: 4, flexShrink: 0 }} />
                <div style={{ fontSize: 9, color: C.mid, lineHeight: 1.55 }}>
                  <strong style={{ color: C.black }}>{strong}</strong>{rest}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Ft left="Max Carter — Open Source · Page 03 of 03" right="undivisible.dev" />
    </div>
  );
}
