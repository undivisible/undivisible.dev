import { motion } from "motion/react";
import { useInView } from "./hooks/useInView";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    name: "Plates",
    tech: "Swift and Rust",
    description:
      "Bringing AI to your phone to deploy agents to manage your life. Creating ecosystems local-first for interconnectivity for all of your devices, while being able to access anything anywhere anytime through the internet.",
  },
  {
    name: "Infrastruct",
    tech: "React + Next.js",
    description:
      "A jurisprudence AI-powered platform to see opinions on morality and ethics across multiple religions and philosophical and logical frameworks.",
  },
  {
    name: "Standpoint",
    tech: "Svelte + Python (Sanic)",
    description:
      "The social media platform and tool to create visual representations for user opinions with polls and tierlists.",
  },
  {
    name: "Berd",
    tech: "Swift",
    description:
      "The first chat app on iOS to use Apple Intelligence + PCC for truly private AI chats.",
  },
  {
    name: "Vuno",
    tech: "Tauri (Svelte/Rust)",
    description:
      "The keyboard-focused GUI text editor for notes and code. Light and powerful.",
  },
  {
    name: "Atzel",
    tech: "Tauri (Svelte/Rust)",
    description:
      "A sub-active trading bot based on real time insights online based on my own strategies.",
  },
  {
    name: "Akh",
    tech: "Svelte + Nativescript",
    description:
      "The most comprehensive platform for Islamic software, previously based on Transformers+IBM Granite for local AI.",
  },
  {
    name: "Gizzmo Electronics",
    tech: "Svelte",
    description: "Website for companies",
  },
];

export function Projects() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
  <section id="projects" ref={ref} className="relative z-30 min-h-screen flex items-center py-32 px-8 snap-start snap-always bg-white">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-black text-4xl md:text-5xl mb-16">Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center">
            {projects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="group relative border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300 hover:bg-white/5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-black text-xl group-hover:text-[#ff5705] transition-colors">
                      {project.name}
                    </h3>
                      <ExternalLink
                        className="text-black/40 group-hover:text-black/80 transition-colors"
                        size={20}
                      />
                  </div>
                  <p className="text-[#ff5705] text-sm">
                    {project.tech}
                  </p>
                   <p className="text-black/60 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
