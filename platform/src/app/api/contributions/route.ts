import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

type ContributionPayload = {
  name: string;
  institution: string;
  country: string;
  task_type: string;
  modalities: string;
  volume_hours: string;
  dataset_page: string;
  access_url: string;
  paper_url: string;
  license: string;
  contact: string;
  contributor_name: string;
  contributor_email: string;
  notes: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(payload: ContributionPayload) {
  const required = [
    "name",
    "institution",
    "country",
    "task_type",
    "modalities",
    "dataset_page",
    "license",
    "contact",
    "contributor_name",
    "contributor_email",
  ] as const;

  for (const field of required) {
    if (!payload[field]?.trim()) {
      return `Missing required field: ${field}`;
    }
  }

  if (!isValidEmail(payload.contributor_email.trim())) {
    return "Contributor email is invalid.";
  }

  if (payload.volume_hours && Number.isNaN(Number(payload.volume_hours))) {
    return "Volume hours must be numeric.";
  }

  return null;
}

export async function POST(request: Request) {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Contribution DB is not configured yet. Set MONGODB_URI (and optionally MONGODB_DB).",
      },
      { status: 500 },
    );
  }

  let payload: ContributionPayload;
  try {
    payload = (await request.json()) as ContributionPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const validationError = validate(payload);
  if (validationError) {
    return NextResponse.json(
      { ok: false, error: validationError },
      { status: 400 },
    );
  }

  try {
    const db = await getMongoDb();
    await db.collection("dataset_submissions").insertOne({
      name: payload.name.trim(),
      institution: payload.institution.trim(),
      country: payload.country.trim(),
      task_type: payload.task_type.trim(),
      modalities: payload.modalities.trim(),
      volume_hours: payload.volume_hours?.trim() || null,
      dataset_page: payload.dataset_page.trim(),
      access_url: payload.access_url?.trim() || null,
      paper_url: payload.paper_url?.trim() || null,
      license: payload.license.trim(),
      contact: payload.contact.trim(),
      contributor_name: payload.contributor_name.trim(),
      contributor_email: payload.contributor_email.trim(),
      notes: payload.notes?.trim() || null,
      status: "pending",
      created_at: new Date(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      { ok: false, error: `Failed to save submission: ${message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
