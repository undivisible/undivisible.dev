"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { lifeTimeline } from "@/data/life-timeline";
import { contactHref } from "@/data/resume-document";
import type { ResumeDocument } from "@/lib/parse-resume-markdown";
import { RandomizedText } from "@/components/randomized-text";
import { REVEAL_EASE, introText, transport, transportColors } from "@/components/info/constants";

export function InfoBioSection({
  resumeDocLive,
  getTransportStyle,
}: {
  resumeDocLive: ResumeDocument;
  getTransportStyle: HongKongDayTheme["getTransportStyle"];
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const transportPill = (item: string) => {
    const base = transportColors[item] ?? "#16221B";
    const w = isMobile ? "84px" : "70px";
    return (
      <div
        key={item}
        suppressHydrationWarning
        className="cursor-default transition-[filter] duration-200 ease-out hover:brightness-110"
        style={{
          width: w,
          flexShrink: 0,
          paddingLeft: "6px",
          paddingRight: "6px",
          paddingTop: "6px",
          paddingBottom: "6px",
          overflow: "hidden",
          borderRadius: "30px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "4px",
          display: "inline-flex",
          ...getTransportStyle(base),
        }}
      >
        <div
          className={`flex flex-col justify-center font-sans font-normal ${isMobile ? "text-[10px]" : "text-[11px]"} ${item === "indonesian" || item === "japanese" ? "text-center" : "text-left"}`}
          style={{ color: "var(--transport-text)" }}
        >
          {item}
        </div>
      </div>
    );
  };

  return (
    <section
      id="world"
      className="scroll-mt-24 snap-start snap-always py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 lg:max-w-none lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: REVEAL_EASE }}
          className="mb-12"
        >
          <h2 className="font-serif text-[clamp(1.75rem,5vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.03em]">
            world
          </h2>
        </motion.div>

        <div className="space-y-16 sm:space-y-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: REVEAL_EASE }}
          >
            <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
              story
            </h3>
            <RandomizedText
              split="words"
              className="text-sm leading-relaxed sm:text-base"
            >
              {introText}
            </RandomizedText>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: REVEAL_EASE }}
          >
            <h3 className="mb-5 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
              early timeline
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {lifeTimeline.map((item) => (
                <div
                  key={`${item.age}-${item.title}`}
                  className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-white/[0.07] pt-4"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                    age {item.age}
                  </div>
                  <div>
                    <div className="text-sm font-medium leading-snug text-white/80">
                      {item.title}
                    </div>
                    <p
                      className="mt-1 text-xs leading-relaxed"
                      style={{ color: "var(--page-text-muted)" }}
                    >
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: REVEAL_EASE }}
              className="mb-6"
            >
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                experience
              </h3>
            </motion.div>
            <div className="space-y-10">
              {resumeDocLive.experience.map((job, i) => (
                <motion.div
                  key={`${job.org}-${job.role}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.55,
                    ease: REVEAL_EASE,
                    delay: i * 0.05,
                  }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-2">
                    <div className="text-base font-medium sm:text-lg">
                      {job.role} · {job.org}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.14em] text-white/35 font-mono">
                      {job.time}
                    </div>
                  </div>
                  <ul
                    className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed"
                    style={{ color: "var(--page-text-muted)" }}
                  >
                    {job.bullets.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: REVEAL_EASE }}
            className="grid gap-12 lg:grid-cols-2 lg:gap-16"
          >
            <div>
              <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                education
              </h3>
              <ul
                className="space-y-3 text-sm leading-relaxed"
                style={{ color: "var(--page-text-muted)" }}
              >
                {resumeDocLive.education.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
                community
              </h3>
              <ul
                className="list-disc space-y-2 pl-5 text-sm leading-relaxed"
                style={{ color: "var(--page-text-muted)" }}
              >
                {resumeDocLive.community.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: REVEAL_EASE }}
          >
            <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
              interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {resumeDocLive.interests.map((item) => (
                <span
                  key={item}
                  className="cursor-default rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/55 transition-colors duration-200 ease-out hover:bg-white/[0.1] hover:text-white/75"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: REVEAL_EASE }}
          >
            <h3 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
              capabilities
            </h3>
            <div className="space-y-5">
              {resumeDocLive.skills.map(([label, value]) => (
                <div key={label}>
                  <div className="text-[9px] uppercase tracking-[0.14em] text-white/30 font-mono">
                    {label}
                  </div>
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: "var(--page-text-muted)" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <div className="mb-3 text-[9px] uppercase tracking-[0.14em] text-white/30 font-mono">
                day-to-day languages
              </div>
              <div className="flex flex-wrap gap-2">
                {transport.map((item) => transportPill(item))}
              </div>
            </div>
          </motion.div>

          <motion.div
            id="contact"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: REVEAL_EASE }}
            className="scroll-mt-20 snap-start snap-always rounded-2xl border border-white/[0.06] bg-white/[0.04] p-6 backdrop-blur-md sm:p-8"
          >
            <h3 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
              contact
            </h3>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              {resumeDocLive.contact
                .filter(([label]) => label !== "LinkedIn")
                .map(([label, value]) => {
                  const href = contactHref(label, value);
                  return (
                    <div key={label} className="flex flex-col gap-0.5">
                      <dt className="text-[9px] uppercase tracking-[0.12em] text-white/30 font-mono">
                        {label}
                      </dt>
                      <dd>
                        {href ? (
                          <a
                            href={href}
                            className="text-white/85 underline-offset-4 hover:underline"
                            target={
                              href.startsWith("http") ? "_blank" : undefined
                            }
                            rel={
                              href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                          >
                            {value}
                          </a>
                        ) : (
                          <span style={{ color: "var(--page-text-muted)" }}>
                            {value}
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}