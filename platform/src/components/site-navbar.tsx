import Link from "next/link";

export default function SiteNavbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-[#e8dcc8] bg-[#fffaf3]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 md:px-10">
        <Link href="/" className="text-sm font-semibold tracking-wide text-[#3a2f2a]">
          KARMA-EGO
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/#supporters" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
            Supporters
          </Link>
          <Link href="/#workflow" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
            Workflow
          </Link>
          <Link href="/datasets" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
            Datasets
          </Link>
          <Link href="/#timeline" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
            Timeline
          </Link>
          <Link href="/#contribute" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
            Contribute
          </Link>
        </div>
        <Link
          href="/datasets"
          className="rounded-md border border-[#9f2e25] bg-[#b13a2f] px-3 py-1.5 text-xs text-white hover:bg-[#9f2e25] md:text-sm"
        >
          Search
        </Link>
      </div>
    </nav>
  );
}
