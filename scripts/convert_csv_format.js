// /**
//  * CSV Format Converter
//  *
//  * Converts CSV files to match the standard format:
//  * - Headers are quoted
//  * - Numeric fields (is_crown, is_active, is_internal_service, etc.) are unquoted
//  * - Text fields are quoted
//  * - Empty fields are unquoted
//  * - Multi-line fields inside quotes are preserved (not split into separate rows)
//  * - UTF-8 BOM is preserved at the start
//  */

// const fs = require("fs");
// const path = require("path");

// // Files to convert
// const FILES_TO_CONVERT = [
//   "data/igoc.csv",
//   "data/igoc_en.csv",
//   "data/igoc_fr.csv",
//   "data/crso.csv",
//   "data/crso_en.csv",
//   "data/crso_fr.csv",
//   "data/program.csv",
//   "data/program_en.csv",
//   "data/program_fr.csv",
// ];

// // Numeric field names that should remain unquoted
// const NUMERIC_FIELDS = new Set([
//   "is_crown",
//   "is_active",
//   "is_internal_service",
//   "is_fake_program",
//   "is_drf",
//   "org_id",
//   "ministry",
//   "incorp_yr",
//   "end_yr",
//   "dp_status",
// ]);

// /**
//  * Parse CSV content, handling multi-line quoted fields correctly
//  */
// function parseCSV(content) {
//   const rows = [];
//   let currentRow = [];
//   let currentField = "";
//   let inQuotes = false;
//   let i = 0;

//   while (i < content.length) {
//     const char = content[i];
//     const nextChar = content[i + 1];

//     if (char === '"') {
//       if (inQuotes && nextChar === '"') {
//         // Escaped quote (double quote)
//         currentField += '"';
//         i += 2;
//       } else {
//         // Toggle quote state
//         inQuotes = !inQuotes;
//         i++;
//       }
//     } else if (char === "," && !inQuotes) {
//       // Field separator (only when not in quotes)
//       currentRow.push(currentField);
//       currentField = "";
//       i++;
//     } else if (
//       (char === "\n" || (char === "\r" && nextChar === "\n")) &&
//       !inQuotes
//     ) {
//       // Row separator (only when not in quotes)
//       currentRow.push(currentField);
//       if (currentRow.length > 0 && currentRow.some((f) => f.trim() !== "")) {
//         rows.push(currentRow);
//       }
//       currentRow = [];
//       currentField = "";
//       if (char === "\r" && nextChar === "\n") {
//         i += 2; // Skip \r\n
//       } else {
//         i++; // Skip \n
//       }
//     } else {
//       // Regular character (including newlines inside quoted fields)
//       currentField += char;
//       i++;
//     }
//   }

//   // Add the last field and row if they exist
//   if (currentField !== "" || currentRow.length > 0) {
//     currentRow.push(currentField);
//     if (currentRow.length > 0 && currentRow.some((f) => f.trim() !== "")) {
//       rows.push(currentRow);
//     }
//   }

//   return rows;
// }

// /**
//  * Format a field value for CSV output
//  */
// function formatField(value, fieldName, header) {
//   // Never quote empty fields
//   if (!value) {
//     return "";
//   }

//   // Check if it's a numeric field
//   if (NUMERIC_FIELDS.has(fieldName)) {
//     // If it's a valid number, don't quote it
//     if (/^\d+$/.test(value)) {
//       return value;
//     }
//   }

//   // Quote everything else (text fields)
//   // Escape quotes by doubling them
//   const escaped = value.replace(/"/g, '""');
//   return `"${escaped}"`;
// }

// /**
//  * Convert a CSV file to the standard format
//  */
// function convertCSVFile(filePath) {
//   const fullPath = path.join(__dirname, "..", filePath);

//   if (!fs.existsSync(fullPath)) {
//     console.error(`  ✗ File not found: ${filePath}`);
//     return false;
//   }

//   try {
//     // Read file with UTF-8 BOM handling
//     let content = fs.readFileSync(fullPath, "utf8");
//     const hasBOM = content.charCodeAt(0) === 0xfeff;
//     if (hasBOM) {
//       content = content.slice(1);
//     }

//     // Parse entire CSV content (handles multi-line fields correctly)
//     const allRows = parseCSV(content);

//     if (allRows.length === 0) {
//       console.error(`  ✗ Empty file: ${filePath}`);
//       return false;
//     }

//     // First row is the header
//     const header = allRows[0];
//     const rows = allRows.slice(1);

//     // Build output
//     const outputLines = [];

//     // Write quoted header
//     const quotedHeader = header.map((field) => `"${field}"`).join(",");
//     outputLines.push(quotedHeader);

//     // Write data rows with selective quoting
//     for (const row of rows) {
//       const formattedFields = [];
//       for (let i = 0; i < header.length; i++) {
//         const fieldName = header[i];
//         const value = i < row.length ? row[i] : "";
//         formattedFields.push(formatField(value, fieldName, header));
//       }
//       outputLines.push(formattedFields.join(","));
//     }

//     // Write output with UTF-8 BOM
//     const output = (hasBOM ? "\ufeff" : "") + outputLines.join("\n") + "\n";
//     fs.writeFileSync(fullPath, output, "utf8");

//     console.log(`  ✓ Converted ${rows.length} rows in ${filePath}`);
//     return true;
//   } catch (error) {
//     console.error(`  ✗ Error converting ${filePath}:`, error.message);
//     return false;
//   }
// }

// /**
//  * Main function
//  */
// function main() {
//   console.log("Converting CSV files to standard format...\n");

//   let successCount = 0;
//   let failCount = 0;

//   for (const file of FILES_TO_CONVERT) {
//     if (convertCSVFile(file)) {
//       successCount++;
//     } else {
//       failCount++;
//     }
//   }

//   console.log(
//     `\nConversion complete: ${successCount} succeeded, ${failCount} failed`
//   );

//   if (failCount > 0) {
//     process.exit(1);
//   }
// }

// // Run if called directly
// if (require.main === module) {
//   main();
// }

// module.exports = { convertCSVFile, FILES_TO_CONVERT };
//
