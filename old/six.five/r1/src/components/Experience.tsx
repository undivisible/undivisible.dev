import { motion } from "motion/react";
import { useInView } from "./hooks/useInView";

const experiences = [
  {
    title: "Systems and Product Architect",
    company: "Gizzmo Electronics",
    period: "Late 2024 onwards",
    description: "Creating websites and companion apps for hardware products. Designing product packaging, instruction manuals and input on user experience from front to back.",
  },
  {
    title: "Video Editor Intern",
    company: "T-One Image",
    period: "2023-2024",
    description: "Creating videos for marriage ceremonies, familiarising myself with different work environments and creating professional content.",
  },
  {
    title: "Factory Worker",
    company: "TDJ Australia",
    period: "2022",
    description: "Work experience managing product returns and recalls with quality inspections. Reflashing, unpacking, repacking maintaining attention to detail.",
  },
];

const education = [
  {
    title: "Certificate III in Information Technology",
    institution: "Box Hill Institute",
    period: "Graduated 2025",
    description: "Creating websites and companion apps for hardware products. Designing product packaging, instruction manuals and input on user experience from front to back.",
  },
  {
    title: "Year 11 & 12",
    institution: "Eltham High School",
    period: "Current",
    description: "Studying Year 12 Applied Computing, Business, Indonesian, Mathematics and Linguistics. Next year: Politics, Philosophy, Extended Investigation, Linguistics and Indonesian.",
  },
];

export function Experience() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <>
  <section id="experience" ref={ref} className="relative z-30 min-h-screen flex items-center py-32 px-8 snap-start snap-always bg-white">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="space-y-20"
        >
          {/* Work Experience */}
          <div>
            <h2 className="text-black text-4xl md:text-5xl mb-12">Work Experience</h2>
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.title}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border-l-2 border-white/20 pl-6 hover:border-[#ff5705] transition-colors duration-300"
                >
                  <h3 className="text-black text-xl">{exp.title}</h3>
                  <p className="text-[#ff5705] mt-1">
                    {exp.company} | {exp.period}
                  </p>
                  <p className="text-black/60 mt-3 leading-relaxed">
                    {exp.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education (kept inside the Experience section, light background) */}
          <div>
            <h2 className="text-black text-4xl md:text-5xl mb-12">Education</h2>
            <div className="space-y-8">
              {education.map((edu, index) => (
                <motion.div
                  key={edu.title}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="border-l-2 border-white/20 pl-6 hover:border-[#ff5705] transition-colors duration-300"
                >
                  <h3 className="text-black text-xl">{edu.title}</h3>
                  <p className="text-[#ff5705] mt-1">
                    {edu.institution} | {edu.period}
                  </p>
                  <p className="text-black/60 mt-3 leading-relaxed">
                    {edu.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      </section>
    </>
  );
}
