import {
  createElement,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

export type LinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string | { pathname?: string; query?: Record<string, string> };
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean | null;
  children?: ReactNode;
};

function hrefToString(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  const pathname = href.pathname ?? "";
  const entries = Object.entries(href.query ?? {});
  if (entries.length === 0) return pathname;
  return `${pathname}?${new URLSearchParams(entries).toString()}`;
}

export default function Link({
  href,
  replace: _replace,
  scroll: _scroll,
  prefetch: _prefetch,
  children,
  ...rest
}: LinkProps): ReactNode {
  return createElement("a", { ...rest, href: hrefToString(href) }, children);
}
