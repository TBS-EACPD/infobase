#!/bin/bash

# Download CSV files from an Azure DevOps pipeline run artifact
# and overwrite the local CSVs in the repo's data directory.
#
# Usage (from repo root):
#   # With explicit run id
#   AZDO_PAT=... AZDO_ORG=... AZDO_PROJECT=... AZDO_DEFINITION_ID=... AZDO_ARTIFACT_NAME=... \
#     npm run update_csv_from_pipeline -- <run_id>
#
#   # Or, to use the latest successful run (no id argument)
#   AZDO_PAT=... AZDO_ORG=... AZDO_PROJECT=... AZDO_DEFINITION_ID=... AZDO_ARTIFACT_NAME=... \
#     npm run update_csv_from_pipeline
#
# Or (direct):
#   bash scripts/dev_scripts/update_csv_from_pipeline.sh [run_id]
#
# Required environment:
#   AZDO_PAT           - Azure DevOps personal access token
#   AZDO_ORG           - Azure DevOps organization (e.g. my-org)
#   AZDO_PROJECT       - Azure DevOps project name
#   AZDO_DEFINITION_ID - Azure DevOps build definition / pipeline id (required if run_id omitted)
#
# Optional environment:
#   AZDO_ARTIFACT_NAME - Artifact name holding CSVs (default: Infobase)
#   DATA_DIR           - Local data directory (default: data)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
  printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

print_warn() {
  printf "${YELLOW}[WARN]${NC} %s\n" "$1"
}

print_error() {
  printf "${RED}[ERROR]${NC} %s\n" "$1"
}

usage() {
  cat <<EOF
Usage: $0 [run_id]

Environment variables:
  AZDO_PAT           (required) Azure DevOps personal access token
  AZDO_ORG           (required) Azure DevOps organization (e.g. my-org)
  AZDO_PROJECT       (required) Azure DevOps project name
  AZDO_DEFINITION_ID (required if run_id omitted) Build definition / pipeline id
  AZDO_ARTIFACT_NAME (optional) Artifact name containing CSVs (default: Infobase)
  DATA_DIR           (optional) Local data directory (default: data)

Example from repo root:
  # With explicit run id
  AZDO_PAT=... AZDO_ORG=my-org AZDO_PROJECT=my-project AZDO_DEFINITION_ID=42 AZDO_ARTIFACT_NAME=Infobase \\
    npm run update_csv_from_pipeline -- 12345

  # Using latest successful run
  AZDO_PAT=... AZDO_ORG=my-org AZDO_PROJECT=my-project AZDO_DEFINITION_ID=42 AZDO_ARTIFACT_NAME=Infobase \\
    npm run update_csv_from_pipeline
EOF
}

check_dependencies() {
  print_info "Checking dependencies..."

  if ! command -v curl >/dev/null 2>&1; then
    print_error "curl is required but not installed"
    exit 1
  fi

  if ! command -v unzip >/dev/null 2>&1; then
    print_error "unzip is required but not installed"
    exit 1
  fi

  if ! command -v jq >/dev/null 2>&1; then
    print_error "jq is required but not installed (used to parse Azure DevOps API responses)"
    exit 1
  fi

  print_info "All dependencies are available"
}

get_latest_successful_run_id() {
  local definition_id="${AZDO_DEFINITION_ID:-}"

  if [ -z "$definition_id" ]; then
    print_error "AZDO_DEFINITION_ID must be set when no run_id is provided"
    usage
    exit 1
  fi

  # Log to stderr so that function stdout is only the id
  print_info "Fetching latest successful run for definition $definition_id..." >&2

  local builds_url="https://dev.azure.com/${AZDO_ORG}/${AZDO_PROJECT}/_apis/build/builds?definitions=${definition_id}&statusFilter=completed&resultFilter=succeeded&\$top=1&queryOrder=finishTimeDescending&api-version=7.1-preview.7"

  local builds_json="$TEMP_DIR/builds.json"
  if ! curl -sSL -u ":${AZDO_PAT}" "$builds_url" -o "$builds_json"; then
    print_error "Failed to query builds from Azure DevOps"
    exit 1
  fi

  local latest_id
  latest_id="$(jq -r '.value[0].id // empty' "$builds_json" 2>/dev/null || true)"

  if [ -z "$latest_id" ] || [ "$latest_id" = "null" ]; then
    print_error "Could not determine latest successful run id for definition $definition_id"
    exit 1
  fi

  print_info "Using latest successful run id: $latest_id" >&2
  echo "$latest_id"
}

RUN_ID="${1:-}"

AZDO_PAT="${AZDO_PAT:-}"
AZDO_ORG="${AZDO_ORG:-}"
AZDO_PROJECT="${AZDO_PROJECT:-}"
AZDO_ARTIFACT_NAME="${AZDO_ARTIFACT_NAME:-Infobase}"
DATA_DIR="${DATA_DIR:-data}"

if [ -z "$AZDO_PAT" ] || [ -z "$AZDO_ORG" ] || [ -z "$AZDO_PROJECT" ]; then
  print_error "AZDO_PAT, AZDO_ORG, and AZDO_PROJECT must all be set"
  usage
  exit 1
fi

if [ ! -d "$DATA_DIR" ]; then
  print_error "Data directory '$DATA_DIR' does not exist (expected from repo root)"
  exit 1
fi

TEMP_DIR="$(mktemp -d /tmp/infobase_azdo_artifact_XXXXXX)"
ARTIFACT_ZIP="$TEMP_DIR/artifact.zip"
ARTIFACT_DIR="$TEMP_DIR/artifact"

cleanup() {
  print_info "Cleaning up temporary files..."
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

check_dependencies

if [ -z "$RUN_ID" ]; then
  RUN_ID="$(get_latest_successful_run_id)"
fi

print_info "Downloading artifact '$AZDO_ARTIFACT_NAME' from run $RUN_ID..."

# Fetch run details so we can show a friendly name when done
RUN_DETAILS_JSON="$TEMP_DIR/run_details.json"
RUN_NAME=""
RUN_BRANCH=""
RUN_FINISH_TIME=""

RUN_DETAILS_URL="https://dev.azure.com/${AZDO_ORG}/${AZDO_PROJECT}/_apis/build/builds/${RUN_ID}?api-version=7.1-preview.7"
if curl -sSL -u ":${AZDO_PAT}" "$RUN_DETAILS_URL" -o "$RUN_DETAILS_JSON"; then
  RUN_NAME="$(jq -r '.buildNumber // empty' "$RUN_DETAILS_JSON" 2>/dev/null || true)"
  RUN_BRANCH="$(jq -r '.sourceBranch // empty' "$RUN_DETAILS_JSON" 2>/dev/null || true)"
  RUN_FINISH_TIME="$(jq -r '.finishTime // empty' "$RUN_DETAILS_JSON" 2>/dev/null || true)"
fi

API_URL="https://dev.azure.com/${AZDO_ORG}/${AZDO_PROJECT}/_apis/build/builds/${RUN_ID}/artifacts?artifactName=${AZDO_ARTIFACT_NAME}&api-version=7.1-preview.5"

# First call returns JSON metadata including the real ZIP download URL
META_JSON="$TEMP_DIR/artifact_meta.json"
if ! curl -sSL -u ":${AZDO_PAT}" "$API_URL" -o "$META_JSON"; then
  print_error "Failed to query artifact metadata from Azure DevOps"
  exit 1
fi

DOWNLOAD_URL="$(jq -r '.resource.downloadUrl // empty' "$META_JSON" 2>/dev/null || true)"

if [ -z "$DOWNLOAD_URL" ] || [ "$DOWNLOAD_URL" = "null" ]; then
  print_error "Could not find downloadUrl in artifact metadata. Check run id and artifact name."
  exit 1
fi

print_info "Downloading artifact ZIP from metadata URL..."
if ! curl -sSL -u ":${AZDO_PAT}" "$DOWNLOAD_URL" -o "$ARTIFACT_ZIP"; then
  print_error "Failed to download artifact ZIP from Azure DevOps"
  exit 1
fi

if [ ! -s "$ARTIFACT_ZIP" ]; then
  print_error "Downloaded artifact ZIP is empty. Check permissions and run id."
  exit 1
fi

print_info "Unzipping artifact..."
mkdir -p "$ARTIFACT_DIR"
unzip -oq "$ARTIFACT_ZIP" -d "$ARTIFACT_DIR"

print_info "Copying CSV files into '$DATA_DIR'..."
CSV_COUNT=0
while IFS= read -r -d '' csv_file; do
  base_name="$(basename "$csv_file")"
  dest_path="$DATA_DIR/$base_name"
  print_info "Overwriting $dest_path"
  cp -f "$csv_file" "$dest_path"
  CSV_COUNT=$((CSV_COUNT + 1))
done < <(find "$ARTIFACT_DIR" -type f -name '*.csv' -print0)

if [ "$CSV_COUNT" -eq 0 ]; then
  print_warn "No CSV files found in artifact. Nothing was updated."
else
  print_info "Updated $CSV_COUNT CSV file(s) in '$DATA_DIR'."
fi
if [ -n "$RUN_NAME" ] || [ -n "$RUN_BRANCH" ] || [ -n "$RUN_FINISH_TIME" ]; then
  print_info "Run details:"
  [ -n "$RUN_NAME" ] && print_info "  Name:    $RUN_NAME"
  [ -n "$RUN_BRANCH" ] && print_info "  Branch:  $RUN_BRANCH"
  [ -n "$RUN_FINISH_TIME" ] && print_info "  Finished: $RUN_FINISH_TIME"
fi

print_info "Done."

