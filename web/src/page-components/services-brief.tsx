"use client";

import { DesktopRoot } from "@/components/brief/desktop/DesktopRoot";
import { MobileRoot } from "@/components/brief/mobile/MobileRoot";
import { PrintRoot } from "@/components/brief/print/PrintRoot";
import { PrintActions } from "@/components/PrintActions";

export default function ServicesBriefPage() {
  return (
    <>
      <PrintActions variant="brief" />
      <div className="screen-only hidden md:block">
        <DesktopRoot />
      </div>
      <div className="screen-only md:hidden">
        <MobileRoot />
      </div>
      <PrintRoot />
    </>
  );
}
