"use client";

import { motion } from "motion/react";
import { GRADIENT, mono, sans, serif } from "@/components/brief/ui/constants";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: EASE, delay },
});

const stats = [
  { v: "9",  s: "yrs", l: "Shipping\nsince age 8" },
  { v: "40", s: "+",   l: "Open source\nrepos" },
  { v: "6",  s: "",    l: "Platforms:\nweb iOS macOS\nvisionOS Android TUI" },
  { v: "∞",  s: "",    l: "Unusual\nrequests" },
];

export function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        height: "100vh",
        scrollSnapAlign: "start",
        position: "relative",
        zIndex: 1,
        fontFamily: sans,
      }}
    >
      {/* Content wrapper — constrain width here, not on section */}
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
        overflow: "hidden",
      }}>
        {/* Overline */}
        <motion.div {...fadeUp(0.1)} style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          marginBottom: 28,
        }}>
          Max Carter · Builder · Melbourne / Sydney / Hong Kong
        </motion.div>

        {/* Headline line 1 */}
        <div style={{ overflow: "hidden", paddingBottom: "0.18em" }}>
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.05, ease: EASE, delay: 0.2 }}
            style={{
              fontFamily: serif,
              fontSize: "clamp(56px, 7.5vw, 100px)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            Building the
          </motion.div>
        </div>

        {/* Headline line 2 — gradient italic; paddingBottom accommodates descender */}
        <div style={{ overflow: "hidden", paddingBottom: "0.28em", marginBottom: 20 }}>
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.05, ease: EASE, delay: 0.32 }}
            style={{
              fontFamily: serif,
              fontSize: "clamp(56px, 7.5vw, 100px)",
              fontWeight: 400,
              lineHeight: 1.15,
              fontStyle: "italic",
              letterSpacing: "-0.03em",
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            unthought of.
          </motion.div>
        </div>

        {/* Subline + contacts */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40, maxWidth: 900 }}>
          <motion.p {...fadeUp(0.56)} style={{
            fontSize: 17,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.65,
            maxWidth: 460,
            margin: 0,
          }}>
            9 years shipping software that shouldn&apos;t exist yet — from operating systems to AI agents that run entire businesses.
          </motion.p>

          <motion.div {...fadeUp(0.7)} style={{ display: "flex", flexDirection: "column", gap: 3, textAlign: "right", flexShrink: 0 }}>
            {([
              [true,  "max@undivisible.dev",        "mailto:max@undivisible.dev"],
              [false, "+61 481 729 894",             "tel:+61481729894"],
              [false, "undivisible.dev",             "https://undivisible.dev"],
              [false, "github.com/undivisible",      "https://github.com/undivisible"],
            ] as [boolean, string, string][]).map(([hi, v, href]) => (
              <a key={v} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{
                fontFamily: mono,
                fontSize: 12,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                opacity: hi ? 0.75 : 0.3,
                lineHeight: 2,
                textDecoration: "none",
              }}>{v}</a>
            ))}
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          {...fadeUp(0.86)}
          style={{
            display: "flex",
            marginTop: 52,
            borderTop:    "1px solid rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            width: "fit-content",
          }}
        >
          {stats.map(({ v, s, l }, i) => (
            <div key={v + l} style={{
              padding: "18px 32px",
              borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>
              <div style={{
                fontFamily: serif,
                fontSize: 38,
                lineHeight: 1,
                marginBottom: 6,
                letterSpacing: "-0.03em",
                color: "#ffffff",
              }}>
                {v === "∞"
                  ? <span style={{ display: "inline-block", background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>∞</span>
                  : <>{v}<span style={{ display: "inline-block", background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontSize: 20 }}>{s}</span></>
                }
              </div>
              <div style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
                lineHeight: 1.5,
                whiteSpace: "pre-line",
              }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint — positioned absolutely relative to section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.7 }}
        style={{
          position: "absolute",
          bottom: 36,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
        }}
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{ width: 1, height: 22, background: "rgba(255,255,255,0.2)" }}
        />
        Scroll
      </motion.div>
    </section>
  );
}
