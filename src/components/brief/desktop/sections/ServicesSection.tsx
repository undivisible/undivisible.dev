"use client";

import { motion } from "motion/react";
import { GRADIENT, mono, sans, serif } from "@/components/brief/ui/constants";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const svcs = [
  { n: "01", title: "Micro-Startup Studio",  body: "Napkin sketch to live product in weeks. Full stack, designed to scale, built to feel inevitable." },
  { n: "02", title: "AI Automation",          body: "Audit → eliminate. AI agents handling phone reception, quote pipelines, client comms, intake." },
  { n: "03", title: "Bespoke Web & Apps",     body: "WebGL, spatial interfaces, bleeding-edge eCommerce. Sites people stop to ask who built them." },
  { n: "04", title: "Complex & Unusual",      body: "OS kernels. Compilers. Browser runtimes. Cybersecurity tooling. If it runs on a machine, I can build it." },
];

export function ServicesSection() {
  return (
    <section
      id="services"
      style={{
        height: "100vh",
        scrollSnapAlign: "start",
        display: "grid",
        gridTemplateColumns: "38% 62%",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        fontFamily: sans,
        background: "transparent",
      }}
    >
      {/* LEFT — glass panel */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 48px 64px 80px",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
          What I do
        </div>
        <div style={{
          fontFamily: serif,
          fontSize: "clamp(32px, 3.2vw, 50px)",
          color: "#ffffff",
          letterSpacing: "-0.03em",
          lineHeight: 1.08,
          marginBottom: 28,
        }}>
          Your next<br />project deserves<br />someone who&apos;s<br />already built<br />
          <em style={{
            background: GRADIENT, display: "inline-block",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>the impossible.</em>
        </div>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 300, fontStyle: "italic" }}>
          Contract work across time zones. I charge for outcomes, not hours.
        </p>
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 6 }}>
          {["max@undivisible.dev", "undivisible.dev"].map(v => (
            <div key={v} style={{ fontFamily: mono, fontSize: 11, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.45)" }}>{v}</div>
          ))}
        </div>
      </motion.div>

      {/* RIGHT — service rows */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 72px 0 56px",
      }}>
        {svcs.map(({ n, title, body }, i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: EASE, delay: i * 0.1 }}
            style={{
              padding: "26px 0",
              borderBottom: i < svcs.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: "0 22px",
              alignItems: "start",
            }}
          >
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.22)", paddingTop: 4 }}>{n}</div>
            <div>
              <div style={{ fontFamily: serif, fontSize: "clamp(20px, 1.8vw, 28px)", color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.1 }}>{title}</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{body}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
