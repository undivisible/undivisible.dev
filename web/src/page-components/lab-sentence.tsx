"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { LabSwitch } from "@/components/lab/LabSwitch";
import type { LabLayoutProps } from "@/components/lab/lab-layout";
import { IDENTITY, LAB_LINKS, SENTENCES } from "@/data/lab-facts";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import { useHongKongDayTheme } from "@/lib/useHongKongDayTheme";

/** Sentences, then the links. One more step than there are lines. */
const STEPS = SENTENCES.length + 1;
const WHEEL_THRESHOLD = 26;

/**
 * B · Sentence. The entire site is eleven lines and a link row, shown one at a
 * time at display size. Scroll, click, arrow or space to advance. There is no
 * page to scan and nothing to skim past — the brevity is the structure, not a
 * constraint applied to it afterwards.
 */
export default function LabSentence({ onSelect }: LabLayoutProps = {}) {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const [step, setStep] = useState(0);
  const wheelRef = useRef(0);

  const go = useCallback((delta: number) => {
    setStep((current) => Math.min(STEPS - 1, Math.max(0, current + delta)));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ([" ", "ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) {
        event.preventDefault();
        go(1);
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        go(-1);
      }
      if (event.key === "Home") setStep(0);
      if (event.key === "End") setStep(STEPS - 1);
    };
    const onWheel = (event: WheelEvent) => {
      wheelRef.current += event.deltaY;
      if (Math.abs(wheelRef.current) < WHEEL_THRESHOLD) return;
      go(wheelRef.current > 0 ? 1 : -1);
      wheelRef.current = 0;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [go]);

  const line = SENTENCES[step];
  const atEnd = step === STEPS - 1;

  return (
    <div
      className="lab-root lab-sentence"
      style={dayTheme.style}
      onClick={() => go(1)}
    >
      <LabBackground dayTheme={dayTheme} />

      <main className="lab-sentence-frame">
        <header className="lab-sentence-top">
          <LabClock
            dayTheme={dayTheme}
            location={now.location}
            status={now.status}
          />
          <p className="lab-sentence-tag">
            <GhostTagline suffixClassName="lab-sentence-suffix" />
          </p>
        </header>

        <div className="lab-sentence-stage">
          {atEnd ? (
            <div className="lab-sentence-end">
              <p className="lab-sentence-note">{IDENTITY.hanzi}</p>
              <nav className="lab-sentence-links">
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
                    onClick={(event) => event.stopPropagation()}
                  >
                    {link.name}
                    <span>{link.handle}</span>
                  </a>
                ))}
              </nav>
            </div>
          ) : (
            <div key={step} className="lab-sentence-block">
              {line?.note ? (
                <span className="lab-sentence-note">{line.note}</span>
              ) : null}
              <p className="lab-sentence-line">{line?.text}</p>
              {line?.kicker ? (
                <p className="lab-sentence-kicker">{line.kicker}</p>
              ) : null}
            </div>
          )}
        </div>

        <footer className="lab-sentence-foot">
          <div className="lab-sentence-progress" aria-hidden>
            {Array.from({ length: STEPS }, (_, index) => (
              <i key={index} data-on={index <= step ? "true" : undefined} />
            ))}
          </div>
          <p className="lab-sentence-hint">
            {atEnd ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setStep(0);
                }}
              >
                again
              </button>
            ) : (
              <>
                scroll, click or press space · {step + 1} / {STEPS}
              </>
            )}
          </p>
        </footer>
      </main>

      <LabSwitch current="sentence" onSelect={onSelect} />
    </div>
  );
}
