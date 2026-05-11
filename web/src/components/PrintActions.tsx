import { TILE_LINK_HOVER } from "@/components/brief/ui/constants";

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
    <div className="screen-only fixed right-4 top-4 z-[60] flex gap-2 text-[10px] tracking-[0.14em] sm:right-6 sm:top-6 [font-family:var(--font-jetbrains-mono),monospace]">
      <a
        href={isBrief ? "/" : "/brief"}
        className={`rounded-full border border-white/15 bg-black/45 px-4 py-2 lowercase text-white/65 backdrop-blur-md ${TILE_LINK_HOVER} hover:border-white/35 hover:bg-black/60 hover:text-white`}
      >
        {isBrief ? "frontpage" : "brief"}
      </a>
      <button
        type="button"
        onClick={print}
        className={`rounded-full border border-white/15 bg-black/70 px-4 py-2 lowercase text-white/85 backdrop-blur-md ${TILE_LINK_HOVER} hover:border-white/35 hover:bg-black/85 hover:text-white`}
      >
        save pdf
      </button>
    </div>
  );
}
