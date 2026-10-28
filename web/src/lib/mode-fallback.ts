/** Kept self-contained so the static renderer can inline it before any client bundle. */
export function installLabFallback(browser: Window = window) {
  let ready = false;
  let navigating = false;
  let timer: number | undefined;

  const fallback = () => {
    if (navigating) return;
    navigating = true;
    browser.clearTimeout(timer);
    browser.location.replace("/");
  };

  const start = () => {
    if (navigating) return;
    ready = false;
    browser.clearTimeout(timer);
    timer = browser.setTimeout(fallback, 12000);
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
      const criticalAsset =
        !element?.hasAttribute?.("data-optional") &&
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
