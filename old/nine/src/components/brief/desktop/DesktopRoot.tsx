
import { useEffect, useRef, useState } from "react";
import { Background } from "@/components/brief/desktop/Background";
import { NavDots } from "@/components/brief/desktop/NavDots";
import { HeroSection } from "@/components/brief/desktop/sections/HeroSection";
import { ServicesSection } from "@/components/brief/desktop/sections/ServicesSection";
import { CasesSection } from "@/components/brief/desktop/sections/CasesSection";
import { ProjectsSection } from "@/components/brief/desktop/sections/ProjectsSection";

const SECTION_IDS = ["hero", "services", "cases", "projects"];

export function DesktopRoot({ embed = false }: { embed?: boolean } = {}) {
  const [activeSection, setActiveSection] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div
      ref={containerRef}
      style={{
        position: "relative",
        ...(embed
          ? { height: "100dvh", width: "100%", overflow: "hidden" }
          : {}),
      }}
    >
      {embed ? (
        <Background containerRef={containerRef} />
      ) : (
        <Background />
      )}
      <NavDots
        active={activeSection}
        onDotClick={scrollToSection}
        layout={embed ? "layered" : "fixed"}
      />
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
