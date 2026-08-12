"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { pillarKeys } from "@/data/portfolio-featured";
import { TILE_LINK_HOVER } from "@/components/brief/ui/constants";
import { REVEAL_EASE } from "@/components/info/constants";
import {
  groupTidbitsByCategory,
  readmeMiniappTidbits,
} from "@/components/info/miniapp-tidbits";
import { TidbitCategory, UtilitiesBlock } from "@/components/info/work-blocks";
import { PortfolioPillars } from "@/components/site/PortfolioPillars";

export function InfoWorkSection({ readme }: { readme: ReadmeBundle }) {
  const tidbits = useMemo(() => readmeMiniappTidbits(readme), [readme]);
  const groupedTidbits = useMemo(
    () => groupTidbitsByCategory(tidbits),
    [tidbits],
  );
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(["web apps"]),
  );
  const toggleCategory = useCallback((cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  return (
    <section
      id="work"
      className="scroll-mt-24 snap-start snap-normal py-16 sm:py-20"
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
            work
          </h2>
        </motion.div>
        <PortfolioPillars readme={readme} />
        <UtilitiesBlock readme={readme} excludeKeys={pillarKeys} />
        <div className="mt-16 sm:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: REVEAL_EASE }}
            className="mb-2"
          >
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">
              miniapps & experiments
            </h3>
          </motion.div>
          {groupedTidbits.length === 1 && groupedTidbits[0]![0] === "other" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tidbits.map((tidbit, i) => (
                <motion.a
                  key={tidbit.key}
                  href={tidbit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.55,
                    ease: REVEAL_EASE,
                    delay: i * 0.05,
                  }}
                  className={`h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm ${TILE_LINK_HOVER} hover:border-white/[0.1] hover:bg-white/[0.045] ${
                    tidbit.opacity === 50 ? "opacity-50" : ""
                  }`}
                >
                  <div className="text-sm font-medium leading-snug">
                    {tidbit.name}
                  </div>
                  <p
                    className="mt-2 line-clamp-4 text-[11px] leading-relaxed sm:text-xs"
                    style={{ color: "var(--page-text-muted)" }}
                  >
                    {tidbit.desc}
                  </p>
                  {tidbit.stack ? (
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
                      Built with {tidbit.stack}
                    </p>
                  ) : null}
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {groupedTidbits.map(([category, items]) => (
                <TidbitCategory
                  key={category}
                  category={category}
                  items={items}
                  isOpen={openCategories.has(category)}
                  onToggle={toggleCategory}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}