import type { Metadata } from "next";
import Link from "next/link";
import { LAB_LAYOUTS } from "@/data/lab-facts";

export const metadata: Metadata = {
  title: "layout studies · undivisible.dev",
  description: "Three redesign layouts for undivisible.dev, same content.",
};

const NOTES: Record<string, string> = {
  temple:
    "The site is one 640×480 screen floating in the weather. Nothing scrolls; four keys move between panels, and the sixteen-colour strip is sampled from the sky.",
  ledger:
    "No cards, no pills, no tiles. One column of hairline-ruled rows where every line is a fact. Hovering a row opens it in place.",
  signal:
    "The time scrubber is the site. Drag the band and the sky moves, and so does the sentence — the page says what I am doing at that hour.",
};

export default function LabIndex() {
  return (
    <main className="lab-root lab-index">
      <p className="lab-index-eyebrow">undivisible.dev · layout studies</p>
      <h1 className="lab-index-title">
        Same content.
        <br />
        Three arguments.
      </h1>
      <p className="lab-index-lede">
        The sky shader, the Last.fm ASCII field, the weather and the
        scroll-to-change-time clock are identical in all three — they are the
        best thing on the site. What changes is the shape the words take.
      </p>
      <ul className="lab-index-list">
        {LAB_LAYOUTS.map((layout, index) => (
          <li key={layout.slug}>
            <Link href={layout.href}>
              <span className="lab-index-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span>
                <strong>{layout.label}</strong>
                <span>{NOTES[layout.slug]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="lab-index-foot">
        <Link href="/">← the live site, unchanged</Link>
      </p>
    </main>
  );
}
