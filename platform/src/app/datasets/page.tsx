import Link from "next/link";
import { getRegistryData } from "@/lib/registry";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    country?: string;
    modality?: string;
    task?: string;
    institution?: string;
    license?: string;
    minHours?: string;
    maxHours?: string;
    sort?: string;
  }>;
};

function includesIgnoreCase(values: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return values.some((value) => value.toLowerCase().includes(q));
}

export default async function DatasetsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const country = params.country?.trim() ?? "";
  const modality = params.modality?.trim() ?? "";
  const task = params.task?.trim() ?? "";
  const institution = params.institution?.trim() ?? "";
  const license = params.license?.trim() ?? "";
  const sort = params.sort?.trim() ?? "name-asc";

  const { datasets } = await getRegistryData();
  const maxAvailableHours = Math.max(
    1,
    ...datasets.map((dataset) => dataset.hours ?? 0),
  );
  const minHours = Math.max(0, Number(params.minHours ?? "0"));
  const maxHours = Math.min(
    maxAvailableHours,
    Number(params.maxHours ?? String(maxAvailableHours)),
  );

  const countries = Array.from(
    new Set(datasets.flatMap((dataset) => dataset.countries)),
  ).sort((a, b) => a.localeCompare(b));
  const modalities = Array.from(
    new Set(datasets.flatMap((dataset) => dataset.modalities)),
  ).sort((a, b) => a.localeCompare(b));
  const tasks = Array.from(
    new Set(datasets.flatMap((dataset) => dataset.tasks)),
  ).sort((a, b) => a.localeCompare(b));
  const institutions = Array.from(
    new Set(datasets.map((dataset) => dataset.institution).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  const licenses = Array.from(
    new Set(datasets.map((dataset) => dataset.license).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const filtered = datasets.filter((dataset) => {
    const matchesQ =
      !q ||
      includesIgnoreCase(
        [
          dataset.name,
          dataset.institution,
          dataset.country,
          dataset.license,
          ...dataset.tasks,
          ...dataset.modalities,
        ],
        q,
      );
    const matchesCountry = !country || dataset.countries.includes(country);
    const matchesModality = !modality || dataset.modalities.includes(modality);
    const matchesTask = !task || dataset.tasks.includes(task);
    const matchesInstitution =
      !institution || dataset.institution === institution;
    const matchesLicense = !license || dataset.license === license;
    const hours = dataset.hours ?? 0;
    const matchesHours = hours >= minHours && hours <= maxHours;

    return (
      matchesQ &&
      matchesCountry &&
      matchesModality &&
      matchesTask &&
      matchesInstitution &&
      matchesLicense &&
      matchesHours
    );
  });
  const filteredSorted = [...filtered].sort((a, b) => {
    if (sort === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    if (sort === "hours-desc") {
      return (b.hours ?? -1) - (a.hours ?? -1);
    }
    if (sort === "hours-asc") {
      return (a.hours ?? Number.MAX_SAFE_INTEGER) - (b.hours ?? Number.MAX_SAFE_INTEGER);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#3a2f2a]">
      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Search and filter datasets
            </h1>
            <p className="mt-2 text-[#7a6556]">
              Find egocentric datasets by task, modality, country, and keywords.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-[#d7c8ae] bg-[#fffaf3] px-3 py-1.5 text-sm text-[#6c584d] hover:bg-[#f6ecde]"
          >
            Back to landing
          </Link>
        </div>

        <div className="mt-2 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-xl border border-[#e8dcc8] bg-[#fffaf3] p-4 lg:sticky lg:top-6">
            <form className="grid gap-3">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#8a7462]">
                  Keyword
                </label>
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Name, institution, task..."
                  className="w-full rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#8a7462]">
                  Country
                </label>
                <select
                  name="country"
                  defaultValue={country}
                  className="w-full rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-2 text-sm"
                >
                  <option value="">All countries</option>
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#8a7462]">
                  Modality
                </label>
                <select
                  name="modality"
                  defaultValue={modality}
                  className="w-full rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-2 text-sm"
                >
                  <option value="">All modalities</option>
                  {modalities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#8a7462]">
                  Task
                </label>
                <select
                  name="task"
                  defaultValue={task}
                  className="w-full rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-2 text-sm"
                >
                  <option value="">All tasks</option>
                  {tasks.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#8a7462]">
                  Institution
                </label>
                <select
                  name="institution"
                  defaultValue={institution}
                  className="w-full rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-2 text-sm"
                >
                  <option value="">All institutions</option>
                  {institutions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#8a7462]">
                  License
                </label>
                <select
                  name="license"
                  defaultValue={license}
                  className="w-full rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-2 text-sm"
                >
                  <option value="">All licenses</option>
                  {licenses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-[#8a7462]">
                  <label>Min hours</label>
                  <span>{minHours}</span>
                </div>
                <input
                  type="range"
                  name="minHours"
                  min={0}
                  max={maxAvailableHours}
                  defaultValue={minHours}
                  className="w-full accent-[#b13a2f]"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-[#8a7462]">
                  <label>Max hours</label>
                  <span>{maxHours}</span>
                </div>
                <input
                  type="range"
                  name="maxHours"
                  min={0}
                  max={maxAvailableHours}
                  defaultValue={maxHours}
                  className="w-full accent-[#b13a2f]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#8a7462]">
                  Sort by
                </label>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="w-full rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-2 text-sm"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="hours-desc">Hours (high to low)</option>
                  <option value="hours-asc">Hours (low to high)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="rounded-md border border-[#9f2e25] bg-[#b13a2f] px-4 py-2 text-sm text-white hover:bg-[#9f2e25]"
                >
                  Apply
                </button>
                <Link
                  href="/datasets"
                  className="rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-4 py-2 text-sm text-[#6c584d] hover:bg-[#f6ecde]"
                >
                  Clear
                </Link>
              </div>
            </form>
          </aside>

          <section>
            <p className="text-sm text-[#7a6556]">
              {filteredSorted.length} dataset(s) found
            </p>

            <div className="mt-4 grid gap-3">
              {filteredSorted.map((dataset) => (
                <article
                  key={dataset.id}
                  className="rounded-xl border border-[#e8dcc8] bg-[#fffdf8] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-medium">{dataset.name}</h2>
                      <p className="mt-1 text-sm text-[#7a6556]">
                        {dataset.institution} · {dataset.country} ·{" "}
                        {dataset.hoursLabel}
                      </p>
                      <p className="mt-2 text-sm text-[#7a6556]">
                        Tasks: {dataset.tasks.join(", ") || "not specified"}
                      </p>
                      <p className="text-sm text-[#7a6556]">
                        Modalities:{" "}
                        {dataset.modalities.join(", ") || "not specified"}
                      </p>
                    </div>
                    <Link
                      href={`/datasets/${dataset.id}`}
                      className="w-fit rounded-md border border-[#9f2e25] bg-[#b13a2f] px-3 py-1.5 text-sm text-white hover:bg-[#9f2e25]"
                    >
                      Open details
                    </Link>
                  </div>
                </article>
              ))}
              {filteredSorted.length === 0 && (
                <article className="rounded-xl border border-[#e8dcc8] bg-[#fffaf3] p-6 text-sm text-[#7a6556]">
                  No datasets match these filters. Try clearing one or two
                  controls.
                </article>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
