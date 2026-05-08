type PrintActionsProps = {
  variant?: "home" | "brief";
};

export function PrintActions({ variant = "home" }: PrintActionsProps) {
  const isBrief = variant === "brief";
  const print = async () => {
    await document.fonts.ready;
    window.print();
  };

  return (
    <div className="screen-only fixed right-4 top-4 z-[60] flex gap-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:right-6 sm:top-6">
      <a
        href={isBrief ? "/" : "/brief"}
        className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-white/65 backdrop-blur-md transition hover:border-white/35 hover:text-white"
      >
        {isBrief ? "frontpage" : "brief"}
      </a>
      <button
        type="button"
        onClick={print}
        className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-white/85 backdrop-blur-md transition hover:border-white/35 hover:text-white"
      >
        save pdf
      </button>
    </div>
  );
}
