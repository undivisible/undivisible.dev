/**
 * Reference cards for the hover component. Keyed by slug; the repo entries
 * mirror the descriptions on github.com/tschk so the site and the repos say
 * the same thing.
 */
export type LabRef = {
  title: string;
  kind: string;
  body: string;
  source: string;
  href: string;
  /** Right-hand stat in the card footer. */
  stat: string;
  /** Photo, when there is one. Otherwise a monogram is drawn. */
  image?: string;
  mark?: string;
};

export const LAB_REFS: Record<string, LabRef> = {
  terry: {
    title: "Terrence Andrew Davis",
    kind: "1969 – 2018 · programmer",
    image: "/refs/terry-davis.jpg",
    body: "American electrical engineer and programmer. Spent a decade alone writing TempleOS — a public-domain operating system, plus its compiler, its kernel, its graphics stack and its own language, HolyC — at 640×480 in sixteen colours. He called it a temple.",
    source: "wikipedia · photo public domain",
    href: "https://en.wikipedia.org/wiki/Terry_A._Davis",
    stat: "TempleOS",
  },
  holyc: {
    title: "tree-sitter-holyc",
    kind: "my repo · C",
    mark: "{}",
    body: "A tree-sitter grammar for HolyC, Terry's language. Its README calls it parsing for the holiest language on earth. It exists because the tagline is not a bit.",
    source: "github.com/undivisible",
    href: "https://github.com/undivisible/tree-sitter-holyc",
    stat: "C",
  },
  inauguration: {
    title: "Inauguration",
    kind: "my compiler · Rust",
    mark: "in",
    body: "A compiler for forty languages: import a library from any ecosystem and use it as if it were one. Self-hosts in under two seconds into a 9 MB binary, with no LLVM in the pipeline. Capability-managed, deterministic execution graphs.",
    source: "github.com/tschk/inauguration",
    href: "https://github.com/tschk/inauguration",
    stat: "no LLVM",
  },
  space: {
    title: "Space",
    kind: "my operating system · Assembly",
    mark: "◻",
    body: "Component-based OS built from the compiler up: .in → Inauguration → SCI → Space → Nanokernel. Five layers where the compiler defines authority, objects, scheduling and policy, not just machine code. AArch64, ARM and RISC-V. No POSIX. Capability-native.",
    source: "github.com/tschk/space",
    href: "https://github.com/tschk/space",
    stat: "no POSIX",
  },
  crepuscularity: {
    title: "Crepuscularity",
    kind: "my framework · Rust",
    mark: "cr",
    body: "Write React and it compiles to GPUI desktop apps, SwiftUI, Jetpack Compose, Ratatui terminal UIs and embedded targets. Write Rust and it compiles to browser extensions. Write either for the web. This site is built with it.",
    source: "github.com/tschk/crepuscularity",
    href: "https://github.com/tschk/crepuscularity",
    stat: "29 ★",
  },
  moonshine: {
    title: "Moonshine",
    kind: "my web framework · TypeScript",
    mark: "ms",
    body: "Hyperminimal, Bun-first, import what you need. Signal-only kernel with an opt-in compiler, router, renderer and server. Moving this site off Next.js onto it cut the homepage's JavaScript by 80% and the build by 91%.",
    source: "github.com/tschk/moonshine",
    href: "https://github.com/tschk/moonshine",
    stat: "renders this page",
  },
  alpenglow: {
    title: "Alpenglow",
    kind: "my linux distro · Rust",
    mark: "al",
    body: "A hyperlightweight diskless *nix. Own package manager, a Wayland desktop shell called Alpenglowed, immutable variants, and x86-64, AArch64 and RISC-V targets.",
    source: "github.com/tschk/alpenglow",
    href: "https://github.com/tschk/alpenglow",
    stat: "9 ★",
  },
  rv8: {
    title: "RV8",
    kind: "my browser engine · Rust",
    mark: "rv",
    body: "A browser engine: Servo for rendering, V8 for JavaScript, Rust holding it together. Because at some point you stop picking a browser.",
    source: "github.com/tschk/rv8",
    href: "https://github.com/tschk/rv8",
    stat: "servo + v8",
  },
  rotary: {
    title: "Rotary",
    kind: "my agent runtime · Rust",
    mark: "ro",
    body: "The agent harness engine — loop, tools, providers, sessions, permissions, computer-use, MCP and pi-protocol compatibility, in Rust.",
    source: "github.com/tschk/rotary",
    href: "https://github.com/tschk/rotary",
    stat: "Rust",
  },
  tschk: {
    title: "tsc.hk",
    kind: "the company i founded at 17",
    mark: "tsc",
    body: "The Semitechnological Company. Twenty-two repositories: a compiler, two operating systems, a browser engine, a Linux distribution, two web frameworks, an agent runtime and the FFI glue underneath. Everything I build that is not a miniapp lives here.",
    source: "github.com/tschk",
    href: "https://tsc.hk",
    stat: "22 repos",
  },
  apollo: {
    title: "Apollo",
    kind: "my agent runtime · Rust",
    mark: "ap",
    body: "Local-first AI agent runtime in a ~14 MB binary. Ten-plus messaging channels, twenty-plus LLM providers, autonomous coding mode, tool guardrails and a plugin system.",
    source: "github.com/tschk/apollo",
    href: "https://github.com/tschk/apollo",
    stat: "14 MB",
  },
  wax: {
    title: "Wax · Oil",
    kind: "package managers · Rust",
    mark: "wx",
    body: "Wax is a Homebrew-compatible package manager that uses Homebrew's formulae, bottles and casks without the Ruby and git overhead. Oil is the same idea for every major *nix, with Linuxbrew support.",
    source: "github.com/plyght/wax",
    href: "https://github.com/plyght/wax",
    stat: "compiled, async",
  },
  omi: {
    title: "Omi · Based Hardware",
    kind: "where i work",
    mark: "◎",
    body: "The wearable that remembers — an always-on device that captures your conversations and turns them into memory you can query. I am a founding engineer: nRF firmware, the Flutter app, the Swift macOS client, the Python backend, the Rust core and the TypeScript edge.",
    source: "github.com/BasedHardware/omi",
    href: "https://github.com/BasedHardware/omi",
    stat: "101 PRs",
  },
};
