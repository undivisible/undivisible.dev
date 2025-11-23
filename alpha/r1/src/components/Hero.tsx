import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown } from "lucide-react";

const languagePairs = [
  { name: "max", lang: "english", ability: "speak" },
  { name: "максим", lang: "русский", ability: "speak" },
  { name: "максим", lang: "нохчийн", ability: "learn" },
  { name: "明思", lang: "廣東話", ability: "speak" },
  { name: "明思", lang: "普通话", ability: "speak" },
  { name: "ماكسيم", lang: "iraqi arabic", ability: "learn" },
  { name: "מאקסים", lang: "hebrew", ability: "learn" },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [prevName, setPrevName] = useState(languagePairs[0].name);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % languagePairs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  const current = languagePairs[currentIndex];
  const nameChanged = current.name !== prevName;
  
  useEffect(() => {
    if (nameChanged) {
      setPrevName(current.name);
    }
  }, [current.name, nameChanged]);

  return (
    <section className="relative h-screen flex items-center overflow-hidden snap-start snap-always bg-black">
      {/* bottom fade (placed before content so it sits behind text but above shapes) */}
      <div
        aria-hidden
        className="absolute left-0 right-0 bottom-0 h-72 pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 25%, rgba(40,40,40,0.7) 45%, rgba(160,160,160,0.95) 85%, rgba(255,255,255,1) 100%)',
        }}
      />

  <div className="relative z-30 px-8 w-full ml-[5vw] text-white">
        <div style={{ fontFamily: 'Instrument Sans, Liter, sans-serif', color: '#fff', fontSize: 'clamp(20px, 5.5vw, 72px)', lineHeight: 1.02, fontWeight: 800 }} className="tracking-tight leading-tight">
          <p className="hero-text-lg" style={{ fontSize: 'clamp(20px, 5.5vw, 72px)' }}>
            my name's{' '}
            <AnimatePresence mode="wait">
              {mounted && (
                <motion.span
                  key={`name-${prevName}`}
                  initial={{ opacity: nameChanged ? 0 : 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: nameChanged ? 0.5 : 0 }}
                  className="inline-block"
                >
                  {current.name}
                </motion.span>
              )}
            </AnimatePresence>
          </p>

          <p className="hero-text-lg" style={{ fontSize: 'clamp(20px, 5.5vw, 72px)' }}>
            i{' '}
            <AnimatePresence mode="wait">
              {mounted && (
                <motion.span
                  key={`ability-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block"
                >
                  {current.ability}
                </motion.span>
              )}
            </AnimatePresence>{' '}
            <AnimatePresence mode="wait">
              {mounted && (
                <motion.span
                  key={`lang-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block"
                >
                  {current.lang}
                </motion.span>
              )}
            </AnimatePresence>
          </p>

          <p className="hero-text-lg" style={{ fontSize: 'clamp(20px, 5.5vw, 72px)' }}>
            i make{' '}
            <a
              href="https://atechnology.company/"
              className="text-[#ff5705] hover:text-white hover:underline link-transition ml-2"
            >
              software
            </a>
          </p>

          <p className="text-[#fff8f0] hero-text-lg" style={{ fontSize: 'clamp(20px, 5.5vw, 72px)' }}>
            <a
              href="https://t.me/undivisible"
              className="hover:text-[#ff5705] hover:underline link-transition ml-2"
            >
              telegram
            </a>
            {' '}
            <a
              href="https://github.com/undivisible"
              className="hover:text-[#ff5705] hover:underline link-transition ml-4"
            >
              github
            </a>
          </p>
        </div>
      </div>

      <motion.button
        onClick={scrollToAbout}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown size={32} />
      </motion.button>

      {/* (moved) bottom fade is now placed above so it appears behind text but over shapes */}
    </section>
  );
}
