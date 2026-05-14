"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  resolvePillars,
  type PillarKey,
  type PillarResolved,
} from "@/data/portfolio-featured";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { GRADIENT, mono, sans, serif } from "@/components/brief/ui/constants";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const featuredOrder: PillarKey[] = ["inauguration", "soliloquy"];
const supportingOrder: PillarKey[] = ["crepuscularity", "equilibrium"];

function byOrder(
  resolved: PillarResolved[],
  order: PillarKey[],
): PillarResolved[] {
  const map = new Map(resolved.map((p) => [p.key, p]));
  return order.map((k) => map.get(k)).filter((p): p is PillarResolved => !!p);
}

export function PortfolioPillars({ readme }: { readme: ReadmeBundle }) {
  const resolved = useMemo(() => resolvePillars(readme), [readme]);
  const featured = useMemo(() => byOrder(resolved, featuredOrder), [resolved]);
  const supporting = useMemo(
    () => byOrder(resolved, supportingOrder),
    [resolved],
  );

  return (
    <section
      id="pillars"
      className="scroll-mt-24 snap-start snap-always py-16 sm:py-20 md:py-24"
    >
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: EASE }}
          className="mb-12 sm:mb-16"
        >
          <p
            className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/40"
            style={{ fontFamily: mono }}
          >
            Flagship systems
          </p>
          <h2
            className="max-w-3xl text-[clamp(1.85rem,4.8vw,3.25rem)] font-light leading-[1.06] tracking-[-0.035em] text-white"
            style={{ fontFamily: serif }}
          >
            Deep work on{" "}
            <em
              className="not-italic"
              style={{
                background: GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              compilers & runtimes.
            </em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {featured.map((p, i) => (
            <motion.a
              key={p.key}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              className="group flex min-h-[18rem] flex-col rounded-2xl border border-white/[0.07] bg-white/[0.035] p-7 backdrop-blur-md transition-colors hover:border-white/[0.12] hover:bg-white/[0.055] sm:min-h-[20rem] sm:p-9 md:min-h-[22rem]"
            >
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-white/45"
                style={{ fontFamily: mono }}
              >
                {p.eyebrow}
              </span>
              <span
                className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/35"
                style={{ fontFamily: mono }}
              >
                {p.stat}
              </span>
              <h3
                className="mt-5 text-[clamp(1.65rem,3.8vw,2.75rem)] font-light leading-[1.05] tracking-[-0.03em] text-white"
                style={{ fontFamily: serif }}
              >
                {p.displayName}
              </h3>
              <p
                className="mt-2 text-sm leading-snug text-white/55 sm:text-base"
                style={{ fontFamily: serif }}
              >
                {p.tagline}
              </p>
              <p
                className="mt-5 flex-1 text-sm leading-relaxed text-white/42 sm:text-[15px]"
                style={{ fontFamily: sans }}
              >
                {p.narrative}
              </p>
              <span
                className="mt-6 text-[10px] uppercase tracking-[0.18em] text-white/40 transition group-hover:text-white/55"
                style={{ fontFamily: mono }}
              >
                repository →
              </span>
            </motion.a>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5">
          {supporting.map((p, i) => (
            <motion.a
              key={p.key}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.12 + i * 0.06 }}
              className="group flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-sm transition-colors hover:border-white/[0.1] hover:bg-white/[0.045] sm:p-7"
            >
              <span
                className="text-[9px] uppercase tracking-[0.2em] text-white/38"
                style={{ fontFamily: mono }}
              >
                {p.eyebrow}
              </span>
              <h3
                className="mt-3 text-xl font-light tracking-[-0.02em] text-white sm:text-2xl"
                style={{ fontFamily: serif }}
              >
                {p.displayName}
              </h3>
              <p
                className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/40"
                style={{ fontFamily: sans }}
              >
                {p.narrative}
              </p>
              <span
                className="mt-4 text-[9px] uppercase tracking-[0.16em] text-white/35 group-hover:text-white/50"
                style={{ fontFamily: mono }}
              >
                open →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
