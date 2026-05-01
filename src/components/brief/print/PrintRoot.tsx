import { Page1 } from "./Page1";
import { Page2 } from "./Page2";
import { Page3 } from "./Page3";

export function PrintRoot() {
  return (
    <div className="print-only" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        @media print {
          body { background: white !important; margin: 0; }
          .page-wrapper { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
          .page-wrapper:last-child { page-break-after: auto; }
        }
      `}</style>
      {[Page1, Page2, Page3].map((Page, i) => (
        <div key={i} className="page-wrapper" style={{ flexShrink: 0 }}>
          <Page />
        </div>
      ))}
    </div>
  );
}
