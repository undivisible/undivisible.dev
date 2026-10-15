/** Kept self-contained so the static renderer can inline it before any client bundle. */
export function installModeFallback(
  mode: "os" | "main",
  browser: Window = window,
) {
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
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (
        !ready &&
        (event.target === browser || tag === "SCRIPT" || tag === "LINK")
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
