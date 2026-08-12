import { motion } from "motion/react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useInView } from "./hooks/useInView";

export function Contact() {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section id="contact" ref={ref} className="min-h-screen flex items-center py-32 px-8 snap-start snap-always">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <h2 className="text-white text-4xl md:text-5xl text-center">Get in touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <motion.a
              href="mailto:max@undivisible.dev"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group flex items-start gap-4 p-6 border border-white/10 rounded-lg hover:border-white/30 transition-all duration-300 hover:bg-white/5"
            >
              <Mail className="text-[#ff5705] mt-1 group-hover:scale-110 transition-transform" size={24} />
              <div>
                <h3 className="text-white mb-2">Email</h3>
                <p className="text-white/60 break-all">max@undivisible.dev</p>
              </div>
            </motion.a>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="group flex items-start gap-4 p-6 border border-white/10 rounded-lg hover:border-white/30 transition-all duration-300 hover:bg-white/5"
            >
              <MapPin className="text-[#ff5705] mt-1 group-hover:scale-110 transition-transform" size={24} />
              <div>
                <h3 className="text-white mb-2">Location</h3>
                <p className="text-white/60">Melbourne, VIC</p>
              </div>
            </motion.div>

            <motion.a
              href="tel:0481729894"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group flex items-start gap-4 p-6 border border-white/10 rounded-lg hover:border-white/30 transition-all duration-300 hover:bg-white/5"
            >
              <Phone className="text-[#ff5705] mt-1 group-hover:scale-110 transition-transform" size={24} />
              <div>
                <h3 className="text-white mb-2">Phone</h3>
                <p className="text-white/60">0481729894</p>
              </div>
            </motion.a>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-12 text-center"
          >
            <p className="text-white/40 text-sm">
              "be in the pursuit of true happiness"
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
