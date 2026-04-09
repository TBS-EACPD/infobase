/**
 * Orchestrate Open Gov refresh for selected datasets:
 * 1) hash selected CSV files
 * 2) fetch latest CSVs from Open Gov
 * 3) hash again and run populate_db:remote only if any selected file changed
 *
 * Safety guard:
 * - Interactive runs require confirmation before remote populate
 * - Automation can bypass guard with --yes or SKIP_REMOTE_POPULATE_GUARD=1
 * - CI automatically bypasses prompt
 *
 * Usage:
 *   npm run refresh_open_gov_remote
 *   npm run refresh_open_gov_remote -- --list
 *   npm run refresh_open_gov_remote -- --only org_employee_type
 *   npm run refresh_open_gov_remote -- org_employee_type
 *   npm run refresh_open_gov_remote -- --dry-run --only org_employee_type
 *   npm run refresh_open_gov_remote -- --yes --only org_employee_type
 */

import { spawn } from "child_process";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { createInterface } from "readline/promises";
import { fileURLToPath } from "url";

import {
  OPEN_GOV_DATASET_REGISTRY,
  getRequestedKeys,
} from "./open_gov_dataset_registry.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const dataDir = join(repoRoot, "data");

function parseArgs(argv) {
  const args = argv.slice(2);
  const selectedKeys = [];
  let list = false;
  let yes = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--list") {
      list = true;
      continue;
    }
    if (arg === "--yes") {
      yes = true;
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

  return {
    list,
    yes,
    dryRun,
    selectedKeys,
  };
}

async function getFileSha256(path) {
  try {
    const buf = await readFile(path);
    return createHash("sha256").update(buf).digest("hex");
  } catch (err) {
    return null;
  }
}

async function runCommand(command, args, cwd) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed (${command} ${args.join(" ")}), exit ${code}`));
      }
    });
  });
}

function isCiMode() {
  return process.env.CI === "1" || process.env.CI === "true";
}

function shouldBypassGuard(yesFlag) {
  return (
    yesFlag ||
    isCiMode() ||
    process.env.SKIP_REMOTE_POPULATE_GUARD === "1" ||
    process.env.SKIP_REMOTE_POPULATE_GUARD === "true"
  );
}

async function confirmRemotePopulate() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Non-interactive session requires --yes or SKIP_REMOTE_POPULATE_GUARD=1"
    );
  }

  const target = process.env.MDB_NAME || "<unset>";
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const response = await rl.question(
    `About to run remote populate (drop + repopulate). Target MDB_NAME=${target}. Continue? [yes/NO] `
  );
  rl.close();

  if (response.trim().toLowerCase() !== "yes") {
    throw new Error("Cancelled by user.");
  }
}

async function main() {
  const { list, yes, dryRun, selectedKeys } = parseArgs(process.argv);
  const keys = getRequestedKeys(selectedKeys);

  if (list) {
    console.log("Available Open Gov datasets:");
    Object.entries(OPEN_GOV_DATASET_REGISTRY).forEach(([key, value]) => {
      console.log(`- ${key}: ${value.description}`);
    });
    return;
  }

  const watchedPaths = keys.map((key) =>
    join(dataDir, OPEN_GOV_DATASET_REGISTRY[key].out_file)
  );

  const beforeHashes = await Promise.all(watchedPaths.map((path) => getFileSha256(path)));
  console.log("Pre-fetch hashes:");
  keys.forEach((key, idx) => {
    console.log(`- ${key}: ${beforeHashes[idx] || "<missing file>"}`);
  });

  const fetchArgs = ["run", "fetch_open_gov_csvs", "--", ...keys];
  if (dryRun) {
    fetchArgs.push("--dry-run");
  }

  console.log("Running fetch...");
  await runCommand("npm", fetchArgs, repoRoot);

  const afterHashes = await Promise.all(watchedPaths.map((path) => getFileSha256(path)));
  console.log("Post-fetch hashes:");
  keys.forEach((key, idx) => {
    console.log(`- ${key}: ${afterHashes[idx] || "<missing file>"}`);
  });

  const hasChanged = keys.some((key, idx) => {
    const beforeHash = beforeHashes[idx];
    const afterHash = afterHashes[idx];
    return !(beforeHash && afterHash && beforeHash === afterHash);
  });

  if (!dryRun && !hasChanged) {
    console.log("No data change detected. Skipping populate_db:remote.");
    return;
  }

  if (dryRun) {
    console.log("Dry-run mode. Skipping populate_db:remote.");
    return;
  }

  console.log("Data changed or file was missing. Preparing remote populate...");

  if (!shouldBypassGuard(yes)) {
    await confirmRemotePopulate();
  } else {
    console.log("Safety prompt bypassed (--yes/CI/SKIP_REMOTE_POPULATE_GUARD).");
  }

  await runCommand("npm", ["run", "populate_db:remote"], join(repoRoot, "server"));
  console.log("Remote populate completed.");
}

main().catch((err) => {
  console.error(err);
  throw err;
});
