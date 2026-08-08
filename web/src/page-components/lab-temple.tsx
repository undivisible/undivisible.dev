"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { GhostTagline } from "@/components/lab/GhostTagline";
import { LabBackground } from "@/components/lab/LabBackground";
import { LabClock } from "@/components/lab/LabClock";
import { LabSwitch } from "@/components/lab/LabSwitch";
import { Ref } from "@/components/lab/Ref";
import {
  BEFORE_17_FACTS,
  IDENTITY,
  LAB_LINKS,
  OMI,
  WEBRING,
} from "@/data/lab-facts";
import { useNowMarkdown } from "@/hooks/use-remote-content";
import {
  useHongKongDayTheme,
  type ShaderPalette,
} from "@/lib/useHongKongDayTheme";

const SCREEN_W = 640;
const SCREEN_H = 480;

const PANELS = ["now", "work", "before 17", "links"] as const;
type Panel = (typeof PANELS)[number];

/**
 * A · Temple. The site is one 640×480 screen floating in the weather, the
 * shape Terry worked in. Nothing scrolls; four keys move between panels and
 * the colour strip along the bottom is sampled from the sky.
 */
export default function LabTemple() {
  const dayTheme = useHongKongDayTheme();
  const now = useNowMarkdown();
  const [panel, setPanel] = useState<Panel>("now");
  const [scale, setScale] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);

  const fit = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const available = Math.min(
      (frame.clientWidth - 40) / SCREEN_W,
      (frame.clientHeight - 40) / SCREEN_H,
    );
    setScale(Math.max(0.34, Math.min(1, available)));
  }, []);

  useLayoutEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key);
      if (index >= 1 && index <= PANELS.length) setPanel(PANELS[index - 1]!);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="lab-root lab-temple" style={dayTheme.style}>
      <LabBackground dayTheme={dayTheme} />

      <LabClock
        dayTheme={dayTheme}
        location={now.location}
        status={now.status}
        className="lab-temple-clock"
      />

      <div className="lab-temple-frame" ref={frameRef}>
        <div
          className="lab-screen"
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            transform: `scale(${scale.toFixed(3)})`,
          }}
        >
          <div className="lab-screen-bar">
            <span>undivisible.dev</span>
            <span>640 × 480 · 16 colours</span>
          </div>

          <div className="lab-screen-body">
            <p className="lab-screen-who">
              {IDENTITY.name} · {IDENTITY.hanzi}
            </p>
            <h1 className="lab-screen-title">
              <GhostTagline block suffixClassName="lab-screen-suffix" />
            </h1>
            <p className="lab-screen-role">
              {IDENTITY.role}, <Ref slug="omi">{IDENTITY.org}</Ref> —{" "}
              {IDENTITY.blurb}
            </p>

            <div className="lab-screen-panel">
              {panel === "now" ? (
                <dl>
                  <dt>now</dt>
                  <dd>
                    founding engineer at <Ref slug="omi">based hardware</Ref>,
                    on omi — the wearable that remembers.
                  </dd>
                  <dt>since</dt>
                  <dd>20 jul 2026</dd>
                  <dt>output</dt>
                  <dd>
                    <b>{OMI.pullRequests} PRs</b> · {OMI.merged} merged ·{" "}
                    <b>{OMI.commits} commits</b>
                  </dd>
                  <dt>surface</dt>
                  <dd>{OMI.surfaces}</dd>
                </dl>
              ) : null}

              {panel === "work" ? (
                <dl>
                  <dt>compiler</dt>
                  <dd>
                    <Ref slug="inauguration">inauguration</Ref> — 40 languages,
                    one import graph. self-hosts in &lt;2s. no LLVM.
                  </dd>
                  <dt>os</dt>
                  <dd>
                    <Ref slug="space">space</Ref> — five layers from the
                    compiler up. no POSIX. capability-native.
                  </dd>
                  <dt>framework</dt>
                  <dd>
                    <Ref slug="crepuscularity">crepuscularity</Ref> → gpui,
                    swiftui, compose, ratatui, extensions, web.
                  </dd>
                  <dt>browser</dt>
                  <dd>
                    <Ref slug="rv8">rv8</Ref> — servo rendering, v8 javascript.
                  </dd>
                  <dt>also</dt>
                  <dd>
                    <Ref slug="alpenglow">alpenglow</Ref>,{" "}
                    <Ref slug="rotary">rotary</Ref>,{" "}
                    <Ref slug="holyc">tree-sitter-holyc</Ref> · 24k+ crate
                    downloads
                  </dd>
                </dl>
              ) : null}

              {panel === "before 17" ? (
                <dl>
                  {BEFORE_17_FACTS.map((fact) => (
                    <ScreenRow
                      key={fact.title}
                      term={fact.meta}
                      value={fact.title}
                    />
                  ))}
                </dl>
              ) : null}

              {panel === "links" ? (
                <div className="lab-screen-links">
                  {LAB_LINKS.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
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
                    ← ring
                  </a>
                  <a href={WEBRING.next} target="_blank" rel="noopener">
                    ring →
                  </a>
                </div>
              ) : null}
            </div>

            <div className="lab-screen-menu" role="tablist">
              {PANELS.map((name, index) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={panel === name}
                  onClick={() => setPanel(name)}
                >
                  [{index + 1}] {name}
                </button>
              ))}
            </div>
          </div>

          <SkyStrip shader={dayTheme.shader} />
        </div>
      </div>

      <LabSwitch current="temple" />
    </div>
  );
}

function ScreenRow({ term, value }: { term: string; value: string }) {
  return (
    <>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </>
  );
}

/**
 * Terry had sixteen colours because VGA gave him sixteen. These sixteen are
 * ramped from the sky currently being drawn behind the screen, so the palette
 * moves with the hour instead of being a fixed table.
 */
function SkyStrip({ shader }: { shader: ShaderPalette }) {
  const ramp = [
    shader.shadow,
    shader.base,
    shader.beamSecondary,
    shader.beam,
    shader.accent,
    "#ffffff",
  ];
  return (
    <div className="lab-screen-strip" aria-hidden>
      {Array.from({ length: 16 }, (_, index) => {
        const position = (index / 15) * (ramp.length - 1);
        const low = Math.floor(position);
        return (
          <i
            key={index}
            style={{
              background: mixHex(
                ramp[low]!,
                ramp[Math.min(ramp.length - 1, low + 1)]!,
                position - low,
              ),
            }}
          />
        );
      })}
    </div>
  );
}

function mixHex(from: string, to: string, amount: number): string {
  const channels = (hex: string) =>
    [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
  const [a, b] = [channels(from), channels(to)];
  return `#${a
    .map((value, index) =>
      Math.round(value + (b[index]! - value) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
