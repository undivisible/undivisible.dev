"use client";

import { PrintActions } from "@/components/PrintActions";
import { HomePrintRoot } from "@/components/home/print/HomePrintRoot";

export default function BriefCvPage() {
  return (
    <>
      <PrintActions variant="brief" />
      <HomePrintRoot />
    </>
  );
}
