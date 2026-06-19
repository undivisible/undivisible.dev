import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent mode · undivisible.dev",
  description:
    "Plain markdown sources for AI agents and tools (llms.txt, now, resume).",
  alternates: {
    types: {
      "text/markdown": [
        { url: "/now.md", title: "Now" },
        { url: "/resume.md", title: "Resume" },
      ],
    },
  },
};

type Doc = { id: string; title: string; href: string; body: string };

async function readPublicMarkdown(name: string): Promise<string | null> {
  const file = path.join(process.cwd(), "public", name);
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

export default async function AgentPage() {
  const [now, resume, agents] = await Promise.all([
    readPublicMarkdown("now.md"),
    readPublicMarkdown("resume.md"),
    readPublicMarkdown("agents.md"),
  ]);

  const docs: Doc[] = [];
  if (now) {
    docs.push({ id: "now", title: "Now / profile", href: "/now.md", body: now });
  }
  if (resume) {
    docs.push({
      id: "resume",
      title: "Resume",
      href: "/resume.md",
      body: resume,
    });
  }
  if (agents) {
    docs.push({
      id: "agents",
      title: "AGENTS.md",
      href: "/agents.md",
      body: agents,
    });
  }

  return (
    <main
      className="mx-auto max-w-3xl px-5 py-10 text-sm leading-relaxed [font-family:var(--font-jetbrains-mono),ui-monospace,monospace]"
      style={{
        background: "#0a0a0a",
        color: "#e8e8e8",
        minHeight: "100dvh",
      }}
    >
      <header className="mb-10 space-y-3 border-b border-white/15 pb-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">
          Agent mode
        </p>
        <h1 className="text-lg font-medium tracking-tight text-white">
          undivisible.dev — markdown for agents
        </h1>
        <p className="text-white/70">
          Human portfolio UI is at{" "}
          <Link href="/" className="underline underline-offset-2">
            /
          </Link>
          . This page and <code className="text-white/90">/llms.txt</code>{" "}
          follow the{" "}
          <a
            href="https://llmstxt.org/"
            className="underline underline-offset-2"
          >
            llms.txt
          </a>{" "}
          pattern: fetch raw <code>.md</code> files instead of scraping the
          visual site.
        </p>
        <ul className="list-inside list-disc text-white/60">
          <li>
            <a href="/llms.txt" className="underline underline-offset-2">
              /llms.txt
            </a>{" "}
            — curated index
          </li>
          <li>
            <a href="/ai.txt" className="underline underline-offset-2">
              /ai.txt
            </a>{" "}
            — machine-readable crawl hints
          </li>
        </ul>
      </header>

      {docs.length === 0 ? (
        <p className="text-white/60">
          No markdown synced yet. Run{" "}
          <code>bun run sync:agent</code> before build.
        </p>
      ) : (
        <nav className="mb-10 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.14em]">
          {docs.map((d) => (
            <a
              key={d.id}
              href={`#${d.id}`}
              className="rounded-full border border-white/20 px-3 py-1 text-white/80 hover:border-white/40"
            >
              {d.title}
            </a>
          ))}
        </nav>
      )}

      {docs.map((d) => (
        <section key={d.id} id={d.id} className="mb-14 scroll-mt-8">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base text-white">{d.title}</h2>
            <a
              href={d.href}
              className="text-[11px] uppercase tracking-[0.14em] text-white/55 underline underline-offset-2"
            >
              {d.href}
            </a>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/40 p-4 text-[13px] leading-relaxed text-white/85">
            {d.body}
          </pre>
        </section>
      ))}
    </main>
  );
}