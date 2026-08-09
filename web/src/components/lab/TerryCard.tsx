"use client";

import { HoverCard } from "@/components/lab/HoverCard";
import { TERRY } from "@/data/lab-facts";

/**
 * The line "the ghost of terry davis" is a claim about a real person, so his
 * name opens the card that says who he was — photograph, dates, what he
 * actually built, and why the comparison isn't only a reference.
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
      <span className="terry-inner">
        <img className="terry-photo" src={TERRY.image} alt="" />
        <span className="terry-copy">
          <span className="hc-title">
            {TERRY.name}
            <em>{TERRY.years}</em>
          </span>
          <span className="hc-body">{TERRY.body}</span>
          <span className="hc-note">{TERRY.mine}</span>
        </span>
      </span>
    </HoverCard>
  );
}
