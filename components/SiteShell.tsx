"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dithering } from "@paper-design/shaders-react";
import BouncingShapes from "./BouncingShapes";
import { useEffect, useState } from "react";

const transition = { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const };

const dotStyle = {
  backgroundImage: "radial-gradient(circle, #FFF8E6 1.5px, transparent 1.5px)",
  backgroundSize: "17px 17px",
} as const;

interface Project {
  name: string;
  url: string;
  description: string;
  stack: string[];
}

const PROJECTS: Record<string, Project> = {
  crepuscularity: {
    name: "crepuscularity",
    url: "https://github.com/semitechnological/crepuscularity",
    description: "a declarative ui framework built on gpui (the gpu-accelerated engine from zed). features a tailwind-like syntax and shadcn/ui inspired component library.",
    stack: ["rust", "gpui", "tailwind"],
  },
  rusty_foundationmodels: {
    name: "rusty_foundationmodels",
    url: "https://github.com/undivisible/RUSTY_FOUNDATIONMODELS",
    description: "safe rust bindings for apple's foundationmodels, bringing on-device apple intelligence to the rust ecosystem with memory safety and performance.",
    stack: ["rust", "swift", "apple intelligence"],
  },
  scape: {
    name: "scape",
    url: "https://github.com/undivisible/scape",
    description: "a spatial desktop environment for macos designed specifically for apple vision pro, redefining multi-window productivity in 3d space.",
    stack: ["swift", "macos", "visionpro"],
  },
  unthinkmail: {
    name: "unthinkmail",
    url: "https://github.com/undivisible/UNTHINKMAIL",
    description: "a minimalist, private-first email miniapp designed for speed and clarity in communication.",
    stack: ["javascript", "rust"],
  },
  unthinkclaw: {
    name: "unthinkclaw",
    url: "https://github.com/undivisible/UNTHINKCLAW",
    description: "an autonomous agent runtime built in rust for secure, high-performance messaging and automation tasks.",
    stack: ["rust"],
  },
  standpoint: {
    name: "standpoint",
    url: "https://github.com/undivisible/standpoint",
    description: "an ai-powered opinion platform and tier list creator. features real-time social features, deep customization, and a focus on beautiful ui.",
    stack: ["svelte", "typescript", "firebase", "ai"],
  },
  wax: {
    name: "wax",
    url: "https://github.com/semitechnological/wax",
    description: "a fast, homebrew-compatible package manager for rust developers, focusing on speed and minimal dependencies.",
    stack: ["rust"],
  },
  bublik: {
    name: "bublik",
    url: "https://github.com/undivisible/bublik",
    description: "a specialized noise generator miniapp for focused work and acoustic modeling.",
    stack: ["rust"],
  },
  alphabets: {
    name: "alphabets",
    url: "https://github.com/semitechnological/alphabets",
    description: "a tool for language learning focusing on character recognition and orthography across different writing systems.",
    stack: ["rust", "language learning"],
  },
};

function ProjectLink({ id }: { id: string }) {
  const project = PROJECTS[id];
  if (!project) return null;

  return (
    <span className="relative group inline-block">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#ff5705] hover:underline"
      >
        {project.name.toLowerCase()}
      </a>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-black border border-[#FFF8E6]/20 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-2xl backdrop-blur-md">
        <div className="text-sm text-[#FFF8E6] mb-3 leading-snug">
          {project.description}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-[#FFF8E6]/30 text-[#FFF8E6]/70 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-r border-b border-[#FFF8E6]/20 rotate-45" />
      </div>
    </span>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function SiteShell() {
  const pathname = usePathname();
  const isAbout = pathname === "/about";
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure layout is settled before fade-in
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <motion.div
      className="[font-synthesis:none] overflow-clip bg-black antialiased w-screen h-[100dvh] relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: mounted ? 1 : 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Dot grid + shapes layer */}
      <motion.div
        className="absolute overflow-hidden"
        initial={false}
        animate={{
          top: isAbout ? 0 : isMobile ? 56 : 70,
          bottom: isAbout ? 0 : isMobile ? 0 : 46,
          left: isAbout ? (isMobile ? "0%" : "50%") : "0%",
          right: "0%",
          opacity: isMobile ? (isAbout ? 0.3 : 0.5) : 1,
        }}
        transition={transition}
      >
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={dotStyle}
        />
        <BouncingShapes colorMode={isAbout ? "orange" : "rgb"} />
      </motion.div>

      {/* Content layer on top */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none">
        {/* Top bar */}
        <div className="flex justify-between items-start shrink-0 pointer-events-auto">
          <Link
            href={isAbout ? "/" : "/about"}
            className="flex items-center gap-2 md:gap-2.5 p-0 no-underline"
          >
            <div className="relative w-[56px] h-[56px] md:w-[70px] md:h-[70px] shrink-0">
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: isAbout ? 0 : 1 }}
                transition={transition}
              >
                <Dithering
                  speed={1}
                  shape="sphere"
                  type="4x4"
                  size={2}
                  scale={0.4}
                  colorBack="#00000000"
                  colorFront="#FFF8E6"
                  className="w-full h-full bg-black"
                />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: isAbout ? 1 : 0 }}
                transition={transition}
              >
                <Dithering
                  speed={1}
                  shape="sphere"
                  type="4x4"
                  size={2}
                  scale={0.4}
                  colorBack="#00000000"
                  colorFront="#FF5705"
                  className="w-full h-full bg-black"
                />
              </motion.div>
            </div>
            <motion.div
              className="text-base md:text-[24px] md:leading-[30px] text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] font-bold shrink-0"
              initial={false}
              animate={{ opacity: isAbout ? 1 : 0.5 }}
              transition={transition}
            >
              about me
            </motion.div>
          </Link>

          {/* Desktop-only top right links */}
          <motion.div
            className="hidden md:flex items-center gap-[50px] pt-5 pr-5 pointer-events-auto"
            initial={false}
            animate={{ opacity: isAbout ? 0 : 1 }}
            transition={transition}
            style={{ pointerEvents: isAbout ? "none" : "auto" }}
          >
            <a
              href="https://github.com/semitechnological"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[24px] leading-[30px] text-right opacity-50 hover:opacity-100 text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] shrink-0 no-underline transition-opacity duration-300"
            >
              github/semitechnological
            </a>
            <a
              href="https://instagram.com/undivisible.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[24px] leading-[30px] text-right opacity-50 hover:opacity-100 text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] shrink-0 no-underline transition-opacity duration-300"
            >
              instagram@undivisible.dev
            </a>
          </motion.div>
        </div>

        {/* Middle area - bio text on about */}
        <motion.div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          initial={false}
          animate={{
            width: isAbout ? (isMobile ? "100%" : "50%") : "0%",
            opacity: isAbout ? 1 : 0,
            paddingLeft: isAbout ? (isMobile ? 16 : 24) : 0,
            paddingRight: isAbout ? (isMobile ? 16 : 24) : 0,
            paddingTop: isAbout ? (isMobile ? 16 : 24) : 0,
            paddingBottom: isAbout ? (isMobile ? 32 : 24) : 0,
          }}
          transition={transition}
          style={{ pointerEvents: isAbout ? "auto" : "none" }}
        >
          <div className="text-base leading-relaxed md:text-[24px] md:leading-[30px] max-w-[916px] text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] font-bold whitespace-pre-wrap">
            hi, i&apos;m max carter.
            <br />
            i make things for people.
            <br />
            <br />
            i am cantonese australian. i speak cantonese, mandarin, russian,
            english and beginner japanese.
            <br />
            i learn japanese, bulgarian and hebrew. i am also building&nbsp;
            <ProjectLink id="alphabets" />
            , a tool for language learning.
            <br />
            <br />
            i build public software like&nbsp;
            <ProjectLink id="crepuscularity" />
            , a declarative ui framework for rust,&nbsp;
            <ProjectLink id="rusty_foundationmodels" />
            , bindings for apple intelligence,&nbsp;
            <ProjectLink id="scape" />
            , a spatial desktop for vision pro, and&nbsp;
            <ProjectLink id="unthinkmail" />
            .
            <br />
            <br />
            my other projects include&nbsp;
            <ProjectLink id="unthinkclaw" />
            ,&nbsp;
            <ProjectLink id="standpoint" />
            ,&nbsp;
            <ProjectLink id="wax" />
            &nbsp;and&nbsp;
            <ProjectLink id="bublik" />
            .
            <br />
            <br />
            i trade on nasdaq futures.
            <br />
            <br />
            i am a self taught full stack, high level and occassionally low
            level software developer since the age of 8. i code in rust, go,
            python, v and web.
            <br />
            i have a fascination of new and developing technologies, i was
            investing and mining crypto at 11 and was one of the first to try
            gpt-3 in 2020.
            <br />
            <br />
            i go to the gym occassionally, love cooking and photography.
          </div>
        </motion.div>

        {/* Bottom bar - desktop */}
        <motion.div
          className="hidden md:flex justify-between items-end shrink-0 px-4 pb-4 pt-2 pointer-events-auto"
          initial={false}
          animate={{ opacity: isAbout ? 0 : 1 }}
          transition={transition}
          style={{ pointerEvents: isAbout ? "none" : "auto" }}
        >
          <div className="flex items-baseline gap-4">
            <div className="text-[24px] leading-[30px] text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] font-bold">
              max carter
            </div>
            <a
              href="mailto:max@undivisible.dev"
              className="text-[24px] leading-[30px] opacity-50 hover:opacity-100 text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] font-bold no-underline transition-opacity duration-300"
            >
              max@undivisible.dev
            </a>
          </div>

          <div className="flex items-center gap-[50px]">
            <a
              href="https://github.com/undivisible"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[24px] leading-[30px] text-right opacity-50 hover:opacity-100 text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] shrink-0 no-underline transition-opacity duration-300"
            >
              github/undivisible
            </a>
          </div>
        </motion.div>

        {/* Bottom bar - mobile */}
        <div
          className="md:hidden shrink-0 pointer-events-auto overflow-hidden transition-[max-height] duration-500 ease-in-out"
          style={{
            maxHeight: isAbout ? 0 : 200,
            pointerEvents: isAbout ? "none" : "auto",
          }}
        >
          <motion.div
            className="px-4 pb-5 pt-2"
            initial={false}
            animate={{ opacity: isAbout ? 0 : 1 }}
            transition={transition}
          >
          <div className="flex items-baseline gap-3 mb-3">
            <div className="text-lg text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] font-bold">
              max carter
            </div>
            <a
              href="mailto:max@undivisible.dev"
              className="text-base opacity-50 text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] font-bold no-underline transition-opacity duration-300"
            >
              max@undivisible.dev
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="https://github.com/semitechnological"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base opacity-50 text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] no-underline transition-opacity duration-300"
            >
              github
            </a>
            <a
              href="https://instagram.com/undivisible.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base opacity-50 text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] no-underline transition-opacity duration-300"
            >
              @undivisible.dev
            </a>
            <a
              href="https://github.com/undivisible"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base opacity-50 text-[#FFF8E6] font-['Space_Grotesk',system-ui,sans-serif] no-underline transition-opacity duration-300"
            >
              @undivisible
            </a>
          </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
