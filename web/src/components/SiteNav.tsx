import Link from "next/link";

type SiteNavProps = {
  onPrintResume: () => void;
};

export function SiteNav({ onPrintResume }: SiteNavProps) {
  return (
    <div className="site-mode-navigation screen-only">
      <nav aria-label="Site navigation">
        <Link href="/lab/" aria-label="Open OS mode">
          OS
        </Link>
        <Link href="/agent">agent</Link>
        <button type="button" onClick={onPrintResume}>
          resume
        </button>
      </nav>
    </div>
  );
}
