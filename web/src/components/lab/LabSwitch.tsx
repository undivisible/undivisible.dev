import Link from "next/link";
import { LAB_LAYOUTS, type LabSlug } from "@/data/lab-facts";

/**
 * Layout picker, pinned bottom-centre while these studies are being compared.
 *
 * With `onSelect` it swaps in place instead of navigating — which is what the
 * single-file share build needs, since there are no sibling routes to link to
 * once the page has been lifted out of the site.
 */
export function LabSwitch({
  current,
  onSelect,
}: {
  current: LabSlug;
  onSelect?: (slug: LabSlug) => void;
}) {
  return (
    <nav className="lab-switch" aria-label="Layout studies">
      {LAB_LAYOUTS.map((layout, index) => {
        const inner = (
          <>
            <span className="lab-switch-index">
              {String.fromCharCode(65 + index)}
            </span>
            {layout.label}
          </>
        );
        const isCurrent = layout.slug === current;

        return onSelect ? (
          <button
            key={layout.slug}
            type="button"
            className="lab-switch-item"
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => onSelect(layout.slug)}
          >
            {inner}
          </button>
        ) : (
          <Link
            key={layout.slug}
            href={layout.href}
            className="lab-switch-item"
            aria-current={isCurrent ? "page" : undefined}
          >
            {inner}
          </Link>
        );
      })}
      {onSelect ? null : (
        <Link href="/" className="lab-switch-item lab-switch-out">
          live site
        </Link>
      )}
    </nav>
  );
}
