import ContributionForm from "@/components/contribution-form";

export default function ContributePage() {
  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#3a2f2a]">
      <section className="mx-auto w-full max-w-4xl px-6 py-14 md:px-10">
        <div className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf8] p-8">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Contribute a dataset
          </h1>
          <p className="mt-3 text-[#7a6556]">
            Submit your dataset using this form. Approved entries are reviewed
            and then added to the open YAML registry.
          </p>
          <p className="mt-2 text-sm text-[#8a7462]">
            This form stores submission metadata only. Karma-Ego does not host
            source dataset files.
          </p>
          <div className="mt-6">
            <ContributionForm />
          </div>
        </div>
      </section>
    </main>
  );
}
