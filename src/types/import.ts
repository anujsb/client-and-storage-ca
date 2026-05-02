// ─── Import System Types ─────────────────────────────────────────────────────

/** The fields we support importing for clients */
export type ClientImportField =
  | "name"
  | "pan"
  | "phone"
  | "email"
  | "address"
  | "notes"
  | "filings";

/** A single field mapping: our field → the user's column name */
export interface FieldMappingEntry {
  column: string | null;  // null = not found / user skipped
  confidence: number;     // 0-100
}

/** Full mapping of all our fields to the user's columns */
export type FieldMapping = Record<ClientImportField, FieldMappingEntry>;

/** One row of data from the uploaded file (raw strings) */
export type RawRow = Record<string, string>;

/** The result of parsing a file */
export interface ParsedFile {
  headers: string[];
  rows: RawRow[];
  totalRows: number;
  fileType: "csv" | "excel" | "pdf" | "tsv" | "other";
}

/** Per-row import outcome */
export interface RowImportResult {
  rowIndex: number;
  status: "imported" | "skipped_duplicate" | "failed" | "pending_review";
  clientName?: string;
  pan?: string;
  reason?: string;
  existingClientId?: string; // if duplicate
}

/** Full import summary returned after import */
export interface ImportSummary {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  duplicates: RowImportResult[]; // rows needing user decision
  results: RowImportResult[];
}

/** Payload sent to /api/import/analyze */
export interface AnalyzeRequest {
  headers: string[];
  sampleRows: RawRow[]; // first 5 rows only
}

/** Response from /api/import/analyze */
export interface AnalyzeResponse {
  mapping: FieldMapping;
}

/** Payload sent to /api/import/clients */
export interface ImportClientsRequest {
  mapping: FieldMapping;
  rows: RawRow[];
  parentLocationId?: string | null;
  duplicateResolutions?: Record<string, "skip" | "update">; // pan → action
}

/** The wizard steps */
export type ImportStep = "upload" | "mapping" | "duplicates" | "importing" | "done";
