"use client";

import { motion } from "motion/react";
import { briefCases } from "@/data/brief-cases";
import {
  GRADIENT,
  mono,
  sans,
  serif,
  TILE_LINK_HOVER,
} from "@/components/brief/ui/constants";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function PortfolioCaseStudies() {
  return (
    <section
      id="outcomes"
      className="scroll-mt-24 snap-start snap-always py-16 sm:py-20 md:py-24"
    >
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-12 sm:mb-16"
        >
          <p
            className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/35"
            style={{ fontFamily: mono }}
          >
            Selected client outcomes
          </p>
          <h2
            className="max-w-4xl text-[clamp(2rem,5.5vw,3.75rem)] font-light leading-[1.05] tracking-[-0.035em] text-white"
            style={{ fontFamily: serif }}
          >
            Work that ships,{" "}
            <em
              className="not-italic"
              style={{
                background: GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              then compounds.
            </em>
          </h2>
        </motion.div>

        <div className="flex flex-col">
          {briefCases.map(({ n, tag, title, metric, body, badge, solid, badgeHref }, i) => (
            <motion.article
              key={n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.05 }}
              className={`grid gap-4 border-t border-white/[0.05] py-6 sm:grid-cols-[2.5rem_5.5rem_1fr] sm:items-start sm:gap-x-6 sm:py-7 ${
                i === 0 ? "border-t-white/[0.08]" : ""
              }`}
            >
              <span
                className="hidden font-serif text-xl text-white/[0.12] sm:block"
                style={{ fontFamily: serif }}
              >
                {n}
              </span>
              <div
                className="font-serif text-3xl font-light italic leading-none tracking-[-0.04em] sm:text-4xl"
                style={{
                  fontFamily: serif,
                  background: GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {metric}
              </div>
              <div className="min-w-0">
                <p
                  className="mb-2 text-[10px] uppercase tracking-[0.12em] text-white/35 sm:text-[11px]"
                  style={{ fontFamily: mono }}
                >
                  {tag}
                </p>
                <h3
                  className="mb-3 text-lg font-normal leading-snug tracking-[-0.02em] text-white sm:text-xl md:text-2xl"
                  style={{ fontFamily: serif }}
                >
                  {title}
                </h3>
                <p
                  className="max-w-2xl text-sm leading-relaxed text-white/45 sm:text-[15px]"
                  style={{ fontFamily: sans }}
                >
                  {body}
                </p>
                {badgeHref ? (
                  <a
                    href={badgeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-4 inline-block rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] no-underline sm:mt-5 ${
                      solid
                        ? `bg-white/[0.92] font-semibold text-black ${TILE_LINK_HOVER} hover:bg-white`
                        : `border border-white/[0.12] bg-white/[0.03] text-white/55 ${TILE_LINK_HOVER} hover:-translate-y-px hover:border-white/[0.26] hover:bg-white/[0.09] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25`
                    }`}
                    style={{ fontFamily: mono }}
                  >
                    {badge}
                  </a>
                ) : (
                  <span
                    className={`mt-4 inline-block cursor-default rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] sm:mt-5 ${
                      solid
                        ? "bg-white/[0.92] font-semibold text-black transition-[filter] duration-200 ease-out hover:brightness-105"
                        : `border border-white/[0.12] bg-white/[0.04] text-white/50 ${TILE_LINK_HOVER} hover:bg-white/[0.11] hover:text-white/65`
                    }`}
                    style={{ fontFamily: mono }}
                  >
                    {badge}
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
