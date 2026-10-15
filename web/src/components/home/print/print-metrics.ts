export const PAGE_W = "210mm";
export const PAGE_H = "297mm";

export function pt(n: number) {
  return Math.round(n * 1.25 * 10) / 10;
}

export const CHROME = { tb: pt(6), ft: pt(5.5) };

export const EXP_PAGE = {
  sectionTitle: pt(6.3),
  role: pt(10.7),
  time: pt(6.3),
  bullet: pt(6.1),
  subTitle: pt(6.2),
  productLine: pt(7),
};

export const PRINT_RESUME_STYLES = (cream: string) => `
  @page { size: A4; margin: 0; background: ${cream}; }
  @media print {
    html, body { background: ${cream} !important; margin: 0 !important; }
    .page-wrapper {
      box-shadow: none !important;
      margin: 0 !important;
      width: 210mm !important;
      height: auto !important;
      min-height: 297mm;
      overflow: visible !important;
      page-break-after: always;
      break-after: page;
    }
    .page-wrapper > div { height: auto !important; min-height: 297mm; }
    .page-wrapper div { overflow: visible !important; }
    .page-wrapper:last-child {
      page-break-after: auto !important;
      break-after: auto;
    }
  }
`;
