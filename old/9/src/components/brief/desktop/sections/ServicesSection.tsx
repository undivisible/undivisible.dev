import { motion } from "motion/react";
import { GRADIENT, mono, sans, serif } from "@/components/brief/ui/constants";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const svcs = [
  {
    n: "01",
    title: "Micro-Startup Studio",
    body: "Napkin sketch to live product in weeks. Full stack, designed, deployed, and shaped around a clear commercial outcome.",
  },
  {
    n: "02",
    title: "AI Automation",
    body: "Audit → build. AI agents and integrations for phone reception, quote pipelines, client comms, intake, reporting, and admin.",
  },
  {
    n: "03",
    title: "Bespoke Web & Apps",
    body: "WebGL, spatial interfaces, eCommerce, dashboards, and native-feeling apps. Built around the business, not a template.",
  },
  {
    n: "04",
    title: "Complex & Unusual",
    body: "OS kernels, compilers, browser runtimes, AI agents, CRMs, and cybersecurity tooling. Product, design, and infrastructure together.",
  },
];

export function ServicesSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section
      id="services"
      className={
        embedded
          ? "snap-start snap-always scroll-mt-24 overflow-hidden rounded-2xl border border-white/[0.06]"
          : undefined
      }
      style={{
        height: embedded ? "auto" : "100vh",
        scrollSnapAlign: "start",
        display: embedded ? "flex" : "grid",
        flexDirection: embedded ? "column" : undefined,
        gridTemplateColumns: embedded ? undefined : "38% 62%",
        position: "relative",
        zIndex: 1,
        overflow: embedded ? "visible" : "hidden",
        fontFamily: sans,
        background: "transparent",
        ...(embedded ? { scrollMarginTop: "6.5rem" } : {}),
      }}
    >
      {/* LEFT — glass panel */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{
          background: embedded ? "transparent" : "rgba(255,255,255,0.02)",
          display: "flex",
          flexDirection: "column",
          justifyContent: embedded ? "flex-start" : "center",
          padding: embedded ? "40px 28px 28px" : "64px 48px 64px 80px",
          borderRight: embedded ? "none" : "1px solid rgba(255,255,255,0.1)",
          borderBottom: embedded ? "none" : "none",
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 12,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.38)",
            marginBottom: 20,
          }}
        >
          What I do
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: "clamp(36px, 3.7vw, 60px)",
            color: "var(--page-text, #fff)",
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            marginBottom: 28,
          }}
        >
          Your next
          <br />
          project needs
          <br />
          someone who can
          <br />
          ship the
          <br />
          <em
            style={{
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            unusual.
          </em>
        </div>
        <p
          style={{
            fontSize: 16,
            color: "var(--page-text-muted, rgba(255,255,255,0.55))",
            lineHeight: 1.7,
            maxWidth: 300,
            fontStyle: "italic",
          }}
        >
          Contract work across time zones. I charge for outcomes, not hours.
        </p>
      </motion.div>

      {/* RIGHT — service rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: embedded ? "flex-start" : "center",
          padding: embedded ? "0 28px 40px" : "0 72px 0 56px",
        }}
      >
        {svcs.map(({ n, title, body }, i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: EASE, delay: i * 0.1 }}
            style={{
              padding: "26px 0",
              borderBottom:
                i < svcs.length - 1
                  ? embedded
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "1px solid rgba(255,255,255,0.08)"
                  : "none",
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: "0 22px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 12,
                letterSpacing: "-0.03em",
                color: embedded
                  ? "rgba(255,255,255,0.28)"
                  : "rgba(255,255,255,0.22)",
                paddingTop: 4,
              }}
            >
              {n}
            </div>
            <div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(22px, 2vw, 32px)",
                  color: "var(--page-text, #fff)",
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                  lineHeight: 1.1,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "var(--page-text-muted, rgba(255,255,255,0.55))",
                  lineHeight: 1.7,
                }}
              >
                {body}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
