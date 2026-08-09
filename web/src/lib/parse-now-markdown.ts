export type NowLocation = {
  /** Display label for the clock, e.g. "hong kong". */
  label: string;
  /** Fixed offset from UTC in minutes, e.g. 180 for GMT+3. */
  utcOffsetMinutes: number;
};

export type NowContent = {
  status: string | null;
  article: string | null;
  /** Where I am right now, from the now.md frontmatter. */
  location: NowLocation;
};

/**
 * Used when now.md carries no frontmatter. Being nomadic, this is a starting
 * point rather than a home — edit the block at the top of now.md to move it.
 */
export const DEFAULT_NOW_LOCATION: NowLocation = {
  label: "hong kong",
  utcOffsetMinutes: 480,
};

/**
 * Accepts `+3`, `-4`, `+05:45`, `GMT+3`, `UTC-4:30`, `+0530`.
 * Returns minutes east of UTC, or null when unparseable.
 */
export function parseUtcOffset(raw: string): number | null {
  const text = raw.trim().replace(/^(gmt|utc)\s*/i, "");
  const match = text.match(/^([+-]?)(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return null;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = match[3] ? Number(match[3]) : 0;
  if (hours > 14 || minutes > 59) return null;
  return sign * (hours * 60 + minutes);
}

/** `180` → `"GMT+3"`, `-270` → `"GMT-4:30"`, `0` → `"GMT"`. */
export function formatUtcOffset(utcOffsetMinutes: number): string {
  if (utcOffsetMinutes === 0) return "GMT";
  const sign = utcOffsetMinutes < 0 ? "-" : "+";
  const total = Math.abs(utcOffsetMinutes);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

const FRONTMATTER = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

function parseFrontmatter(text: string): {
  location: NowLocation;
  rest: string;
} {
  const match = text.match(FRONTMATTER);
  if (!match) return { location: DEFAULT_NOW_LOCATION, rest: text };

  let label = DEFAULT_NOW_LOCATION.label;
  let utcOffsetMinutes = DEFAULT_NOW_LOCATION.utcOffsetMinutes;

  for (const line of match[1]!.split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line
      .slice(colon + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (!value) continue;
    if (key === "location") label = value;
    else if (key === "offset" || key === "utc" || key === "gmt") {
      const parsed = parseUtcOffset(value);
      if (parsed !== null) utcOffsetMinutes = parsed;
    }
  }

  return {
    location: { label, utcOffsetMinutes },
    rest: text.slice(match[0].length),
  };
}

export function parseNowMarkdown(raw: string | null | undefined): NowContent {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return { status: null, article: null, location: DEFAULT_NOW_LOCATION };
  }

  const { location, rest } = parseFrontmatter(trimmed);
  const text = rest.trim();
  if (!text) return { status: null, article: null, location };

  const firstLine = (block: string) =>
    block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? null;

  const match = text.match(/^---\s*$/m);
  if (!match || match.index === undefined) {
    return { status: firstLine(text), article: null, location };
  }

  const article = text.slice(match.index + match[0].length).trim();
  return {
    status: firstLine(text.slice(0, match.index).trim()),
    article: article || null,
    location,
  };
}
