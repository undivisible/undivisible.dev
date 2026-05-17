import { TILE_LINK_HOVER } from "@/components/brief/ui/constants";

type SiteNavProps = {
  onPrintResume: () => void;
  onPrintBrief: () => void;
};

export function SiteNav({ onPrintResume, onPrintBrief }: SiteNavProps) {
  return (
    <div className="screen-only pointer-events-none fixed left-0 right-0 top-0 z-[70] flex justify-end p-5 sm:p-6 [font-family:var(--font-jetbrains-mono),monospace]">
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onPrintResume}
          className={`inline-flex min-h-9 min-w-[4.5rem] cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/70 px-4 py-2 font-mono text-[11px] uppercase leading-none tracking-[0.12em] text-white/90 backdrop-blur-md sm:min-h-10 sm:min-w-[5rem] sm:px-5 sm:text-xs sm:tracking-[0.14em] md:text-[13px] ${TILE_LINK_HOVER} hover:border-white/35 hover:bg-black/85 hover:text-white`}
        >
          resume
        </button>
        <button
          type="button"
          onClick={onPrintBrief}
          className={`inline-flex min-h-9 min-w-[4.5rem] cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/70 px-4 py-2 font-mono text-[11px] uppercase leading-none tracking-[0.12em] text-white/90 backdrop-blur-md sm:min-h-10 sm:min-w-[5rem] sm:px-5 sm:text-xs sm:tracking-[0.14em] md:text-[13px] ${TILE_LINK_HOVER} hover:border-white/35 hover:bg-black/85 hover:text-white`}
        >
          brief
        </button>
      </div>
    </div>
  );
}
