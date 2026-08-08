"use client";

import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { LabSwitch } from "@/components/lab/LabSwitch";
import { Ref } from "@/components/lab/Ref";
import {
  BEFORE_17_FACTS,
  FRONTIER_FACTS,
  IDENTITY,
  LAB_LINKS,
  NOW_FACTS,
  WEBRING,
  type LabFact,
} from "@/data/lab-facts";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

/**
 * B · Ledger. No cards, no pills, no tiles. One column of hairline-ruled rows
 * where every line is a fact and every number is tabular. Hovering a row opens
 * it in place — that is the only interaction on the page.
 */
export default function LabLedger() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();

  return (
    <div className="lab-root lab-ledger" style={dayTheme.style}>
      <LabBackground dayTheme={dayTheme} />

      <main className="lab-ledger-main">
        <header className="lab-ledger-top">
          <p className="lab-ledger-id">
            {IDENTITY.name}
            <br />
            {IDENTITY.hanzi}
          </p>
          <LabClock
            dayTheme={dayTheme}
            location={now.location}
            status={now.status}
          />
        </header>

        <div className="lab-ledger-hero">
          <h1 className="lab-ledger-title">
            <GhostTagline block suffixClassName="lab-ledger-suffix" />
          </h1>
          <p className="lab-ledger-sub">
            {IDENTITY.role} at <Ref slug="omi">{IDENTITY.org}</Ref>. i work on{" "}
            {IDENTITY.product} — firmware, backend, and every screen in between.
          </p>
        </div>

        <Section title="now" facts={NOW_FACTS} />
        <Section title="why the tagline isn't a bit" facts={FRONTIER_FACTS} />
        <Section title="before seventeen" facts={BEFORE_17_FACTS} />

        <section className="lab-ledger-section">
          <h2>elsewhere</h2>
          <div className="lab-ledger-links">
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
            <a href={WEBRING.prev} target="_blank" rel="noopener">
              ← webring
            </a>
            <a href={WEBRING.next} target="_blank" rel="noopener">
              webring →
            </a>
          </div>
          <p className="lab-ledger-foot">
            built with <Ref slug="crepuscularity">crepuscularity</Ref> +{" "}
            <Ref slug="moonshine">moonshine</Ref>
          </p>
        </section>
      </main>

      <LabSwitch current="ledger" />
    </div>
  );
}

function Section({ title, facts }: { title: string; facts: LabFact[] }) {
  return (
    <section className="lab-ledger-section">
      <h2>{title}</h2>
      {facts.map((fact) => (
        <article className="lab-row" key={fact.title} tabIndex={0}>
          <h3 className="lab-row-title">
            {fact.ref ? <Ref slug={fact.ref}>{fact.title}</Ref> : fact.title}
          </h3>
          <p className="lab-row-meta">{fact.meta}</p>
          <div className="lab-row-detail">
            <div>
              <p>{fact.detail}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
