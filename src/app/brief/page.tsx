import type { Metadata } from "next";

const sectionTextStyle = {
  color: "white",
  fontFamily: "Young Serif",
  fontWeight: 400,
  wordWrap: "break-word" as const,
};

const projects = [
  {
    name: "crepuscularity",
    desc: "cross platform ui + runtime for desktop, web, webextensions and mobile.",
  },
  {
    name: "equilibrium",
    desc: "plug-and-play c-compiling language ffi for rust, or rust into swift with one line of code.",
  },
  {
    name: "soliloquy",
    desc: "ultralight os + browser engine for running webapps/websites instantly on low power devices.",
  },
  {
    name: "unthinkclaw",
    desc: "lightweight ai assistant + agent orchestration system (like openclaw, but smaller and faster).",
  },
];

export const metadata: Metadata = {
  title: "Brief",
  description: "A short overview of Max Carter's work and availability.",
  alternates: { canonical: "/brief" },
};

function Heading({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <div
      className={`flex flex-col justify-center text-[clamp(1.1rem,2vw,1.5rem)] leading-tight ${align === "right" ? "items-start text-left lg:items-end lg:text-right" : "items-start text-left"}`}
      style={sectionTextStyle}
    >
      {children}
    </div>
  );
}

function ProjectCard({ name, desc }: { name: string; desc: string }) {
  return (
    <article className="flex flex-col gap-2 border-t border-white/10 pt-4 lg:items-end">
      <h2 className="flex flex-col justify-center text-[clamp(1.25rem,2.1vw,1.6rem)] leading-tight lg:text-right" style={sectionTextStyle}>
        {name}
      </h2>
      <p className="max-w-[34rem] flex flex-col justify-center text-[clamp(1rem,1.5vw,1.125rem)] leading-snug text-white/95 lg:text-right">
        {desc}
      </p>
    </article>
  );
}

export default function BriefPage() {
  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1920px] flex-col lg:flex-row">
        <section className="flex min-h-[50dvh] flex-1 flex-col justify-center gap-5 overflow-hidden bg-black px-6 py-10 sm:px-10 md:px-12 lg:min-h-dvh lg:px-12 xl:px-16">
          <Heading>
            <div>hi, i&apos;m max</div>
          </Heading>

          <div className="flex flex-col gap-3 text-[clamp(1rem,1.75vw,1.5rem)] leading-snug" style={sectionTextStyle}>
            <div>i build inevitable software:</div>
            <div>
              fast desktop + webapps/saas
              <br />
              performance-critical systems
              <br />
              integrations across complex stacks
              <br />
              software that doesn&apos;t exist yet
            </div>
          </div>

          <div className="flex flex-col gap-3 text-[clamp(1rem,1.75vw,1.5rem)] leading-snug" style={sectionTextStyle}>
            <div>i take on projects that are:</div>
            <div>
              ambiguous
              <br />
              complex
              <br />
              or even unconventional
            </div>
          </div>

          <Heading>
            <div>give me a problem and i&apos;ll build the solution.</div>
          </Heading>

          <Heading>
            <div>melbourne/sydney/hong kong</div>
          </Heading>

          <Heading>
            <div>available for contract and part time work</div>
          </Heading>

          <Heading>
            <a href="mailto:max@undivisible.dev" className="underline underline-offset-4">
              max@undivisible.dev
            </a>
          </Heading>
        </section>

        <section className="flex flex-1 flex-col justify-center gap-5 overflow-hidden bg-[#191919] px-6 py-10 sm:px-10 md:px-12 lg:min-h-dvh lg:px-12 xl:px-16">
          <Heading align="right">
            <div>i make things like:</div>
          </Heading>

          <div className="flex flex-col gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.name} name={project.name} desc={project.desc} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
