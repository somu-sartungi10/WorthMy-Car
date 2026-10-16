/**
 * Generates frontend/public/meta.json from the project's dataset + metrics so
 * the React app can populate dropdowns, model metrics and the dataset preview
 * without needing the FastAPI server running.
 *
 * Runs automatically via the `predev` / `prebuild` npm hooks.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..", "..");
const csvPath = resolve(projectRoot, "data", "raw", "cardata.csv");
const metricsPath = resolve(projectRoot, "models", "metrics.json");
const outDir = resolve(here, "..", "public");
const outPath = resolve(outDir, "meta.json");

/** Minimal RFC-4180 CSV parser (handles quoted fields with commas/newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return value;
  const asNumber = Number(value);
  return Number.isFinite(asNumber) && String(value).trim() !== "" ? asNumber : value;
}

const rawCsv = readFileSync(csvPath, "utf8");
const parsed = parseCsv(rawCsv);
const [header, ...dataRows] = parsed;

const records = dataRows.map((cells) => {
  const record = {};
  header.forEach((column, index) => {
    record[column] = toNumber(cells[index] ?? "");
  });
  return record;
});

const uniqueSorted = (column) =>
  [...new Set(records.map((r) => r[column]).filter((v) => v !== undefined && v !== "" && v !== null).map(String))].sort();

const optionColumns = [
  "Make",
  "Owner",
  "Seller Type",
  "Fuel Type",
  "Transmission",
  "Drivetrain",
  "Location",
  "Color",
];

const options = Object.fromEntries(optionColumns.map((column) => [column, uniqueSorted(column)]));

const modelsByMake = {};
for (const record of records) {
  const make = String(record.Make ?? "");
  const model = String(record.Model ?? "");
  if (!make || !model) continue;
  if (!modelsByMake[make]) modelsByMake[make] = new Set();
  modelsByMake[make].add(model);
}
for (const make of Object.keys(modelsByMake)) {
  modelsByMake[make] = [...modelsByMake[make]].sort();
}

// Deterministic shuffle for a stable, representative preview sample.
const SAMPLE_SIZE = 120;
const step = Math.max(1, Math.floor(records.length / SAMPLE_SIZE));
const sample = records.filter((_, index) => index % step === 0).slice(0, SAMPLE_SIZE);

const metrics = JSON.parse(readFileSync(metricsPath, "utf8"));

const meta = {
  generatedAt: new Date().toISOString(),
  metrics,
  options,
  modelsByMake,
  dataset: {
    totalRows: records.length,
    columns: header,
    sample,
  },
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

console.log(
  `meta.json written → ${outPath}\n` +
    `  rows: ${records.length}, columns: ${header.length}, sample: ${sample.length}`,
);
