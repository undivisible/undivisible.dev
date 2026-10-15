/** Kept self-contained so the static renderer can inline it before any client bundle. */
export function installModeFallback(
  mode: "os" | "main" | "simple",
  browser: Window = window,
) {
  const paths = { os: "/lab/", main: "/main/", simple: "/simple/" };
  const key = "site:preferred-mode";
  let preferred: string | null = null;
  try {
    preferred = browser.localStorage.getItem(key);
  } catch {
    /* Storage can be disabled. */
  }
  browser.addEventListener("click", (event) => {
    const click = event as MouseEvent;
    if (
      click.button !== 0 ||
      click.metaKey ||
      click.ctrlKey ||
      click.shiftKey ||
      click.altKey
    )
      return;
    const link = (event.target as Element | null)?.closest?.(
      "a[href]",
    ) as HTMLAnchorElement | null;
    if (!link || link.target === "_blank" || link.hasAttribute("download"))
      return;
    const url = new URL(link.href, browser.location.href);
    if (url.origin !== browser.location.origin) return;
    const choice = Object.entries(paths).find(
      ([, path]) => path === url.pathname,
    )?.[0];
    if (choice)
      try {
        browser.localStorage.setItem(key, choice);
      } catch {
        /* Navigation still works without storage. */
      }
  });
  if (
    browser.location.pathname === "/" &&
    preferred &&
    Object.hasOwn(paths, preferred) &&
    preferred !== "os"
  ) {
    browser.location.replace(paths[preferred as keyof typeof paths]);
    return;
  }
  if (mode === "simple" || preferred === mode) return;
  let ready = false;
  let navigating = false;
  let timer: number | undefined;
  const next = mode === "os" ? "/main/" : "/simple/";
  const fallback = () => {
    if (navigating) return;
    navigating = true;
    browser.clearTimeout(timer);
    // The old document remains active while the next HTML response is pending.
    if (mode === "os")
      timer = browser.setTimeout(
        () => browser.location.replace("/simple/"),
        5000,
      );
    browser.location.replace(next);
  };
  const start = () => {
    if (navigating) return;
    ready = false;
    browser.clearTimeout(timer);
    timer = browser.setTimeout(fallback, mode === "os" ? 12000 : 5000);
  };
  browser.addEventListener("site:mode-ready", () => {
    if (navigating) return;
    ready = true;
    browser.clearTimeout(timer);
  });
  browser.addEventListener("site:mode-start", start);
  browser.addEventListener("site:mode-failed", fallback);
  browser.addEventListener(
    "error",
    (event) => {
      const element = event.target as
        | HTMLScriptElement
        | HTMLLinkElement
        | null;
      const tag = element?.tagName;
      const resource =
        element &&
        ("src" in element
          ? element.src
          : "href" in element
            ? element.href
            : "");
      // Third-party analytics blocked by the browser must not eject the visitor.
      const criticalAsset =
        resource &&
        new URL(resource, browser.location.href).origin ===
          browser.location.origin &&
        new URL(resource, browser.location.href).pathname.startsWith(
          "/assets/",
        );
      if (
        !ready &&
        (event.target === browser ||
          (criticalAsset && (tag === "SCRIPT" || tag === "LINK")))
      )
        fallback();
    },
    true,
  );
  browser.addEventListener("unhandledrejection", () => {
    if (!ready) fallback();
  });
  start();
}
