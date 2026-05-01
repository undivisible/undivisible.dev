"use client";

import { motion, AnimatePresence } from "motion/react";
import { mono } from "@/components/brief/ui/constants";

const SECTIONS = [
  { id: "hero",     label: "Intro" },
  { id: "services", label: "Services" },
  { id: "cases",    label: "Results" },
  { id: "projects", label: "Open Source" },
];

export function NavDots({ active, onDotClick }: { active: number; onDotClick: (id: string) => void }) {
  return (
    <div style={{
      position: "fixed",
      right: 28,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 50,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      alignItems: "flex-end",
    }}>
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onDotClick(s.id)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8 }}
        >
          <AnimatePresence>
            {active === i && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div
            animate={{
              width:           active === i ? 22 : 5,
              height:          active === i ? 5 : 5,
              backgroundColor: active === i ? "#ffffff" : "rgba(255,255,255,0.2)",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ borderRadius: 3, flexShrink: 0 }}
          />
        </button>
      ))}
    </div>
  );
}
