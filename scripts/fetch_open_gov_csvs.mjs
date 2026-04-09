/**
 * Fetch Open Government Portal CSV resources into this repo's data directory.
 *
 * Usage:
 *   npm run fetch_open_gov_csvs
 *   npm run fetch_open_gov_csvs -- --list
 *   npm run fetch_open_gov_csvs -- --only org_employee_type
 *   npm run fetch_open_gov_csvs -- org_employee_type
 *   npm run fetch_open_gov_csvs -- --only org_employee_type,another_key
 *
 * Options:
 *   --list               Print available dataset keys and exit
 *   --only <keys>        Comma-separated keys (can be repeated)
 *   --dry-run            Resolve URLs only; do not download or write files
 *
 * Environment:
 *   DATA_DIR             Optional output dir, defaults to <repo>/data
 */

import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  OPEN_GOV_DATASET_REGISTRY,
  getRequestedKeys,
} from "./open_gov_dataset_registry.mjs";

const CKAN_API_BASE = "https://open.canada.ca/data/api/3/action";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const outDir = process.env.DATA_DIR || join(repoRoot, "data");

function normalizeHeaderCell(s) {
  return s
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function parseHeaderLine(firstLine) {
  return firstLine.split(",").map(normalizeHeaderCell);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const selectedKeys = [];
  let list = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--list") {
      list = true;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--only") {
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        throw new Error("--only requires a comma-separated value");
      }
      selectedKeys.push(...next.split(",").map((s) => s.trim()).filter(Boolean));
      i++;
      continue;
    }
    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    selectedKeys.push(arg);
  }

  return { list, dryRun, selectedKeys };
}

async function fetchResourceDownloadUrl(resourceId) {
  const url = `${CKAN_API_BASE}/resource_show?id=${resourceId}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`CKAN resource_show failed: ${res.status} ${res.statusText}`);
  }

  const body = await res.json();
  if (!body.success || !body.result?.url) {
    throw new Error(
      `CKAN resource_show unexpected response: ${JSON.stringify(body).slice(0, 500)}`
    );
  }
  return body.result.url;
}

function headersMatchExpected(cells, expectedHeaderParts) {
  if (cells.length < expectedHeaderParts.length) return false;
  return expectedHeaderParts.every((expected, i) => cells[i] === expected);
}

async function fetchOneDataset(datasetKey, datasetConfig, dryRun) {
  const { resource_id, out_file, expected_header_parts } = datasetConfig;
  const outPath = join(outDir, out_file);

  console.log(`\n[${datasetKey}] Resolving CKAN resource...`);
  const downloadUrl = await fetchResourceDownloadUrl(resource_id);
  console.log(`[${datasetKey}] Download URL: ${downloadUrl}`);

  if (dryRun) {
    console.log(`[${datasetKey}] --dry-run: skipping download/write`);
    return;
  }

  console.log(`[${datasetKey}] Downloading CSV...`);
  const csvRes = await fetch(downloadUrl, { redirect: "follow" });
  if (!csvRes.ok) {
    throw new Error(
      `[${datasetKey}] Download failed: ${csvRes.status} ${csvRes.statusText}`
    );
  }

  const text = await csvRes.text();
  const firstNewline = text.indexOf("\n");
  const headerLine =
    firstNewline === -1 ? text : text.slice(0, firstNewline).replace(/\r$/, "");
  const headerCells = parseHeaderLine(headerLine);

  if (!headersMatchExpected(headerCells, expected_header_parts)) {
    throw new Error(
      `[${datasetKey}] Unexpected CSV header. Got: ${headerLine}\n` +
        `[${datasetKey}] Expected columns to start with: ${expected_header_parts.join(", ")}`
    );
  }

  await writeFile(outPath, text, "utf8");
  console.log(`[${datasetKey}] Wrote ${outPath} (${text.length} bytes)`);
}

async function main() {
  const { list, dryRun, selectedKeys } = parseArgs(process.argv);
  const keys = getRequestedKeys(selectedKeys);

  if (list) {
    console.log("Available Open Gov datasets:");
    Object.entries(OPEN_GOV_DATASET_REGISTRY).forEach(([key, value]) => {
      console.log(`- ${key}: ${value.description}`);
    });
    return;
  }

  console.log(`Fetching ${keys.length} dataset(s) into ${outDir}`);

  for (const key of keys) {
    await fetchOneDataset(key, OPEN_GOV_DATASET_REGISTRY[key], dryRun);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  throw err;
});
