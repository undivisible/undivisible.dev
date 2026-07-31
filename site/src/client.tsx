import { createApp, createSignal, useSignal } from "@tschk/moonshine/react";
import { useFragmentShader } from "@tschk/moonshine-shaders";
import { readmeProjects } from "./generated/readme-projects";
import { nowMarkdown } from "./generated/now-markdown";
import type { ReadmeProject } from "./parse-readme";

const SHADER = `
vec4 shade(vec2 uv, float t) {
  vec2 p = uv * 2.0 - 1.0;
  float sky = smoothstep(-0.2, 1.1, uv.y);
  vec3 top = vec3(0.05, 0.08, 0.16);
  vec3 mid = vec3(0.12, 0.18, 0.32);
  vec3 bot = vec3(0.02, 0.03, 0.06);
  vec3 col = mix(bot, mid, sky);
  col = mix(col, top, sky * sky);
  float sun = exp(-length(p - vec2(0.55, 0.35)) * 4.5);
  col += vec3(1.0, 0.75, 0.35) * sun * 0.55;
  float band = 0.5 + 0.5 * sin(p.x * 3.0 + t * 0.15 + p.y * 2.0);
  col += vec3(0.05, 0.08, 0.14) * band * (1.0 - sky);
  return vec4(col, 1.0);
}
`;

const open = createSignal(false);

function ProjectList({
  title,
  items,
}: {
  title: string;
  items: readonly ReadmeProject[];
}) {
  if (!items.length) return null;
  return (
    <section className="block">
      <h2>{title}</h2>
      <ul>
        {items.map((p) => (
          <li key={p.key}>
            <a href={p.href} target="_blank" rel="noreferrer">
              {p.name}
            </a>
            {p.desc ? <span className="desc"> — {p.desc}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function nowLine(md: string): string {
  const line = md
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#") && !l.startsWith("---"));
  return line ?? "building things.";
}

function App() {
  const showMore = useSignal(open);
  const { canvasRef } = useFragmentShader(SHADER, { animate: true });
  const now = nowLine(nowMarkdown);

  return (
    <div className="page">
      <canvas ref={canvasRef} className="bg" aria-hidden />
      <main className="panel">
        <header>
          <p className="eyebrow">undivisible.dev</p>
          <h1>undivisible</h1>
          <p className="lede">
            systems, compilers, and interfaces — personal site.
          </p>
          <p className="now">
            <span className="label">now</span> {now}
          </p>
        </header>

        <ProjectList title="main" items={readmeProjects.mainProjects} />
        <ProjectList title="utilities" items={readmeProjects.utilities} />

        {showMore ? (
          <>
            <ProjectList title="miniapps" items={readmeProjects.miniapps} />
            <ProjectList title="libraries" items={readmeProjects.libraries} />
            <ProjectList title="tools" items={readmeProjects.tools} />
          </>
        ) : null}

        <button
          type="button"
          className="more"
          onClick={() => open.set((v) => !v)}
        >
          {showMore ? "show less" : "show more"}
        </button>

        <footer className="made">
          <span>
            made with{" "}
            <a
              href="https://github.com/tschk/moonshine"
              target="_blank"
              rel="noreferrer"
            >
              moonshine
            </a>
          </span>
          <span className="dot">·</span>
          <span>bun + signals + shaders</span>
        </footer>
      </main>
    </div>
  );
}

createApp({ root: App }).mount("#app");
