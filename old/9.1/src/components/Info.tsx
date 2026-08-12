"use client";

import type { HongKongDayTheme } from "@/lib/useHongKongDayTheme";
import { resumeSocialLinksFrom } from "@/data/resume-document";
import { useResumeDocument } from "@/hooks/use-resume-document";
import type { ReadmeBundle } from "@/lib/profile-readme";
import type { NowContent } from "@/lib/parse-now-markdown";
import { InfoBioSection } from "@/components/info/InfoBioSection";
import { InfoIntroSection } from "@/components/info/InfoIntroSection";
import { InfoWorkSection } from "@/components/info/InfoWorkSection";

export function Info({
  colors,
  dayTheme,
  getTransportStyle: getTransportStyleProp,
  readme,
  now,
  nowArticleOpen = false,
  onToggleNowArticle,
  slice = "all",
}: {
  colors?: string[];
  dayTheme?: HongKongDayTheme;
  getTransportStyle?: HongKongDayTheme["getTransportStyle"];
  readme: ReadmeBundle;
  now: NowContent;
  nowArticleOpen?: boolean;
  onToggleNowArticle?: () => void;
  slice?: "all" | "intro" | "folio" | "bio";
}) {
  const resumeDocLive = useResumeDocument();
  const socials = resumeSocialLinksFrom(resumeDocLive);

  const getTransportStyle =
    getTransportStyleProp ?? dayTheme?.getTransportStyle;
  if (!getTransportStyle) {
    throw new Error("Info requires dayTheme or getTransportStyle");
  }

  const showIntro = slice === "all" || slice === "intro";
  const showFolio = slice === "all" || slice === "folio";
  const showBio = slice === "all" || slice === "bio";

  return (
    <div className="relative w-full" style={{ color: "var(--page-text)" }}>
      {showIntro ? (
        <InfoIntroSection
          colors={colors ?? []}
          dayTheme={dayTheme}
          now={now}
          nowArticleOpen={nowArticleOpen}
          onToggleNowArticle={onToggleNowArticle}
          socials={socials}
        />
      ) : null}
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