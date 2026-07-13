"use client";

import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { useResumeDocument } from "@/hooks/use-resume-document";
import type { ReadmeBundle } from "@/lib/profile-readme";
import type { NowContent } from "@/lib/parse-now-markdown";
import { InfoBioSection } from "@/components/info/InfoBioSection";
import { InfoWorkSection } from "@/components/info/InfoWorkSection";

export function Info({
  getTransportStyle: getTransportStyleProp,
  dayTheme,
  readme,
  now: _now,
  slice = "all",
}: {
  dayTheme?: HongKongDayTheme;
  getTransportStyle?: HongKongDayTheme["getTransportStyle"];
  readme: ReadmeBundle;
  now: NowContent;
  slice?: "all" | "folio" | "bio";
}) {
  const resumeDocLive = useResumeDocument();

  const getTransportStyle =
    getTransportStyleProp ?? dayTheme?.getTransportStyle;
  if (!getTransportStyle) {
    throw new Error("Info requires dayTheme or getTransportStyle");
  }

  const showFolio = slice === "all" || slice === "folio";
  const showBio = slice === "all" || slice === "bio";

  return (
    <div className="relative w-full" style={{ color: "var(--page-text)" }}>
      {showFolio ? <InfoWorkSection readme={readme} /> : null}
      {showBio ? (
        <InfoBioSection
          resumeDocLive={resumeDocLive}
          getTransportStyle={getTransportStyle}
        />
      ) : null}
    </div>
  );
}