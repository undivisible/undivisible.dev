import { DesktopRoot } from "@/components/brief/desktop/DesktopRoot";
import { PrintRoot } from "@/components/brief/print/PrintRoot";
import { MobileRoot } from "@/components/brief/mobile/MobileRoot";

export default function BriefPage() {
  return (
    <>
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
