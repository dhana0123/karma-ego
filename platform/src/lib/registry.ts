import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

export type DatasetRecord = {
  id: string;
  name: string;
  institution: string;
  country: string;
  countries: string[];
  hours: number | null;
  hoursLabel: string;
  modalities: string[];
  tasks: string[];
  license: string;
  datasetPage: string;
  accessUrl: string;
  paperUrl: string;
  contact: string;
  publisher: string;
};

export type RegistryStats = {
  totalHours: number;
  totalDatasets: number;
  totalCountries: number;
};

export type RegistryData = {
  stats: RegistryStats;
  datasets: DatasetRecord[];
};

function extractSingleValue(content: string, key: string) {
  const directMatch = content.match(
    new RegExp(`^\\s*${key}\\s*:\\s*([^\\n\\r]+)`, "m"),
  );
  if (directMatch) {
    return directMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  const listRootMatch = content.match(
    new RegExp(`^\\s*-\\s*${key}\\s*:\\s*([^\\n\\r]+)`, "m"),
  );
  if (listRootMatch) {
    return listRootMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  return "";
}

function extractListValues(content: string, key: string) {
  const inlineRaw = extractSingleValue(content, key);
  if (inlineRaw.startsWith("[") && inlineRaw.endsWith("]")) {
    return inlineRaw
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  const blockRegex = new RegExp(
    `^\\s*(?:-\\s*)?${key}\\s*:\\s*\\n((?:\\s+-\\s*[^\\n\\r]+\\n?)*)`,
    "m",
  );
  const blockMatch = content.match(blockRegex);
  if (!blockMatch || !blockMatch[1].trim()) {
    return inlineRaw ? [inlineRaw] : [];
  }

  return blockMatch[1]
    .split("\n")
    .map((line) => line.match(/^\s*-\s*(.+)\s*$/)?.[1] ?? "")
    .map((value) => value.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function normalizeDataset(fileName: string, content: string): DatasetRecord {
  const fileId = fileName.replace(/\.ya?ml$/i, "");
  const id = extractSingleValue(content, "id") || fileId;
  const name = extractSingleValue(content, "name") || fileId;
  const institution = extractSingleValue(content, "institution") || "Unknown";
  const countries = extractListValues(content, "country");
  const country = countries.join(", ") || "Global";
  const tasks = extractListValues(content, "tasks");
  const fallbackTasks = extractListValues(content, "task_type");
  const modalities = extractListValues(content, "modalities");
  const hoursRaw =
    extractSingleValue(content, "hours") ||
    extractSingleValue(content, "volume_hours");
  const hoursParsed = Number(hoursRaw);
  const hours = Number.isFinite(hoursParsed) ? hoursParsed : null;

  return {
    id,
    name,
    institution,
    country,
    countries,
    hours,
    hoursLabel: hours !== null ? `${hours.toLocaleString()} hrs` : hoursRaw || "not specified",
    modalities,
    tasks: tasks.length > 0 ? tasks : fallbackTasks,
    license: extractSingleValue(content, "license") || "not specified",
    datasetPage: extractSingleValue(content, "dataset_page"),
    accessUrl: extractSingleValue(content, "access_url") || extractSingleValue(content, "url"),
    paperUrl: extractSingleValue(content, "paper_url") || extractSingleValue(content, "paper"),
    contact: extractSingleValue(content, "contact"),
    publisher: extractSingleValue(content, "publisher"),
  };
}

export async function getRegistryData(): Promise<RegistryData> {
  const datasetsPath = path.join(process.cwd(), "..", "registry", "datasets");
  let files: string[] = [];

  try {
    files = await readdir(datasetsPath);
  } catch {
    return {
      stats: { totalHours: 0, totalDatasets: 0, totalCountries: 0 },
      datasets: [],
    };
  }

  const yamlFiles = files.filter(
    (file) => file.endsWith(".yaml") || file.endsWith(".yml"),
  );
  const datasets: DatasetRecord[] = [];
  const countries = new Set<string>();
  let totalHours = 0;

  for (const file of yamlFiles) {
    const content = await readFile(path.join(datasetsPath, file), "utf-8");
    const dataset = normalizeDataset(file, content);
    datasets.push(dataset);

    dataset.countries.forEach((country) => countries.add(country));
    if (dataset.hours !== null) {
      totalHours += dataset.hours;
    }
  }

  return {
    stats: {
      totalHours,
      totalDatasets: datasets.length,
      totalCountries: countries.size,
    },
    datasets,
  };
}

export async function getDatasetById(id: string) {
  const { datasets } = await getRegistryData();
  return datasets.find((dataset) => dataset.id === id) ?? null;
}
