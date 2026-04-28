"use client";

import { useState } from "react";

const initialState = {
  name: "",
  institution: "",
  country: "",
  task_type: "",
  modalities: "",
  volume_hours: "",
  dataset_page: "",
  access_url: "",
  paper_url: "",
  license: "",
  contact: "",
  contributor_name: "",
  contributor_email: "",
  notes: "",
};

export default function ContributionForm() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(name: keyof typeof initialState, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? "Failed to submit. Please try again.");
        return;
      }

      setMessage("Submission received. Thank you! We will review it shortly.");
      setForm(initialState);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-[#d7c8ae] bg-[#fffdf8] px-3 py-2 text-sm";
  const labelClass =
    "mb-1 block text-xs uppercase tracking-wide text-[#8a7462]";

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Dataset name *</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Institution *</label>
          <input
            className={inputClass}
            value={form.institution}
            onChange={(e) => updateField("institution", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Country *</label>
          <input
            className={inputClass}
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Volume hours</label>
          <input
            className={inputClass}
            value={form.volume_hours}
            onChange={(e) => updateField("volume_hours", e.target.value)}
            placeholder="e.g. 120"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Task type *</label>
          <input
            className={inputClass}
            value={form.task_type}
            onChange={(e) => updateField("task_type", e.target.value)}
            placeholder="comma-separated"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Modalities *</label>
          <input
            className={inputClass}
            value={form.modalities}
            onChange={(e) => updateField("modalities", e.target.value)}
            placeholder="comma-separated"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Dataset page *</label>
          <input
            className={inputClass}
            type="url"
            value={form.dataset_page}
            onChange={(e) => updateField("dataset_page", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Access URL</label>
          <input
            className={inputClass}
            type="url"
            value={form.access_url}
            onChange={(e) => updateField("access_url", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Paper URL</label>
          <input
            className={inputClass}
            type="url"
            value={form.paper_url}
            onChange={(e) => updateField("paper_url", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>License *</label>
          <input
            className={inputClass}
            value={form.license}
            onChange={(e) => updateField("license", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Maintainer contact *</label>
          <input
            className={inputClass}
            value={form.contact}
            onChange={(e) => updateField("contact", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Contributor name *</label>
          <input
            className={inputClass}
            value={form.contributor_name}
            onChange={(e) => updateField("contributor_name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Contributor email *</label>
          <input
            className={inputClass}
            type="email"
            value={form.contributor_email}
            onChange={(e) => updateField("contributor_email", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          className={`${inputClass} min-h-28`}
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </div>

      {message && (
        <p className="rounded-md border border-[#c7ddd4] bg-[#ecf8f2] px-3 py-2 text-sm text-[#2f6b56]">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-md border border-[#d7b4b1] bg-[#fff0ef] px-3 py-2 text-sm text-[#8d3d35]">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md border border-[#9f2e25] bg-[#b13a2f] px-4 py-2 text-sm text-white hover:bg-[#9f2e25] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Submitting..." : "Submit contribution"}
        </button>
      </div>
    </form>
  );
}
