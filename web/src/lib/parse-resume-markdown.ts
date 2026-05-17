export type ResumeContactRow = [string, string];

export type ResumeListItem = {
  name: string;
  href: string;
  meta: string;
  desc: string;
  stack: string;
};

export type ResumeSubsection = {
  title: string;
  items: ResumeListItem[];
};

export type ResumeJob = {
  role: string;
  org: string;
  time: string;
  bullets: string[];
  subsections: ResumeSubsection[];
};

export type ResumeExperience = ResumeJob & {
  points: string[];
};

export type ResumeProject = {
  name: string;
  href: string;
  desc: string;
  stack?: string;
};

export type ResumeProjectSection = {
  title: string;
  intro: string;
  items: ResumeListItem[];
};

export type ResumeDocument = {
  nameLine: string;
  titleLine: string;
  siteHref: string;
  summary: string;
  contact: ResumeContactRow[];
  experience: ResumeJob[];
  projectSections: ResumeProjectSection[];
  skills: ResumeContactRow[];
  education: string[];
  humanLanguages: string[];
  community: string[];
  interests: string[];
};

function collapseWs(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function stripInlineMd(text: string): string {
  return collapseWs(
    text
      .replace(/\*Built with:\s*([^*]+)\*/gi, "")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1"),
  );
}

function parsePrimaryName(line: string): { name: string; href: string } {
  const link = line.match(/^\*\*\[([^\]]+)\]\((https?:\/\/[^)]+)\)\*\*/);
  if (link) {
    return { name: link[1]!.trim(), href: link[2]!.trim() };
  }
  const bold = line.match(/^\*\*([^*]+)\*\*/);
  if (bold) {
    return { name: bold[1]!.trim(), href: "" };
  }
  const plain = line.match(/^([^·•]+)/);
  return { name: (plain?.[1] ?? line).trim(), href: "" };
}

function parseStack(line: string): string {
  const m = line.match(/\*Built with:\s*([^*]+)\*/i);
  return m ? collapseWs(m[1]!) : "";
}

function parseListItem(line: string): ResumeListItem | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("- ")) return null;

  const stack = parseStack(trimmed);
  let body = trimmed.slice(2).replace(/\*Built with:[^*]+\*/i, "").trim();

  const dash = body.match(/\s[—–]\s/);
  let meta = "";
  let desc = body;
  if (dash) {
    const idx = body.search(/\s[—–]\s/);
    meta = stripInlineMd(body.slice(0, idx));
    desc = stripInlineMd(body.slice(idx).replace(/^\s*[—–]\s/, ""));
  } else {
    desc = stripInlineMd(body);
  }

  const primary = parsePrimaryName(body);
  return {
    name: primary.name,
    href: primary.href,
    meta,
    desc,
    stack,
  };
}

function parseJobHeader(line: string): { role: string; org: string } {
  const t = line.replace(/^###\s+/, "").trim();
  const parts = t.split(/\s[—–]\s/);
  if (parts.length >= 2) {
    return { role: parts[0]!.trim(), org: parts.slice(1).join(" — ").trim() };
  }
  return { role: t, org: "" };
}

function parseContactTable(lines: string[]): ResumeContactRow[] {
  const rows: ResumeContactRow[] = [];
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    if (line.includes("---")) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length >= 2) {
      rows.push([cells[0]!, cells[1]!]);
    }
  }
  return rows;
}

function parseSkillsTable(lines: string[]): ResumeContactRow[] {
  const rows: ResumeContactRow[] = [];
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    if (line.includes("---")) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length >= 2 && cells[0] !== "Area") {
      rows.push([cells[0]!, cells[1]!]);
    }
  }
  return rows;
}

function parseBullets(lines: string[]): string[] {
  return lines
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => stripInlineMd(l.trim().slice(2)));
}

function parseDotLineSection(lines: string[], start: number): { items: string[]; next: number } {
  let i = start;
  while (i < lines.length && !lines[i]!.trim()) i++;
  const parts: string[] = [];
  while (i < lines.length && lines[i]!.trim() && !lines[i]!.startsWith("## ")) {
    parts.push(collapseWs(lines[i]!));
    i++;
  }
  const items = parts
    .join(" ")
    .split(/\s*·\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { items, next: i };
}

function isSubsectionTitle(line: string): boolean {
  const t = line.trim();
  return t.startsWith("**") && t.endsWith("**") && !t.startsWith("- ");
}

function subsectionTitle(line: string): string {
  return line.trim().replace(/^\*\*|\*\*$/g, "");
}

export function parseResumeMarkdown(md: string): ResumeDocument {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const nameLine = (lines[0] ?? "").replace(/^#\s+/, "").trim();
  const titleRaw = lines[2] ?? "";
  const titleMatch = titleRaw.match(
    /\*\*([^*]+)\*\*\s*·\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/,
  );
  const titleLine = titleMatch?.[1] ?? stripInlineMd(titleRaw);
  const siteHref = titleMatch?.[3] ?? "https://undivisible.dev";
  const summary = collapseWs(
    (lines[4] ?? "").replace(/^\[([^\]]+)\]\([^)]+\)\s*/, ""),
  );

  let i = 0;
  while (i < lines.length && !lines[i]!.startsWith("## Contact")) i++;
  i++;
  const contactLines: string[] = [];
  while (i < lines.length && !lines[i]!.startsWith("## ")) {
    contactLines.push(lines[i]!);
    i++;
  }

  const contact = parseContactTable(contactLines);

  const experience: ResumeJob[] = [];
  const projectSections: ResumeProjectSection[] = [];
  let skills: ResumeContactRow[] = [];
  let education: string[] = [];
  let humanLanguages: string[] = [];
  let community: string[] = [];
  let interests: string[] = [];

  while (i < lines.length) {
    const line = lines[i]!;
    if (line.startsWith("## Experience")) {
      i++;
      while (i < lines.length && !lines[i]!.startsWith("## ")) {
        if (lines[i]!.startsWith("### ")) {
          const { role, org } = parseJobHeader(lines[i]!);
          i++;
          while (i < lines.length && !lines[i]!.trim()) i++;
          let time = "";
          if (lines[i]?.trim().startsWith("*")) {
            time = lines[i]!.trim().replace(/^\*|\*$/g, "");
            i++;
          }
          const block: string[] = [];
          while (i < lines.length && !lines[i]!.startsWith("### ") && !lines[i]!.startsWith("## ")) {
            block.push(lines[i]!);
            i++;
          }
          const bullets: string[] = [];
          const subsections: ResumeSubsection[] = [];
          let currentSub: ResumeSubsection | null = null;
          for (const bl of block) {
            if (isSubsectionTitle(bl)) {
              if (currentSub) subsections.push(currentSub);
              currentSub = { title: subsectionTitle(bl), items: [] };
              continue;
            }
            const item = parseListItem(bl);
            if (item && currentSub) {
              currentSub.items.push(item);
              continue;
            }
            if (bl.trim().startsWith("- ")) {
              bullets.push(stripInlineMd(bl.trim().slice(2)));
            }
          }
          if (currentSub) subsections.push(currentSub);
          experience.push({ role, org, time, bullets, subsections });
          continue;
        }
        i++;
      }
      continue;
    }

    if (line.startsWith("## Skills")) {
      i++;
      const block: string[] = [];
      while (i < lines.length && !lines[i]!.startsWith("## ")) {
        block.push(lines[i]!);
        i++;
      }
      skills = parseSkillsTable(block);
      continue;
    }

    if (line.startsWith("## Education")) {
      i++;
      while (i < lines.length && !lines[i]!.startsWith("## ")) {
        if (lines[i]!.trim().startsWith("- ")) {
          education.push(stripInlineMd(lines[i]!.trim().slice(2)));
        }
        i++;
      }
      continue;
    }

    if (line.startsWith("## Languages")) {
      const parsed = parseDotLineSection(lines, i + 1);
      humanLanguages = parsed.items;
      i = parsed.next;
      continue;
    }

    if (line.startsWith("## Community")) {
      i++;
      while (i < lines.length && !lines[i]!.startsWith("## ")) {
        if (lines[i]!.trim().startsWith("- ")) {
          community.push(stripInlineMd(lines[i]!.trim().slice(2)));
        }
        i++;
      }
      continue;
    }

    if (line.startsWith("## Interests")) {
      const parsed = parseDotLineSection(lines, i + 1);
      interests = parsed.items;
      i = parsed.next;
      continue;
    }

    if (line.startsWith("## ")) {
      const title = line.replace(/^##\s+/, "").trim();
      i++;
      const introParts: string[] = [];
      const items: ResumeListItem[] = [];
      while (i < lines.length && !lines[i]!.startsWith("## ")) {
        const cur = lines[i]!;
        if (cur.startsWith("### ")) {
          const h3 = stripInlineMd(cur.replace(/^###\s+/, ""));
          if (h3) introParts.push(h3);
          i++;
          while (
            i < lines.length &&
            !lines[i]!.startsWith("## ") &&
            !lines[i]!.startsWith("### ")
          ) {
            const item = parseListItem(lines[i]!);
            if (item) items.push(item);
            i++;
          }
          continue;
        }
        const item = parseListItem(cur);
        if (item) {
          items.push(item);
        } else if (cur.trim() && !cur.trim().startsWith("*Status*")) {
          const t = stripInlineMd(cur);
          if (t) introParts.push(t);
        }
        i++;
      }
      if (items.length > 0 || introParts.length > 0) {
        projectSections.push({
          title,
          intro: introParts.join(" — "),
          items,
        });
      }
      continue;
    }

    i++;
  }

  return {
    nameLine,
    titleLine,
    siteHref,
    summary,
    contact,
    experience,
    projectSections,
    skills,
    education,
    humanLanguages,
    community,
    interests,
  };
}

export function resumeItemKey(
  item: Pick<ResumeListItem, "name" | "href">,
  index?: number,
): string {
  const name = item.name.trim().toLowerCase();
  const href = item.href.trim().toLowerCase();
  if (href) return `${href}::${name}`;
  if (index != null) return `name::${name}::${index}`;
  return `name::${name}`;
}

export type ProjectPageBlock =
  | { kind: "section"; title: string; intro?: string }
  | { kind: "item"; item: ResumeListItem; section: string };

export function packProjectPages(
  sections: ResumeProjectSection[],
  itemsPerPage = 18,
): ProjectPageBlock[][] {
  const pages: ProjectPageBlock[][] = [];
  let page: ProjectPageBlock[] = [];
  let count = 0;

  for (const section of sections) {
    let headingPlaced = false;
    for (const item of section.items) {
      if (count > 0 && count % itemsPerPage === 0) {
        pages.push(page);
        page = [];
        count = 0;
        headingPlaced = false;
      }
      if (!headingPlaced) {
        page.push({
          kind: "section",
          title: section.title,
          intro:
            pages.length === 0 && page.length === 0 ? section.intro : undefined,
        });
        headingPlaced = true;
      }
      page.push({ kind: "item", item, section: section.title });
      count++;
    }
  }
  if (page.length) pages.push(page);
  return pages;
}

export function flattenPrintProjects(doc: ResumeDocument): ResumeListItem[] {
  const out: ResumeListItem[] = [];
  const seen = new Set<string>();
  for (const job of doc.experience) {
    for (const sub of job.subsections) {
      for (const item of sub.items) {
        const key = `${item.name}:${item.href}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(item);
      }
    }
  }
  for (const section of doc.projectSections) {
    for (const item of section.items) {
      const key = `${item.name}:${item.href}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}
