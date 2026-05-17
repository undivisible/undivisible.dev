export type SitePrintTarget = "resume" | "brief";

export async function printSitePdf(target: SitePrintTarget) {
  document.documentElement.dataset.printTarget = target;
  await document.fonts.ready;
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  window.print();
}

export function clearSitePrintTarget() {
  delete document.documentElement.dataset.printTarget;
}
