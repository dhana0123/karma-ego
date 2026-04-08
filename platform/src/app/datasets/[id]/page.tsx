import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatasetById } from "@/lib/registry";

type PageProps = {
  params: Promise<{ id: string }>;
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-800">{value || "not specified"}</p>
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
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/datasets"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Back to search
          </Link>
          <Link
            href="/"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Landing page
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <p className="text-sm text-zinc-500">Dataset details</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {dataset.name}
          </h1>
          <p className="mt-2 text-zinc-600">
            {dataset.institution} · {dataset.country}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <MetaRow label="Hours" value={dataset.hoursLabel} />
            <MetaRow label="License" value={dataset.license} />
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
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Dataset page
              </a>
            )}
            {dataset.paperUrl && (
              <a
                href={dataset.paperUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Paper
              </a>
            )}
            {dataset.accessUrl && (
              <a
                href={dataset.accessUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
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
