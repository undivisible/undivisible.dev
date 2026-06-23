export type NowContent = {
  status: string | null;
  article: string | null;
};

export function parseNowMarkdown(raw: string | null | undefined): NowContent {
  const text = raw?.trim();
  if (!text) return { status: null, article: null };

  const match = text.match(/^---\s*$/m);
  if (!match || match.index === undefined) {
    const status =
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find(Boolean) ?? null;
    return { status, article: null };
  }

  const above = text.slice(0, match.index).trim();
  const status =
    above
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean) ?? null;
  const article = text.slice(match.index + match[0].length).trim();
  return {
    status,
    article: article || null,
  };
}