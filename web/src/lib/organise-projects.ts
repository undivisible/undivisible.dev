/**
 * Sort the README project list into categories without me maintaining a list.
 *
 * The README groups projects by how they were published (main / utilities /
 * miniapps / libraries), which says nothing about what they are — a compiler
 * and a note-taking app sit in the same bucket. These rules read the name,
 * blurb and URL and answer the question a reader actually has: what kind of
 * thing is this?
 *
 * First matching rule wins, so order is the priority: a tree-sitter grammar is
 * a grammar before it is a library, and Space is an OS before it is Rust.
 */

export type OrganisedProject = {
  name: string;
  href?: string;
  desc?: string;
};

export type ProjectCategory = {
  key: string;
  label: string;
  /** One line, in my voice, shown above the group. */
  blurb: string;
  items: OrganisedProject[];
};

type Rule = {
  key: string;
  label: string;
  blurb: string;
  /** Matched against `name + description + href`, lowercased. */
  match: RegExp;
};

const RULES: Rule[] = [
  {
    key: "os",
    label: "operating systems",
    blurb: "three of them. none of them finished. one of them boots.",
    match:
      /\boperating system\b|\bdistro\b|\bnanokernel\b|\bmicrokernel\b|^space$|^subspace$|^alpenglow$|^soliloquy$/,
  },
  {
    key: "compilers",
    label: "compilers & languages",
    blurb: "no llvm was harmed. no llvm was used, either.",
    match: /\bcompiler\b|\bgrammar\b|tree-sitter|\bparsing\b|\binlang\b/,
  },
  {
    key: "extensions",
    label: "browser extensions",
    blurb: "manifest v3 is a punishment and i keep volunteering.",
    match: /\bextension\b|\bmv3\b|vimium/,
  },
  {
    key: "frameworks",
    label: "frameworks",
    blurb: "write it once. i'll deal with the six platforms.",
    match: /\bframework\b|^crepuscularity$|^aurorality$|^moonshine$/,
  },
  {
    key: "engines",
    label: "browser & rendering engines",
    blurb: "at some point you stop picking a browser.",
    match: /\bbrowser engine\b|\bservo\b|\bv8\b/,
  },
  {
    key: "mail",
    label: "mail & messaging",
    blurb: "email is a protocol, not a product.",
    match:
      /\bimap\b|\bsmtp\b|\bmail\b|stalwart|crosspost|\bimessage\b|facetime/,
  },
  {
    key: "agents",
    label: "agents & ai",
    blurb: "everyone is building these. mine are smaller.",
    match:
      /\bagent\b|\bllm\b|\bai\b|\bmcp\b|computer-use|\bmemory engine\b|openclaw|hermes|\bpoke\b|\bsdk in rust\b/,
  },
  {
    key: "packaging",
    label: "package managers",
    blurb: "homebrew, without the ruby.",
    match: /\bpackage manager\b|homebrew|\bformulae\b|linuxbrew/,
  },
  {
    key: "interop",
    label: "ffi & interop",
    blurb: "the unglamorous part. it is most of the work.",
    match: /\bffi\b|\binterop\b|uniffi|bindings?\b|c-compatible|c-compiling/,
  },
  {
    key: "protocols",
    label: "protocols & networking",
    blurb: "specs nobody asked for, written anyway.",
    match:
      /\bprotocol\b|peer-to-peer|\bp2p\b|\bsync\b|\bingress\b|\be2ee\b|encrypted messaging/,
  },
  {
    key: "ui",
    label: "ui libraries",
    blurb: "someone made a nice thing for one framework. now it is on four.",
    match:
      /\bflowtoken\b|\bstreamdown\b|ditherkit|\bswiftui version\b|\bsvelte version\b|\bflutter version\b/,
  },
  {
    key: "apps",
    label: "apps & tools",
    blurb: "small things i wanted to exist.",
    match: /.*/,
  },
];

/**
 * Match order above is precedence — "browser extension" contains "browser",
 * "mcp for imap email" contains "mcp" — which is not the order a reader wants.
 * This is the reading order.
 */
const ORDER = [
  "os",
  "compilers",
  "frameworks",
  "engines",
  "agents",
  "packaging",
  "interop",
  "protocols",
  "mail",
  "extensions",
  "ui",
  "apps",
];

export function organiseProjects(
  projects: ReadonlyArray<OrganisedProject>,
): ProjectCategory[] {
  const buckets = new Map<string, ProjectCategory>();
  const seen = new Set<string>();

  for (const project of projects) {
    const name = project.name?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const nameOnly = name.toLowerCase();
    const haystack =
      `${name} ${project.desc ?? ""} ${project.href ?? ""}`.toLowerCase();
    // The catch-all sits out of the name pass, or it would claim every name.
    const rule =
      RULES.slice(0, -1).find((candidate) => candidate.match.test(nameOnly)) ??
      RULES.find((candidate) => candidate.match.test(haystack))!;

    let bucket = buckets.get(rule.key);
    if (!bucket) {
      bucket = {
        key: rule.key,
        label: rule.label,
        blurb: rule.blurb,
        items: [],
      };
      buckets.set(rule.key, bucket);
    }
    bucket.items.push(project);
  }

  return ORDER.map((key) => buckets.get(key)).filter(
    (bucket): bucket is ProjectCategory => Boolean(bucket?.items.length),
  );
}
