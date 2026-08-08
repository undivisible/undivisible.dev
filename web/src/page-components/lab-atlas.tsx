"use client";

import { useState } from "react";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { LabSwitch } from "@/components/lab/LabSwitch";
import type { LabLayoutProps } from "@/components/lab/lab-layout";
import { Ref } from "@/components/lab/Ref";
import {
  COUNTRIES_IN_A_YEAR,
  IDENTITY,
  LAB_LINKS,
  OMI,
  PLACES,
} from "@/data/lab-facts";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

/** What each row of the board says when you look at it. */
const NOTES: Record<string, string> = {
  AUS: "from here",
  BHR: "sixteen, alone",
  USA: "sixteen, alone",
  NZL: "",
  SGP: "sixteen, alone",
  MYS: "sixteen, alone",
  BRN: "",
  HKG: "sixteen, alone · 祁明思",
  CHN: "sixteen, alone",
  JPN: "sixteen, alone · still learning the language",
  VNM: "booked",
};

/**
 * C · Atlas. A nomad reads a departures board, so the board is the page: ten
 * countries down the spine, the seven that happened inside one year lit, the
 * one that hasn't happened yet still blinking. Everything else is compressed
 * into two lines above it and one row below.
 */
export default function LabAtlas({ onSelect }: LabLayoutProps = {}) {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const [hovered, setHovered] = useState<string | null>(null);
  const visited = PLACES.filter((place) => !place.next).length;

  return (
    <div className="lab-root lab-atlas" style={dayTheme.style}>
      <LabBackground dayTheme={dayTheme} />

      <main className="lab-atlas-frame">
        <header className="lab-atlas-top">
          <LabClock
            dayTheme={dayTheme}
            location={now.location}
            status={now.status}
          />
          <p className="lab-atlas-id">
            {IDENTITY.name} · {IDENTITY.hanzi}
          </p>
        </header>

        <h1 className="lab-atlas-tagline">
          <GhostTagline suffixClassName="lab-atlas-suffix" />
        </h1>
        <p className="lab-atlas-sub">
          {IDENTITY.role} at <Ref slug="omi">based hardware</Ref>. mine is{" "}
          <Ref slug="tschk">tsc.hk</Ref> — a{" "}
          <Ref slug="inauguration">compiler</Ref> with no llvm, an{" "}
          <Ref slug="space">operating system</Ref> with no posix.
        </p>

        <ol className="lab-board">
          {PLACES.map((place) => (
            <li
              key={place.code}
              className="lab-board-row"
              data-run={place.run ? "true" : undefined}
              data-next={place.next ? "true" : undefined}
              onMouseEnter={() => setHovered(place.code)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="lab-board-code">{place.code}</span>
              <span className="lab-board-name">{place.name}</span>
              <span className="lab-board-note">
                {hovered === place.code ? NOTES[place.code] : ""}
              </span>
              <span className="lab-board-mark">
                {place.next ? "next" : place.home ? "home" : "·"}
              </span>
            </li>
          ))}
        </ol>

        <footer className="lab-atlas-foot">
          <p className="lab-atlas-count">
            <b>{COUNTRIES_IN_A_YEAR}</b> in one year, alone, before seventeen ·{" "}
            <b>{visited}</b> so far · <b>{OMI.pullRequests}</b> pull requests
            since july
          </p>
          <nav className="lab-atlas-links">
            {LAB_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {link.name}
              </a>
            ))}
          </nav>
        </footer>
      </main>

      <LabSwitch current="atlas" onSelect={onSelect} />
    </div>
  );
}
