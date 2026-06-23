export function contactHref(label: string, value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  switch (label) {
    case "Email":
      return `mailto:${v}`;
    case "Phone":
      return `tel:${v.replace(/[^\d+]/g, "")}`;
    case "Instagram": {
      if (/^https?:\/\//i.test(v)) return v;
      const handle = v.replace(/^@/, "");
      return `https://instagram.com/${handle}`;
    }
    case "Twitter": {
      if (/^https?:\/\//i.test(v)) return v;
      const handle = v.replace(/^@/, "");
      return `https://x.com/${handle}`;
    }
    case "GitHub": {
      if (/^https?:\/\//i.test(v)) return v;
      const path = v.replace(/^github\.com\//i, "").replace(/^\//, "");
      return path ? `https://github.com/${path}` : `https://github.com/${v}`;
    }
    default:
      return undefined;
  }
}

export function contactDisplayUsername(label: string, value: string): string {
  if (label === "GitHub" && !value.includes("@")) {
    const m = value.match(/github\.com\/([^/\s]+)/i);
    if (m) return m[1]!;
  }
  return value;
}