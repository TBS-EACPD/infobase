/**
 * Orchestrate Open Gov refresh for org_employee_type:
 * 1) fetch latest CSV
 * 2) compare content hash before/after
 * 3) run server populate_db:remote only if changed
 *
 * Safety guard:
 * - Interactive runs require confirmation before remote populate
 * - Automation can bypass guard with --yes or SKIP_REMOTE_POPULATE_GUARD=1
 * - CI automatically bypasses prompt
 *
 * Usage:
 *   npm run refresh_people_employee_type_remote
 *   npm run refresh_people_employee_type_remote -- --yes
 *   npm run refresh_people_employee_type_remote -- --fetch-dry-run
 */

import { spawn } from "child_process";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { createInterface } from "readline/promises";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const csvPath = join(repoRoot, "data", "org_employee_type.csv");

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    yes: args.includes("--yes"),
    fetchDryRun: args.includes("--fetch-dry-run"),
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
  const { yes, fetchDryRun } = parseArgs(process.argv);

  const beforeHash = await getFileSha256(csvPath);
  console.log(`Pre-fetch hash: ${beforeHash || "<missing file>"}`);

  const fetchArgs = ["run", "fetch_open_gov_csvs", "--", "--only", "org_employee_type"];
  if (fetchDryRun) {
    fetchArgs.push("--dry-run");
  }

  console.log("Running fetch...");
  await runCommand("npm", fetchArgs, repoRoot);

  const afterHash = await getFileSha256(csvPath);
  console.log(`Post-fetch hash: ${afterHash || "<missing file>"}`);

  if (!fetchDryRun && beforeHash && afterHash && beforeHash === afterHash) {
    console.log("No data change detected. Skipping populate_db:remote.");
    return;
  }

  if (fetchDryRun) {
    console.log("Fetch dry-run mode. Skipping populate_db:remote.");
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
