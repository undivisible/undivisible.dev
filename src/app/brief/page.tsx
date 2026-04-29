"use client";

import { useEffect, useRef, useState } from "react";
import { RandomizedText } from "@/components/randomized-text";

const sectionTextStyle = {
  color: "white",
  fontFamily: "Young Serif",
  fontWeight: 400,
  wordWrap: "break-word" as const,
};

const projects = [
  {
    name: "crepuscularity / aurorality",
    desc: "cross platform ui + runtime for desktop, web, webextensions and mobile.",
  },
  {
    name: "equilibrium",
    desc: "plug-and-play ffi for rust, c-compiling languages, or rust into swift with one line of code.",
  },
  {
    name: "soliloquy",
    desc: "ultralight os + browser engine for running webapps and websites instantly on low power devices.",
  },
  {
    name: "unthinkclaw",
    desc: "lightweight ai assistant and agent orchestration system. like openclaw, but smaller and faster.",
  },
];

const socials = [
  {
    label: "instagram",
    handle: "@makethingsforpeople",
    href: "https://instagram.com/makethingsforpeople",
  },
  {
    label: "twitter",
    handle: "@makethings4ppl",
    href: "https://twitter.com/makethings4ppl",
  },
  {
    label: "github",
    handle: "/undivisible",
    href: "https://github.com/undivisible",
  },
];

function Text({
  children,
  className = "",
  split = "words",
}: {
  children: string;
  className?: string;
  split?: "words" | "chars";
}) {
  return (
    <RandomizedText className={className} split={split}>
      {children}
    </RandomizedText>
  );
}

function ProjectCard({ name, desc }: { name: string; desc: string }) {
  return (
    <article className="group flex flex-col gap-2 border-t border-white/10 pt-5 transition-opacity duration-300 hover:opacity-100 lg:items-end lg:text-right">
      <h2
        className="text-[clamp(1.1rem,2.1vw,1.6rem)] leading-tight lg:text-right"
        style={sectionTextStyle}
      >
        <Text split="chars">{name}</Text>
      </h2>
      <p className="max-w-[34rem] text-[clamp(0.85rem,1.5vw,1.125rem)] leading-snug text-white/80 transition-colors duration-300 group-hover:text-white/95 lg:text-right">
        <Text>{desc}</Text>
      </p>
    </article>
  );
}

function EmailDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("max@undivisible.dev");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-block underline underline-offset-4 decoration-white decoration-2 outline outline-transparent outline-0 outline-offset-0 transition-all duration-200 hover:no-underline hover:outline-2 hover:outline-dotted hover:outline-white/80 hover:outline-offset-4"
        style={sectionTextStyle}
      >
        <Text split="chars">max@undivisible.dev</Text>
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 min-w-[12rem] rounded-lg overflow-hidden"
          style={{ background: "color-mix(in srgb, #191919 96%, black)" }}
        >
          <a
            href="mailto:max@undivisible.dev"
            className="block w-full px-4 py-3 text-left text-[clamp(0.85rem,1.5vw,1rem)] hover:bg-white/5 transition-colors"
            style={{ color: "white", fontFamily: "Young Serif" }}
            onClick={() => setIsOpen(false)}
          >
            Open Mail App
          </a>
          <button
            onClick={handleCopy}
            className="block w-full px-4 py-3 text-left text-[clamp(0.85rem,1.5vw,1rem)] hover:bg-white/5 transition-colors"
            style={{ color: "white", fontFamily: "Young Serif" }}
          >
            {copied ? "Copied!" : "Copy Email"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BriefPage() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("max@undivisible.dev");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* subtle noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex min-h-dvh w-full flex-col lg:flex-row">
        {/* left column */}
        <section className="flex min-h-[50dvh] flex-1 flex-col justify-center gap-5 bg-black px-6 py-12 sm:px-10 md:px-14 lg:min-h-dvh lg:px-16 xl:px-20">
          <div
            style={sectionTextStyle}
            className="text-[clamp(1rem,2vw,1.5rem)] leading-tight"
          >
            <Text split="chars">hi, i&apos;m max</Text>
          </div>

          <div
            className="flex flex-col gap-3 text-[clamp(0.85rem,1.75vw,1.5rem)] leading-snug"
            style={sectionTextStyle}
          >
            <div>
              <Text>i build inevitable software:</Text>
            </div>
            <div className="flex flex-col gap-1">
              <Text>- fast desktop + webapps/saas</Text>
              <Text>- performance-critical systems</Text>
              <Text>- integrations across complex stacks</Text>
              <Text>- software that doesn&apos;t exist yet</Text>
            </div>
          </div>

          <div
            className="flex flex-col gap-3 text-[clamp(0.85rem,1.75vw,1.5rem)] leading-snug"
            style={sectionTextStyle}
          >
            <div>
              <Text>i take on projects that are:</Text>
            </div>
            <div className="flex flex-col gap-1">
              <Text>- ambiguous</Text>
              <Text>- complex</Text>
              <Text>- or even unconventional</Text>
            </div>
          </div>

          <div
            style={sectionTextStyle}
            className="text-[clamp(1rem,2vw,1.5rem)] leading-tight"
          >
            <Text>give me a problem and i&apos;ll build the solution.</Text>
          </div>

          <div
            style={sectionTextStyle}
            className="text-[clamp(1rem,2vw,1.5rem)] leading-tight"
          >
            <Text>melbourne/sydney/hong kong</Text>
          </div>

          <div
            style={sectionTextStyle}
            className="text-[clamp(1rem,2vw,1.5rem)] leading-tight"
          >
            <Text>available for contract and part time work</Text>
          </div>

          {/* desktop email */}
          <div className="hidden lg:flex group/email items-center gap-3 text-[clamp(1rem,2vw,1.5rem)] leading-tight">
            <a
              href="mailto:max@undivisible.dev"
              className="inline-block underline underline-offset-4 decoration-white decoration-2 outline outline-transparent outline-0 outline-offset-0 transition-all duration-200 hover:no-underline hover:outline-2 hover:outline-dotted hover:outline-white/80 hover:outline-offset-4"
              style={sectionTextStyle}
            >
              <Text split="chars">max@undivisible.dev</Text>
            </a>
            <button
              onClick={copyEmail}
              className="pointer-events-none opacity-0 outline outline-transparent outline-0 outline-offset-0 transition-all duration-200 group-hover/email:pointer-events-auto group-hover/email:opacity-100 hover:outline-2 hover:outline-dotted hover:outline-white/80 hover:outline-offset-4"
              style={{
                ...sectionTextStyle,
                fontSize: "0.75em",
                padding: "0.35em 0.7em",
                cursor: "pointer",
              }}
            >
              {copied ? "copied" : "copy email"}
            </button>
          </div>

          {/* mobile email dropdown */}
          <EmailDropdown />
        </section>

        {/* right column */}
        <section className="relative flex h-full min-h-[50dvh] flex-1 flex-col overflow-hidden bg-[#2a2a35] px-6 py-12 sm:px-10 md:px-14 lg:min-h-dvh lg:px-16 xl:px-20">
          {/* right column background */}
          <div className="pointer-events-none absolute inset-0 z-0 bg-[#191919]" />

          {/* centered content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center gap-6">
            <div
              className="text-[clamp(1rem,2vw,1.5rem)] leading-tight lg:text-right"
              style={sectionTextStyle}
            >
              <Text split="chars">i make things like:</Text>
            </div>

            <div className="flex flex-col gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.name}
                  name={project.name}
                  desc={project.desc}
                />
              ))}
            </div>
          </div>

          {/* social links */}
          <div className="relative z-10 mt-10 flex flex-col gap-3 lg:absolute lg:bottom-6 lg:left-auto lg:right-8 lg:mt-0 lg:flex-row lg:flex-wrap lg:gap-x-5 lg:gap-y-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="text-[clamp(0.75rem,1.2vw,0.875rem)] text-white/50 underline underline-offset-2 decoration-white/50 decoration-2 outline outline-transparent outline-0 outline-offset-0 transition-all duration-200 hover:text-white/90 hover:no-underline hover:outline-2 hover:outline-dotted hover:outline-white/80 hover:outline-offset-4"
                style={sectionTextStyle}
              >
                <Text>{`${social.label} ${social.handle}`}</Text>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
