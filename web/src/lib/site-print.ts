export type SitePrintTarget = "resume" | "brief";

const LAYER_SELECTOR: Record<SitePrintTarget, string> = {
  resume: ".print-layer-resume .page-wrapper",
  brief: ".print-layer-brief .page-wrapper",
};

export async function waitForPrintLayer(
  target: SitePrintTarget,
  timeoutMs = 10_000,
): Promise<boolean> {
  const selector = LAYER_SELECTOR[target];
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (document.querySelector(selector)) return true;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
  return false;
}

export async function printSitePdf(target: SitePrintTarget) {
  document.documentElement.dataset.printTarget = target;
  await document.fonts.ready;
  await waitForPrintLayer(target);
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  window.print();
}

export function clearSitePrintTarget() {
  delete document.documentElement.dataset.printTarget;
}
