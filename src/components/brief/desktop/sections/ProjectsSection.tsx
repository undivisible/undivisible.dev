"use client";

import { motion } from "motion/react";
import { GRADIENT, mono, sans, serif } from "@/components/brief/ui/constants";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const projs = [
  {
    org: "semitechnological",
    name: "Crepuscularity + Aurorality",
    tech: ["Rust", "Swift", "GPUI", "SwiftUI", "UniFFI"],
    desc: "First GPUI component system with hot reload. One template ships to desktop, TUI, browser extensions, HTML, and mobile. Aurorality compiles to native SwiftUI.",
    tag: "Framework",
    accent: true,
    href: "https://github.com/semitechnological",
  },
  {
    org: "semitechnological",
    name: "Wax",
    tech: ["Rust", "Tokio", "Async"],
    desc: "System package manager in Rust — parity with Homebrew, Scoop, and Nix. Handles system packages, casks, lockfile pinning, custom taps. 16–20× faster search, 4× faster installs.",
    tag: "Package Manager",
    accent: false,
    href: "https://github.com/semitechnological",
  },
  {
    org: "semitechnological",
    name: "Equilibrium + eqswift",
    tech: ["Rust", "Bindgen", "UniFFI", "Zig", "Nim"],
    desc: "Load foreign code with one call — C, C++, C#, Zig, Nim, Odin. Zero-config Rust-to-Swift FFI, no UDL files required.",
    tag: "Interop / FFI",
    accent: true,
    href: "https://github.com/semitechnological",
  },
  {
    org: "atechnology company",
    name: "Soliloquy + rv8",
    tech: ["Rust", "Servo", "V8", "Alpine"],
    desc: "Experimental OS on Alpine with kernel-level modifications — Rust shell, Servo rendering, V8 runtime. Custom process scheduling and memory. Goal: 30× faster than Chrome at 1/25 the RAM.",
    tag: "OS / Runtime",
    accent: false,
    href: "https://github.com/semitechnological",
  },
  {
    org: "undivisible",
    name: "Atmosphere",
    tech: ["Swift", "Rust", "iOS", "Windows", "Android"],
    desc: "Cross-device sync for Apple, Windows, Android, and browsers. Universal clipboard, continuity, file sharing, share extensions, keyboard extensions, P2P tunneling.",
    tag: "Ecosystem",
    accent: true,
    href: "https://github.com/undivisible",
  },
  {
    org: "undivisible",
    name: "unthinkclaw + unthinkmail",
    tech: ["Rust", "SurrealDB", "MCP", "IMAP"],
    desc: "Local-first Rust agent runtime — 1/100 the size of OpenClaw, runs on your device with agent swarms for speed. Telegram, Discord, Slack, WhatsApp, Matrix, Signal, IRC. unthinkmail adds native IMAP via MCP.",
    tag: "AI Agent Runtime",
    accent: false,
    href: "https://github.com/undivisible",
  },
];

export function ProjectsSection() {
  return (
    <section
      id="projects"
      style={{
        height: "100vh",
        scrollSnapAlign: "start",
        display: "flex",
        flexDirection: "column",
        padding: "52px 80px 44px",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        fontFamily: sans,
        background: "transparent",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}
      >
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
            40+ repos · in progress
          </div>
          <div style={{ fontFamily: serif, fontSize: "clamp(28px, 3.2vw, 46px)", color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Always building.{" "}
            <em style={{
              background: GRADIENT, display: "inline-block",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Everything ships.</em>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, fontFamily: mono, fontSize: 8.5, letterSpacing: "-0.03em", textTransform: "uppercase" }}>
          {[
            ["github.com/undivisible",      "https://github.com/undivisible"],
            ["github.com/semitechnological", "https://github.com/semitechnological"],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", opacity: 0.25, textDecoration: "none" }}>{label}</a>
          ))}
        </div>
      </motion.div>

      {/* Bento grid */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: 1,
        background: "rgba(255,255,255,0.1)",
        minHeight: 0,
      }}>
        {projs.map((p, i) => (
          <motion.a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            custom={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}
            style={{
              background: p.accent
                ? "linear-gradient(135deg, rgba(160,224,171,0.12) 0%, rgba(255,172,46,0.08) 50%, rgba(165,45,37,0.1) 100%)"
                : "rgba(8,8,8,0.85)",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              overflow: "hidden",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <div style={{
              fontFamily: mono,
              fontSize: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
            }}>{p.org}</div>

            <div style={{
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: "#ffffff",
              fontFamily: serif,
            }}>{p.name}</div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {p.tech.map(t => (
                <span key={t} style={{
                  fontFamily: mono,
                  fontSize: 8,
                  letterSpacing: "-0.02em",
                  padding: "2px 7px",
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.55)",
                  borderRadius: 3,
                }}>{t}</span>
              ))}
            </div>

            <div style={{
              fontSize: 13,
              lineHeight: 1.65,
              flex: 1,
              color: "rgba(255,255,255,0.4)",
              overflow: "hidden",
            }}>{p.desc}</div>

            <div style={{
              fontFamily: mono,
              fontSize: 8,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              padding: "3px 9px",
              alignSelf: "flex-start",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.4)",
              borderRadius: 75,
            }}>{p.tag}</div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
