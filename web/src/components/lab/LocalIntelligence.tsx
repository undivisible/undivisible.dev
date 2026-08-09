"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePromptApi } from "@/hooks/use-prompt-api";

const SYSTEM = [
  "You write one sentence for the footer of a personal website.",
  "Voice: lowercase, flat, dry. no exclamation marks, no emoji, no metaphors about journeys or passion.",
  "Never praise the person. Never use the words: passionate, journey, innovative, cutting-edge, tirelessly, exciting.",
  "You are given facts. Use only the facts given. Output the sentence and nothing else. Under 22 words.",
].join(" ");

export type MomentFacts = {
  clock: string;
  place: string;
  weather: string;
  track: string | null;
  prsThisYear: number;
  commitsThisYear: number;
  mergedElsewhere: number;
  suffix: string;
};

function localSentence(facts: MomentFacts): string {
  // The no-model path still differs every load — it reads the same live state,
  // it just doesn't get to phrase it.
  const parts = [
    `${facts.clock} in ${facts.place}, ${facts.weather}.`,
    `${facts.prsThisYear.toLocaleString("en-US")} pull requests so far this year.`,
    facts.track ? `${facts.track} is playing.` : null,
    `${facts.mergedElsewhere} of them merged by someone else.`,
  ].filter(Boolean) as string[];
  const start = Math.floor(Math.random() * parts.length);
  return parts
    .slice(start)
    .concat(parts.slice(0, start))
    .slice(0, 2)
    .join(" ");
}

/**
 * A line written by the visitor's own browser.
 *
 * Chrome ships a small language model on the device. If it's there, it reads
 * the same live state the rest of the page is showing — the hour, the weather,
 * what's playing, the pull request count that just came back from the API —
 * and writes one sentence about it. Nothing leaves the machine, and because
 * the state and the sampling both move, no two loads get the same line.
 */
export function LocalIntelligence({
  facts,
  ready,
}: {
  facts: MomentFacts;
  /** Held until the clock and the live numbers are real, not build-time. */
  ready: boolean;
}) {
  const api = usePromptApi(SYSTEM);
  const [text, setText] = useState<string | null>(null);
  const [source, setSource] = useState<"model" | "local" | null>(null);
  const asked = useRef(false);

  const prompt = useMemo(
    () =>
      [
        "facts:",
        `- local time where he is: ${facts.clock} in ${facts.place}`,
        `- weather there: ${facts.weather}`,
        facts.track ? `- currently playing: ${facts.track}` : null,
        `- pull requests he has opened this year: ${facts.prsThisYear}`,
        `- commits this year: ${facts.commitsThisYear}`,
        `- pull requests merged into other people's repositories: ${facts.mergedElsewhere}`,
        `- his tagline right now: "the ghost of terry davis, but ${facts.suffix}"`,
        "",
        "write the sentence.",
      ]
        .filter(Boolean)
        .join("\n"),
    [facts],
  );

  useEffect(() => {
    if (asked.current || !ready) return;
    if (api.state === "checking" || api.state === "downloading") return;

    asked.current = true;
    if (api.state === "ready") {
      void api.run(prompt, setText).then((final) => {
        if (final && final.trim()) setSource("model");
        else {
          setText(localSentence(facts));
          setSource("local");
        }
      });
      return;
    }
    setText(localSentence(facts));
    setSource("local");
    // `facts` is a live object; we deliberately fire once, on the first
    // settled state, so the line is a snapshot of the load rather than a
    // ticker that rewrites itself under the reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.state, ready]);

  const ask = () => {
    setSource(null);
    setText("");
    void api.run(prompt, setText).then((final) => {
      if (final && final.trim()) setSource("model");
      else {
        setText(localSentence(facts));
        setSource("local");
      }
    });
  };

  // Say what is actually true. "no model" is only correct when the API isn't
  // on the global at all — when it is there and still says no, the usual
  // cause is a cross-origin frame, not a missing model.
  const label = (() => {
    if (source === "model") return "written on your machine by your browser's model";
    if (api.state === "running") return "your browser is writing this";
    if (api.state === "downloading") return "your browser is downloading its model";
    if (api.state === "downloadable")
      return "your browser has a model but hasn't downloaded it yet";
    if (api.state === "blocked")
      return "your browser has the api but this frame can't use it — open the page directly";
    if (api.state === "failed") return "your browser's model refused. assembled locally instead";
    return "your browser has no on-device model — this one is assembled locally";
  })();

  // If the API object exists at all, offer the gesture: create() behind a
  // click often succeeds where availability() was pessimistic.
  const canRetry = api.present && source !== "model" && api.state !== "running";

  return (
    <div className="min-nano">
      <p className="min-nano-line">
        {text ?? "…"}
        {api.state === "running" ? <i className="min-nano-caret" /> : null}
      </p>
      <p className="min-nano-tag">
        <span
          className="min-nano-dot"
          data-on={source === "model" ? "true" : undefined}
          aria-hidden
        />
        {label}
        {canRetry ? (
          <button type="button" className="min-nano-run" onClick={ask}>
            run it anyway
          </button>
        ) : null}
        {source === "model" ? (
          <button
            type="button"
            className="min-nano-run"
            onClick={() => {
              setText("");
              void api.run(prompt, setText);
            }}
          >
            again
          </button>
        ) : null}
      </p>
    </div>
  );
}
