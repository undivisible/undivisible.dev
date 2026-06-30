export function safeExternalHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return "#";
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    /* invalid */
  }
  return "#";
}