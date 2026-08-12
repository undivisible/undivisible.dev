import { projectKey, type ReadmeBundle } from "@/lib/profile-readme";
import { TIDBIT_CATEGORY_ORDER } from "@/components/info/constants";

export type Tidbit = {
  key: string;
  name: string;
  href: string;
  desc: string;
  stack?: string;
  opacity?: 50;
  category?: string;
};

export function readmeMiniappTidbits(readme: ReadmeBundle): Tidbit[] {
  const seen = new Set<string>();
  const out: Tidbit[] = [];
  for (const p of readme.miniapps.map((m) => ({
    name: m.name,
    href: m.href,
    desc: m.desc,
    stack: m.stack,
    category: m.category,
  }))) {
    const key = projectKey(p.name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ key, ...p });
  }
  return out;
}

export function groupTidbitsByCategory(
  tidbits: Tidbit[],
): Array<[string, Tidbit[]]> {
  const groups = new Map<string, Tidbit[]>();
  for (const t of tidbits) {
    const cat = t.category || "other";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(t);
  }
  return [...groups.entries()].sort((a, b) => {
    const ia = TIDBIT_CATEGORY_ORDER.indexOf(
      a[0] as (typeof TIDBIT_CATEGORY_ORDER)[number],
    );
    const ib = TIDBIT_CATEGORY_ORDER.indexOf(
      b[0] as (typeof TIDBIT_CATEGORY_ORDER)[number],
    );
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}