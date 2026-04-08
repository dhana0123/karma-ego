import Link from "next/link";
import { getRegistryData } from "@/lib/registry";

export default async function Home() {
  const { stats, datasets } = await getRegistryData();
  const featuredDatasets = datasets.slice(0, 6);
  const maintainerConfirmed = datasets.filter(
    (dataset) => dataset.listedWithPermission,
  ).length;
  const acknowledgements = datasets
    .filter((dataset) => dataset.contributor || dataset.contact)
    .slice(0, 6);
  const supportersByInstitution = datasets.reduce<
    Record<
      string,
      {
        institution: string;
        institutionUrl: string;
        members: Array<{
          person: string;
          role: string;
          dataset: string;
          profileUrl: string;
        }>;
      }
    >
  >((acc, dataset) => {
    const key = dataset.institution || "Unknown Institution";
    const institutionUrl =
      dataset.publisher || dataset.datasetPage || dataset.accessUrl || "";
    const contact = dataset.contact || "";
    const isEmailContact =
      contact.includes("@") && !contact.includes(" ") && !contact.includes("+91");
    const person = dataset.contributor || (isEmailContact ? contact : "");

    if (!person) {
      return acc;
    }

    if (!acc[key]) {
      acc[key] = {
        institution: key,
        institutionUrl,
        members: [],
      };
    }

    acc[key].members.push({
      person,
      role: dataset.contributor ? "Contributor" : "Maintainer",
      dataset: dataset.name,
      profileUrl: dataset.paperUrl || dataset.datasetPage || "",
    });

    return acc;
  }, {});
  const supporterGroups = Object.values(supportersByInstitution).slice(0, 6);
  const supporterMarquee =
    supporterGroups.length > 0 ? [...supporterGroups, ...supporterGroups] : [];

  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#3a2f2a]">
      <nav className="sticky top-0 z-20 border-b border-[#e8dcc8] bg-[#fffaf3]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 md:px-10">
          <Link href="/" className="text-sm font-semibold tracking-wide text-[#3a2f2a]">
            KARMA-EGO
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            <a href="#supporters" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
              Supporters
            </a>
            <a href="#workflow" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
              Workflow
            </a>
            <a href="#featured" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
              Datasets
            </a>
            <a href="#timeline" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
              Timeline
            </a>
            <a href="#contribute" className="text-sm text-[#7a6556] hover:text-[#9f2e25]">
              Contribute
            </a>
          </div>
          <Link
            href="/datasets"
            className="rounded-md border border-[#9f2e25] bg-[#b13a2f] px-3 py-1.5 text-xs text-white hover:bg-[#9f2e25] md:text-sm"
          >
            Search
          </Link>
        </div>
      </nav>
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
            <p className="text-sm text-[#7a6556]">Maintainer Confirmed</p>
            <p className="mt-2 text-4xl font-semibold">
              {maintainerConfirmed.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-[#7a6556]">
              Listings with explicit contributor permission.
            </p>
          </article>
        </div>

        <section
          id="supporters"
          className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf8] p-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Supporting researchers and institutions
          </h2>
          <p className="mt-3 max-w-3xl text-[#7a6556]">
            Researchers and labs who approved listing, verified metadata, or
            provided contributor support for Karma-Ego.
          </p>
          <div className="mt-2 text-xs text-[#8a7462]">
            Names and links are shown from publicly available metadata.
          </div>
          <div className="supporters-marquee-shell mt-6">
            <div className="supporters-marquee-track">
              {supporterMarquee.map((group, index) => (
                <article
                  key={`support-${group.institution}-${index}`}
                  className="w-[300px] shrink-0 rounded-xl border border-[#e8dcc8] bg-[#fffaf3] p-4"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#3a2f2a]">
                      {group.institution}
                    </p>
                    {group.institutionUrl && (
                      <a
                        href={group.institutionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#9f2e25] hover:underline"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                  <div className="mt-3 space-y-3">
                    {group.members.slice(0, 4).map((member) => (
                      <div key={`${group.institution}-${member.person}-${member.dataset}`}>
                        <p className="text-sm text-[#5f4a3f]">
                          {member.person}{" "}
                          <span className="text-xs text-[#8a7462]">
                            ({member.role})
                          </span>
                        </p>
                        <p className="text-xs text-[#7a6556]">{member.dataset}</p>
                        {member.profileUrl && (
                          <a
                            href={member.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#9f2e25] hover:underline"
                          >
                            profile / paper link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf8] p-8"
        >
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

        <section
          id="featured"
          className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf8] p-8"
        >
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

        <section
          id="timeline"
          className="py-1"
        >
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Project timeline
          </h2>
          <div className="mt-4 space-y-0">
            {[
              {
                title: "Foundation",
                detail: "Karma-Ego launched as an open egocentric registry.",
              },
              {
                title: "Index growth",
                detail: `${stats.totalDatasets.toLocaleString()} datasets currently structured in one registry.`,
              },
              {
                title: "Global reach",
                detail: `${stats.totalCountries.toLocaleString()} countries represented in indexed records.`,
              },
              {
                title: "CLI workflow",
                detail: "One-command search, filter, compare, and source access.",
              },
              {
                title: "Ongoing",
                detail: "Maintainer outreach and permission-confirmed listings.",
              },
            ].map((step, index, arr) => (
              <article key={step.title} className="grid grid-cols-[30px_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#9f2e25] bg-[#b13a2f] text-[10px] font-semibold text-white">
                    {index + 1}
                  </div>
                  {index < arr.length - 1 && (
                    <div className="my-1 h-full w-px bg-[#d8c7b0]" />
                  )}
                </div>
                <div className="pb-3">
                  <div className="rounded-lg border border-[#e8dcc8] bg-[#fffaf3] p-3">
                    <p className="text-xs font-semibold text-[#3a2f2a]">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#5f4a3f]">{step.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf8] p-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Researcher acknowledgements
          </h2>
          <p className="mt-3 max-w-3xl text-[#7a6556]">
            Researchers and contributors who shared data listings, metadata, or
            confirmation support.
          </p>
          <div className="mt-6 grid gap-3">
            {acknowledgements.map((dataset) => (
              <article
                key={`ack-${dataset.id}`}
                className="rounded-xl border border-[#e8dcc8] bg-[#fffaf3] p-4"
              >
                <p className="text-sm font-medium text-[#3a2f2a]">{dataset.name}</p>
                <p className="mt-1 text-sm text-[#7a6556]">
                  {dataset.contributor ||
                    (dataset.contact.includes("@") ? dataset.contact : "Contributor")}
                </p>
                <p className="text-xs text-[#8a7462]">{dataset.institution}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contribute"
          className="rounded-2xl border border-[#e8dcc8] bg-[#fffaf3] p-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Transparency and governance
          </h2>
          <div className="mt-4 grid gap-3">
            {[
              "Karma-Ego is a discovery and access layer, not a data host.",
              "Each listing points to the original dataset owner or publisher.",
              "Metadata is community-maintained through pull requests.",
              "Maintainers can request corrections or removal at any time.",
              "Licensing and usage rights remain with original dataset owners.",
            ].map((line) => (
              <article
                key={line}
                className="rounded-xl border border-[#e8dcc8] bg-[#fffdf8] p-4 text-sm text-[#5f4a3f]"
              >
                {line}
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
