/**
 * Canonical text form for Open Gov CSVs so byte-for-byte comparisons match
 * across portal downloads, git checkout (autocrlf), and editor saves.
 */
export function normalizeOpenGovCsvText(text) {
  if (typeof text !== "string") {
    return text;
  }
  return text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}
