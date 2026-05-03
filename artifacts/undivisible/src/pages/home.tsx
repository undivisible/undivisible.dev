import { Info } from "@/components/Info";
import Ascii from "@/components/Ascii";
import { Light } from "@/components/Light";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useLastFmVisualData } from "@/lib/useLastFmVisualData";

export default function Home() {
  const { track, colors, ready } = useLastFmVisualData();
  const dayTheme = useHongKongDayTheme();

  return (
    <div
      className="site-shell relative h-dvh overflow-hidden"
      style={dayTheme.style}
    >
      <Light
        scene={dayTheme.shader}
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
      />

      <div className="fixed inset-0 z-0 lg:hidden">
        <Ascii colors={colors} track={track} ready={ready} />
      </div>

      <div className="relative z-10 w-full max-w-full lg:hidden">
        <Info colors={colors} dayTheme={dayTheme} />
      </div>

      <div className="relative z-10 hidden h-dvh overflow-hidden lg:flex lg:w-full lg:max-w-full lg:overflow-x-hidden">
        <div className="relative h-full w-1/2 min-w-0 overflow-x-hidden">
          <Info colors={colors} dayTheme={dayTheme} />
        </div>
        <div className="h-full w-1/2 min-w-0 overflow-x-hidden">
          <Ascii colors={colors} track={track} ready={ready} />
        </div>
      </div>
    </div>
  );
}
