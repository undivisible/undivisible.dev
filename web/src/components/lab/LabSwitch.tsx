import Link from "next/link";
import { LAB_LAYOUTS, type LabSlug } from "@/data/lab-facts";

/** Layout picker, pinned bottom-centre while these studies are being compared. */
export function LabSwitch({ current }: { current: LabSlug }) {
  return (
    <nav className="lab-switch" aria-label="Layout studies">
      {LAB_LAYOUTS.map((layout, index) => (
        <Link
          key={layout.slug}
          href={layout.href}
          className="lab-switch-item"
          aria-current={layout.slug === current ? "page" : undefined}
        >
          <span className="lab-switch-index">
            {String.fromCharCode(65 + index)}
          </span>
          {layout.label}
        </Link>
      ))}
      <Link href="/" className="lab-switch-item lab-switch-out">
        live site
      </Link>
    </nav>
  );
}
