import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatasetById } from "@/lib/registry";

type PageProps = {
  params: Promise<{ id: string }>;
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e8dcc8] bg-[#fffaf3] p-4">
      <p className="text-xs uppercase tracking-wide text-[#8a7462]">{label}</p>
      <p className="mt-1 text-sm text-[#3a2f2a]">{value || "not specified"}</p>
    </div>
  );
}

export default async function DatasetDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const dataset = await getDatasetById(id);

  if (!dataset) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#3a2f2a]">
      <section className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/datasets"
            className="rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-1.5 text-sm text-[#6c584d] hover:bg-[#f6ecde]"
          >
            Back
          </Link>
        </div>

        <div className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf8] p-8">
          <p className="text-sm text-[#8a7462]">Dataset details</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {dataset.name}
          </h1>
          <p className="mt-2 text-[#7a6556]">
            {dataset.institution} · {dataset.country}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <MetaRow label="Hours" value={dataset.hoursLabel} />
            <MetaRow label="License" value={dataset.license} />
            <MetaRow label="Contributor" value={dataset.contributor} />
            <MetaRow
              label="Tasks"
              value={dataset.tasks.join(", ") || "not specified"}
            />
            <MetaRow
              label="Modalities"
              value={dataset.modalities.join(", ") || "not specified"}
            />
            <MetaRow label="Contact" value={dataset.contact} />
            <MetaRow label="Publisher" value={dataset.publisher} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {dataset.datasetPage && (
              <a
                href={dataset.datasetPage}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[#9f2e25] bg-[#b13a2f] px-3 py-1.5 text-sm text-white hover:bg-[#9f2e25]"
              >
                Dataset page
              </a>
            )}
            {dataset.paperUrl && (
              <a
                href={dataset.paperUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[#9f2e25] bg-[#b13a2f] px-3 py-1.5 text-sm text-white hover:bg-[#9f2e25]"
              >
                Paper
              </a>
            )}
            {dataset.accessUrl && (
              <a
                href={dataset.accessUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[#9f2e25] bg-[#b13a2f] px-3 py-1.5 text-sm text-white hover:bg-[#9f2e25]"
              >
                Access source
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
