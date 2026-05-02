/**
 * Client-side file parser
 * Handles CSV, Excel (.xlsx/.xls), TSV, and plain text
 * Runs entirely in the browser — no server upload needed
 * Production-safe: no filesystem access, no serverless limits
 */

import type { ParsedFile, RawRow } from "@/types/import";

// Dynamically import xlsx only in browser
async function getXlsx() {
  const xlsx = await import("xlsx");
  return xlsx;
}

/** Parse a CSV or TSV string into headers + rows */
function parseDelimited(text: string, delimiter: string): { headers: string[]; rows: RawRow[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  // Try to detect if there are extra header rows (e.g., software export banners)
  // Find the first row that looks like a header (has multiple non-empty cells)
  let headerLineIndex = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const cols = lines[i].split(delimiter).filter((c) => c.trim());
    if (cols.length >= 2) {
      headerLineIndex = i;
      break;
    }
  }

  const parseRow = (line: string): string[] => {
    // Handle quoted fields (RFC 4180)
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim()); current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[headerLineIndex]).map((h) => h.replace(/^["']|["']$/g, "").trim());
  const rows: RawRow[] = [];

  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: RawRow = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || "").replace(/^["']|["']$/g, "").trim();
    });
    // Skip empty rows
    if (Object.values(row).some((v) => v !== "")) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

/** Parse an Excel or CSV file using the xlsx library */
async function parseExcel(buffer: ArrayBuffer): Promise<{ headers: string[]; rows: RawRow[] }> {
  const xlsx = await getXlsx();
  const workbook = xlsx.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const jsonData = xlsx.utils.sheet_to_json<RawRow>(sheet, {
    defval: "",
    raw: false, // Always get strings
  });

  if (jsonData.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(jsonData[0]).map((h) => h.trim());
  const rows = jsonData.map((row) => {
    const cleaned: RawRow = {};
    headers.forEach((h) => {
      cleaned[h] = String(row[h] ?? "").trim();
    });
    return cleaned;
  });

  return { headers, rows };
}

/** Main entry: parse any supported file type in the browser */
export async function parseFile(file: File): Promise<ParsedFile> {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  let headers: string[] = [];
  let rows: RawRow[] = [];
  let fileType: ParsedFile["fileType"] = "other";

  if (ext === "csv") {
    fileType = "csv";
    const text = await file.text();
    const parsed = parseDelimited(text, ",");
    headers = parsed.headers;
    rows = parsed.rows;
  } else if (ext === "tsv" || ext === "txt") {
    fileType = "tsv";
    const text = await file.text();
    const parsed = parseDelimited(text, "\t");
    headers = parsed.headers;
    rows = parsed.rows;
  } else if (["xlsx", "xls", "xlsm", "xlsb", "ods"].includes(ext)) {
    fileType = "excel";
    const buffer = await file.arrayBuffer();
    const parsed = await parseExcel(buffer);
    headers = parsed.headers;
    rows = parsed.rows;
  } else if (ext === "pdf") {
    // PDF is sent to the server for parsing (pdfjs can't run in all environments)
    // We return a special marker so the UI knows to call the PDF API
    fileType = "pdf";
    // Actual PDF parsing is done server-side via /api/import/parse-pdf
    return { headers: [], rows: [], totalRows: 0, fileType: "pdf" };
  } else {
    // Try as CSV anyway
    fileType = "other";
    const text = await file.text();
    const parsed = parseDelimited(text, ",");
    headers = parsed.headers;
    rows = parsed.rows;
  }

  return {
    headers,
    rows,
    totalRows: rows.length,
    fileType,
  };
}
