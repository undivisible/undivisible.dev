"use client";

import { HoverCard } from "@/components/lab/HoverCard";
import { RandomizedText } from "@/components/lab/RandomizedText";
import { TERRY } from "@/data/lab-facts";

/**
 * The line "the ghost of terry davis" is a claim about a real person, so his
 * name opens the card that says who he was — photograph, dates, what he
 * actually built, and why the comparison isn't only a reference.
 *
 * The copy re-reveals on every open, so the card never feels like a cached
 * panel being shown again.
 */
export function TerryCard({ children }: { children: React.ReactNode }) {
  return (
    <HoverCard
      className="terry"
      trigger={
        <a
          className="terry-name"
          href={TERRY.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      }
    >
      {(open) => (
        <span className="terry-inner" key={open}>
          <img className="terry-photo" src={TERRY.image} alt="" />
          <span className="terry-copy">
            <span className="hc-title">
              {TERRY.name}
              <em>{TERRY.years}</em>
            </span>
            <span className="hc-body">
              <RandomizedText delay={0.06}>{TERRY.body}</RandomizedText>
            </span>
            <span className="hc-note">
              <RandomizedText delay={0.2}>{TERRY.mine}</RandomizedText>
            </span>
          </span>
        </span>
      )}
    </HoverCard>
  );
}
