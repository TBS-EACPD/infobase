/**
 * Download "Population of the federal public service by department and tenure"
 * from the Open Government Portal (CKAN) and write data/org_employee_type.csv.
 *
 * Resolves the current file URL via resource_show so portal filename changes
 * (e.g. ...-march-2025.csv) do not require updating this script.
 *
 * Usage (from repo root):
 *   npm run fetch_open_gov_org_employee_type
 *
 * Environment:
 *   DATA_DIR - optional; defaults to <repo>/data
 */

import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const CKAN_API_BASE = "https://open.canada.ca/data/api/3/action";
const TENURE_RESOURCE_ID = "6d238af7-2212-4d36-8ee3-abbfba4392c7";

const EXPECTED_HEADER_PARTS = [
  "year",
  "department or agency",
  "tenure",
  "number of employees",
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const outPath = process.env.DATA_DIR
  ? join(process.env.DATA_DIR, "org_employee_type.csv")
  : join(repoRoot, "data", "org_employee_type.csv");

function normalizeHeaderCell(s) {
  return s
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function parseHeaderLine(firstLine) {
  return firstLine.split(",").map(normalizeHeaderCell);
}

function headersMatchExpected(cells) {
  if (cells.length < EXPECTED_HEADER_PARTS.length) return false;
  return EXPECTED_HEADER_PARTS.every((expected, i) => cells[i] === expected);
}

async function fetchResourceShow() {
  const url = `${CKAN_API_BASE}/resource_show?id=${TENURE_RESOURCE_ID}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`CKAN resource_show failed: ${res.status} ${res.statusText}`);
  }
  const body = await res.json();
  if (!body.success || !body.result?.url) {
    throw new Error(
      `CKAN resource_show: unexpected response: ${JSON.stringify(body).slice(0, 500)}`
    );
  }
  return body.result.url;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("Fetching resource metadata from CKAN...");
  const downloadUrl = await fetchResourceShow();
  console.log(`Download URL: ${downloadUrl}`);

  if (dryRun) {
    console.log("--dry-run: not downloading or writing file.");
    return;
  }

  console.log("Downloading CSV...");
  const csvRes = await fetch(downloadUrl, { redirect: "follow" });
  if (!csvRes.ok) {
    throw new Error(`Download failed: ${csvRes.status} ${csvRes.statusText}`);
  }

  const text = await csvRes.text();
  const firstNewline = text.indexOf("\n");
  const headerLine =
    firstNewline === -1 ? text : text.slice(0, firstNewline).replace(/\r$/, "");
  const headerCells = parseHeaderLine(headerLine);

  if (!headersMatchExpected(headerCells)) {
    throw new Error(
      `Unexpected CSV header. Got: ${headerLine}\n` +
        `Expected columns to start with: ${EXPECTED_HEADER_PARTS.join(", ")}`
    );
  }

  await writeFile(outPath, text, "utf8");
  console.log(`Wrote ${outPath} (${text.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  throw err;
});
