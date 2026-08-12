const links: { id: string; label: string }[] = [
  { id: "start", label: "start" },
  { id: "services", label: "services" },
  { id: "outcomes", label: "outcomes" },
  { id: "work", label: "work" },
  { id: "pillars", label: "flagship" },
  { id: "world", label: "world" },
  { id: "contact", label: "contact" },
];

export function SiteNav() {
  const printResume = async () => {
    await document.fonts.ready;
    window.print();
  };

  return (
    <header className="screen-only sticky top-0 z-[70] border-b border-white/10 bg-black/60 backdrop-blur-md [font-family:var(--font-jetbrains-mono),monospace]">
      <div className="relative mx-auto flex h-11 min-h-11 max-w-6xl items-center justify-center px-3 sm:h-12 sm:px-8 lg:px-10">
        <a
          href="#start"
          className="absolute left-3 top-1/2 max-w-[38%] -translate-y-1/2 truncate font-mono text-[8px] uppercase tracking-[0.14em] text-white/85 sm:left-8 sm:max-w-[30%] sm:text-[9px] sm:tracking-[0.18em] md:left-10 md:text-[10px] md:tracking-[0.22em]"
        >
          undivisible.dev
        </a>
        <nav
          aria-label="Page"
          className="flex max-w-[min(100%,46rem)] flex-nowrap items-center justify-center gap-x-[clamp(4px,1.2vw,14px)] px-12 font-mono text-[clamp(6.5px,1.35vw,10px)] uppercase leading-none tracking-[0.07em] text-white/50 sm:px-14 sm:tracking-[0.1em] md:px-16 md:tracking-[0.14em] lg:px-[4.5rem]"
        >
          {links.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex h-11 shrink-0 items-center whitespace-nowrap transition hover:text-white sm:h-12"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:right-6 sm:gap-1.5 md:right-8 lg:right-10">
          <button
            type="button"
            onClick={printResume}
            className="rounded-full border border-white/15 bg-black/70 px-2 py-1 font-mono text-[7px] uppercase leading-none tracking-[0.1em] text-white/85 transition hover:border-white/35 hover:text-white sm:px-2.5 sm:text-[8px] sm:tracking-[0.12em] md:text-[9px]"
          >
            resume
          </button>
          <a
            href="/brief"
            className="rounded-full border border-white/15 bg-black/70 px-2 py-1 font-mono text-[7px] uppercase leading-none tracking-[0.1em] text-white/85 transition hover:border-white/35 hover:text-white sm:px-2.5 sm:text-[8px] sm:tracking-[0.12em] md:text-[9px]"
          >
            brief
          </a>
        </div>
      </div>
    </header>
  );
}
