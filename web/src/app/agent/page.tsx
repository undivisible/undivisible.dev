import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent mode · undivisible.dev",
  description:
    "Direct markdown URLs for AI agents (static files, not HTML scrape).",
};

const FETCH_PATHS = [
  {
    href: "/llms.txt",
    label: "llms.txt",
    note: "Curated index (llms.txt spec)",
  },
  {
    href: "/llms-full.txt",
    label: "llms-full.txt",
    note: "Full Markdown bundle in one request",
  },
  { href: "/agent.md", label: "agent.md", note: "Short how-to for agents" },
  { href: "/now.md", label: "now.md", note: "Now status (deploy snapshot; live site fetches GitHub)" },
  { href: "/resume.md", label: "resume.md", note: "CV and contact" },
] as const;

export default function AgentPage() {
  return (
    <main
      className="mx-auto max-w-xl px-5 py-12 text-sm leading-relaxed [font-family:var(--font-jetbrains-mono),ui-monospace,monospace]"
      style={{ background: "#0a0a0a", color: "#e8e8e8", minHeight: "100dvh" }}
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">
        Agent mode
      </p>
      <h1 className="mt-2 text-lg text-white">Fetch markdown directly</h1>
      <p className="mt-4 text-white/70">
        This site is static on GitHub Pages. Agents should{" "}
        <strong className="font-medium text-white/90">
          GET the .md / .txt URLs
        </strong>
        , not parse the visual home page. There is no{" "}
        <code className="text-white/85">Accept: text/markdown</code> negotiation
        (that needs an edge like Cloudflare Workers); paths below are already
        plain text files in the deploy output.
      </p>
      <ul className="mt-8 space-y-4 border-t border-white/15 pt-8">
        {FETCH_PATHS.map((p) => (
          <li key={p.href}>
            <a
              href={p.href}
              className="text-base text-white underline underline-offset-4"
            >
              {p.href}
            </a>
            <p className="mt-1 text-white/55">{p.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-white/50">
        Human UI:{" "}
        <Link href="/" className="underline underline-offset-2 text-white/70">
          /
        </Link>
      </p>
    </main>
  );
}
