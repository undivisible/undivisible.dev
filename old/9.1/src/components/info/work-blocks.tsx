"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ReadmeBundle } from "@/lib/profile-readme";
import { TILE_LINK_HOVER } from "@/components/brief/ui/constants";
import { REVEAL_EASE } from "@/components/info/constants";
import type { Tidbit } from "@/components/info/miniapp-tidbits";

export function UtilitiesBlock({
  readme,
  excludeKeys = [],
}: {
  readme: ReadmeBundle;
  excludeKeys?: readonly string[];
}) {
  const exclude = useMemo(() => new Set(excludeKeys), [excludeKeys]);
  const utilitiesFiltered = [
    ...readme.utilities.filter((p) => !exclude.has(p.key)),
    ...readme.libraries,
  ];

  return (
    <div className="space-y-4">
      <motion.p
        className="text-[11px] uppercase tracking-[0.18em] font-mono text-white/40"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: REVEAL_EASE }}
      >
        libraries & tools
      </motion.p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {utilitiesFiltered.map((product, i) => (
          <motion.a
            key={product.key}
            href={product.href}
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
            className={`h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-left text-[var(--page-text)] backdrop-blur-sm ${TILE_LINK_HOVER} hover:border-white/[0.1] hover:bg-white/[0.045] sm:p-4`}
          >
            <div className="text-sm font-medium leading-tight">
              {product.name}
            </div>
            <p
              className="mt-1 line-clamp-3 text-[11px] leading-relaxed sm:text-xs"
              style={{ color: "var(--page-text-muted)" }}
            >
              {product.desc}
            </p>
            {product.stack ? (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
                Built with {product.stack}
              </p>
            ) : null}
          </motion.a>
        ))}
      </div>
    </div>
  );
}

export function TidbitCategory({
  category,
  items,
  isOpen,
  onToggle,
}: {
  category: string;
  items: Tidbit[];
  isOpen: boolean;
  onToggle: (cat: string) => void;
}) {
  return (
    <div className="border-b border-white/[0.04] pb-1 pt-1">
      <button
        type="button"
        onClick={() => onToggle(category)}
        className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-1 py-2 text-left text-[11px] uppercase tracking-[0.2em] font-mono text-white/40 transition-colors hover:text-white/60"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          style={{ color: "currentColor" }}
        >
          <path
            d="M3 1L7 5L3 9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {category}
        <span className="ml-auto text-[9px] text-white/25">{items.length}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 gap-2 px-1 pb-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((tidbit, i) => (
                <motion.a
                  key={tidbit.key}
                  href={tidbit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: i * 0.03,
                    ease: "easeOut",
                  }}
                  className={`h-full rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur-sm ${TILE_LINK_HOVER} hover:border-white/[0.1] hover:bg-white/[0.045] ${
                    tidbit.opacity === 50 ? "opacity-50" : ""
                  }`}
                >
                  <div className="text-sm font-medium leading-snug">
                    {tidbit.name}
                  </div>
                  <p
                    className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed sm:text-xs"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}