"use client";

import { useEffect, useRef, useState } from "react";
import { Background } from "@/components/brief/desktop/Background";
import { NavDots } from "@/components/brief/desktop/NavDots";
import { HeroSection } from "@/components/brief/desktop/sections/HeroSection";
import { ServicesSection } from "@/components/brief/desktop/sections/ServicesSection";
import { CasesSection } from "@/components/brief/desktop/sections/CasesSection";
import { ProjectsSection } from "@/components/brief/desktop/sections/ProjectsSection";

const SECTION_IDS = ["hero", "services", "cases", "projects"];

export function DesktopRoot() {
  const [activeSection, setActiveSection] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = SECTION_IDS.indexOf(entry.target.id);
            if (idx !== -1) setActiveSection(idx);
          }
        }
      },
      { root: container, threshold: 0.55 }
    );
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <Background />
      <NavDots active={activeSection} onDotClick={scrollToSection} />
      <div
        ref={scrollRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          position: "relative",
          zIndex: 1,
          scrollbarWidth: "none",
        }}
      >
        <HeroSection />
        <ServicesSection />
        <CasesSection />
        <ProjectsSection />
      </div>
    </div>
  );
}
