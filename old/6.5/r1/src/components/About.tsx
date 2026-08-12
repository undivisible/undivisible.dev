import { motion } from "motion/react";
import { useInView } from "./hooks/useInView";

export function About() {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
  <section id="about" ref={ref} className="relative z-30 min-h-screen flex items-center px-8 snap-start snap-always bg-white">
      {/* Top fade overlay to blend with hero */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 h-72 pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(240,240,240,0.6) 0%, rgba(245,245,245,0.78) 15%, rgba(250,250,250,0.9) 35%, rgba(253,253,253,0.98) 60%, rgba(255,255,255,1) 100%)',
        }}
      />
      <div className="max-w-6xl mx-auto w-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <h2 className="text-black text-4xl md:text-5xl">About me</h2>
          
          <div className="space-y-8">
            <p className="text-black/70 text-xl md:text-2xl leading-relaxed max-w-4xl">
              Full-stack Cantonese-English openly gay self-taught developer, coding from the age of 9. 
              I love philosophy and politics. Contrarian thinker, critical, curious and open minded.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
