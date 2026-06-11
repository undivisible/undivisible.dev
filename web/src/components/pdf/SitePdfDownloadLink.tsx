"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { SitePdfDocument } from "@/components/pdf/SitePdfDocuments";
import { sitePdfFileName, type SitePdfTarget } from "@/lib/site-pdf";

export type SitePdfDownloadLinkProps = {
  target: SitePdfTarget;
  className: string;
  children: React.ReactNode;
};

export function SitePdfDownloadLink({
  target,
  className,
  children,
}: SitePdfDownloadLinkProps) {
  return (
    <PDFDownloadLink
      document={<SitePdfDocument target={target} />}
      fileName={sitePdfFileName(target)}
      className={className}
    >
      {children}
    </PDFDownloadLink>
  );
}
