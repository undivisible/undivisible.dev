import { motion } from "motion/react";
import { useInView } from "./hooks/useInView";

const skillCategories = [
  {
    title: "Full Stack Development",
    skills: [
      { name: "Rust (Tauri, Slint)", level: 3 },
      { name: "Python (Flask, FastAPI, Sanic)", level: 3 },
      { name: "TypeScript", level: 3 },
      { name: "JavaScript", level: 3 },
      { name: "Flutter/Dart", level: 2 },
      { name: "C# (.NET, ASP.NET)", level: 2 },
      { name: "C++", level: 2 },
      { name: "SQL (Postgres, MongoDB)", level: 1 },
      { name: "Supabase", level: 1 },
      { name: "Go", level: 1 },
    ],
  },
  {
    title: "Frontend & Frameworks",
    skills: [
      { name: "HTML/CSS", level: 3 },
      { name: "Svelte", level: 3 },
      { name: "React", level: 3 },
      { name: "Next.js", level: 3 },
      { name: "TailwindCSS", level: 3 },
      { name: "Capacitor", level: 3 },
      { name: "NativeScript", level: 3 },
      { name: "React Native", level: 2 },
      { name: "Unity", level: 2 },
      { name: "Angular", level: 2 },
      { name: "Vue", level: 2 },
    ],
  },
  {
    title: "DevOps & Security",
    skills: [
      { name: "Docker", level: 3 },
      { name: "Linux", level: 3 },
      { name: "Networking", level: 3 },
      { name: "Ethical Hacking", level: 3 },
      { name: "AI assisted development", level: 2 },
      { name: "GitHub Actions", level: 1 },
    ],
  },
];

export function Skills() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
  <section id="skills" ref={ref} className="relative z-30 min-h-screen flex items-center py-32 px-8 snap-start snap-always bg-white">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-black text-4xl md:text-5xl mb-16">Skills</h2>
          
          <div className="space-y-12">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="space-y-6"
              >
                <h3 className="text-black text-xl mb-4">{category.title}</h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.4, delay: categoryIndex * 0.1 + index * 0.03 }}
                      className="group relative"
                    >
                      <div
                        className={`
                          px-4 py-2 rounded-full border transition-all duration-300
                          ${skill.level === 3 ? "border-black/10 text-black hover:bg-black/5" : ""}
                          ${skill.level === 2 ? "border-black/8 text-black/80 hover:bg-black/3" : ""}
                          ${skill.level === 1 ? "border-black/6 text-black/60 hover:bg-black/3" : ""}
                        `}
                      >
                        {skill.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
