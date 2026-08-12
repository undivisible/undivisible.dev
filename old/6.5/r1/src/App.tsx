import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { AnimatedBackground } from "./components/AnimatedBackground";

export default function App() {
  return (
    <>
      <AnimatedBackground />
  <div className="relative z-30 h-screen overflow-y-auto snap-y snap-mandatory">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
      </div>
    </>
  );
}
