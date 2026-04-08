import Link from "next/link";
import { getRegistryData } from "@/lib/registry";

export default async function Home() {
  const { stats, datasets } = await getRegistryData();
  const featuredDatasets = datasets.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#3a2f2a]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 md:px-10">
        <div className="max-w-4xl">
          <span className="inline-flex rounded-full border border-[#e8dcc8] bg-[#fffaf3] px-3 py-1 text-xs tracking-wide text-[#7a6556]">
            Open Infrastructure for Research
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
            Registry for egocentric video data research.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-[#7a6556] md:text-lg">
            Karma-Ego is a structured discovery layer for first-person datasets.
            It helps researchers quickly find relevant data, review metadata,
            and access original sources maintained by dataset owners.
          </p>
          <div className="mt-6">
            <Link
              href="/datasets"
              className="rounded-md border border-[#9f2e25] bg-[#b13a2f] px-4 py-2 text-sm text-white hover:bg-[#9f2e25]"
            >
              Search and filter datasets
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-[#e8dcc8] bg-[#fffaf3] p-6">
            <p className="text-sm text-[#7a6556]">Total Video Hours</p>
            <p className="mt-2 text-4xl font-semibold">
              {stats.totalHours.toLocaleString()}+
            </p>
            <p className="mt-2 text-sm text-[#7a6556]">
              Indexed across all listed egocentric datasets.
            </p>
          </article>

          <article className="rounded-2xl border border-[#e8dcc8] bg-[#fffaf3] p-6">
            <p className="text-sm text-[#7a6556]">Global Contributions</p>
            <p className="mt-2 text-4xl font-semibold">
              {stats.totalCountries.toLocaleString()} countries
            </p>
            <p className="mt-2 text-sm text-[#7a6556]">
              Datasets contributed by institutions worldwide.
            </p>
          </article>

          <article className="rounded-2xl border border-[#e8dcc8] bg-[#fffaf3] p-6 sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-[#7a6556]">Datasets Indexed</p>
            <p className="mt-2 text-4xl font-semibold">
              {stats.totalDatasets.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-[#7a6556]">
              Community-maintained and growing.
            </p>
          </article>
        </div>

        <section className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf8] p-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Research workflow
          </h2>
          <p className="mt-3 max-w-3xl text-[#7a6556]">
            Adapted from the project docs: Karma-Ego focuses on discovery, not
            hosting. The goal is reproducible dataset search with standardized
            metadata and direct maintainer access.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Search datasets by task type, modality, volume, and country.",
              "Review structured fields for license, papers, and access path.",
              "Contact dataset maintainers directly for official access.",
              "Contribute new datasets with a simple YAML pull request.",
            ].map((step) => (
              <article
                key={step}
                className="rounded-xl border border-[#e8dcc8] bg-[#fffaf3] p-4 text-sm text-[#5f4a3f]"
              >
                {step}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf8] p-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Featured datasets
          </h2>
          <p className="mt-3 max-w-3xl text-[#7a6556]">
            Live entries sampled from `registry/datasets`.
          </p>
          <div className="mt-6 grid gap-3">
            {featuredDatasets.map((dataset) => (
              <article
                key={`${dataset.name}-${dataset.institution}`}
                className="flex flex-col gap-3 rounded-xl border border-[#e8dcc8] bg-[#fffaf3] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-[#3a2f2a]">{dataset.name}</p>
                  <p className="mt-1 text-sm text-[#7a6556]">
                    {dataset.institution} · {dataset.country} ·{" "}
                    {dataset.hoursLabel}
                  </p>
                </div>
                <Link
                  href={`/datasets/${dataset.id}`}
                  className="w-fit rounded-md border border-[#9f2e25] bg-[#b13a2f] px-3 py-1.5 text-sm text-white hover:bg-[#9f2e25]"
                >
                  View details
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8dcc8] bg-[#fffaf3] p-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Contribute dataset metadata
          </h2>
          <p className="mt-3 max-w-3xl text-[#7a6556]">
            Add a YAML file in `registry/datasets` so the community can discover
            your dataset in a consistent schema.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-[#e8dcc8] bg-[#fffdf8] p-4 text-sm text-[#5f4a3f]">{`name: Your Dataset Name
institution: University / Research Lab / Company
dataset_page: https://your-dataset-page.com
volume_hours: 120
modalities: [rgb, depth, imu, gaze]
license: CC BY 4.0
paper_url: https://arxiv.org/abs/xxxx.xxxxx
access_url: https://your-dataset-page.com
contact: maintainer@institution.edu
country: Your Country
task_type: [task name, activity type]
data_type: egocentric video
publisher: https://your-publisher-url.com`}</pre>
        </section>
      </section>
    </main>
  );
}
