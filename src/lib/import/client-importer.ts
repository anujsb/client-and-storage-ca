/**
 * Client importer service
 * Takes confirmed field mapping + rows → validates → bulk inserts to DB
 * Auto-chunks large datasets (500/batch) transparently
 * Production-safe: pure DB operations via existing ClientService
 */

import { db } from "@/lib/db";
import { clients, storageLocations, clientFilingSubscriptions, filingTypes } from "@/lib/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import type {
  FieldMapping,
  RawRow,
  RowImportResult,
  ImportSummary,
} from "@/types/import";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const CHUNK_SIZE = 500;

/** Extract a value from a row using the field mapping */
function extractValue(row: RawRow, mapping: FieldMapping, field: keyof FieldMapping): string {
  const entry = mapping[field];
  if (!entry?.column) return "";
  return (row[entry.column] || "").trim();
}

/** Normalize PAN — uppercase, remove spaces */
function normalizePan(raw: string): string {
  return raw.toUpperCase().replace(/\s/g, "");
}

/** Generate next client code (sequential within tenant) */
async function getNextClientCode(tenantId: string, offset: number): Promise<string> {
  const latest = await db.query.clients.findFirst({
    where: eq(clients.tenantId, tenantId),
    orderBy: (c, { desc }) => [desc(c.clientCode)],
  });

  let base = 0;
  if (latest?.clientCode) {
    const parts = latest.clientCode.split("-");
    base = parseInt(parts[1] || "0", 10);
  }

  return `C-${(base + offset + 1).toString().padStart(4, "0")}`;
}

/** Check if a PAN already exists for this tenant */
async function findExistingByPan(
  tenantId: string,
  pan: string
): Promise<string | null> {
  const existing = await db.query.clients.findFirst({
    where: and(eq(clients.tenantId, tenantId), eq(clients.pan, pan)),
  });
  return existing?.id ?? null;
}

export interface ImportOptions {
  tenantId: string;
  mapping: FieldMapping;
  rows: RawRow[];
  parentLocationId?: string | null;
  /** For each PAN that's a duplicate: "skip" | "update" */
  duplicateResolutions?: Record<string, "skip" | "update">;
  /** Called after each chunk completes */
  onProgress?: (processed: number, total: number) => void;
}

export async function importClients(options: ImportOptions): Promise<ImportSummary> {
  const { tenantId, mapping, rows, parentLocationId, duplicateResolutions = {} } = options;

  const results: RowImportResult[] = [];
  const duplicates: RowImportResult[] = [];
  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let clientCodeOffset = 0;

  // Fetch all filing types to match against
  const allFilingTypes = await db.query.filingTypes.findMany({
    where: or(eq(filingTypes.tenantId, tenantId), isNull(filingTypes.tenantId)),
  });

  // Process in chunks
  const chunks: RawRow[][] = [];
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    for (const row of chunk) {
      const rawName = extractValue(row, mapping, "name");
      const rawPan = extractValue(row, mapping, "pan");

      if (!rawName) {
        results.push({
          rowIndex: results.length,
          status: "failed",
          reason: "Missing client name",
        });
        failedCount++;
        continue;
      }

      const pan = normalizePan(rawPan);
      if (rawPan && !PAN_REGEX.test(pan)) {
        results.push({
          rowIndex: results.length,
          status: "failed",
          clientName: rawName,
          pan: rawPan,
          reason: `Invalid PAN format: "${rawPan}"`,
        });
        failedCount++;
        continue;
      }

      // Check for duplicate PAN
      if (pan) {
        const existingId = await findExistingByPan(tenantId, pan);
        if (existingId) {
          const resolution = duplicateResolutions[pan];
          if (!resolution) {
            // No resolution provided — mark as pending
            const dupResult: RowImportResult = {
              rowIndex: results.length,
              status: "pending_review",
              clientName: rawName,
              pan,
              existingClientId: existingId,
              reason: "Client with this PAN already exists",
            };
            results.push(dupResult);
            duplicates.push(dupResult);
            continue;
          } else if (resolution === "skip") {
            results.push({
              rowIndex: results.length,
              status: "skipped_duplicate",
              clientName: rawName,
              pan,
              existingClientId: existingId,
            });
            skippedCount++;
            continue;
          } else if (resolution === "update") {
            // Update existing client
            try {
              await db
                .update(clients)
                .set({
                  name: rawName,
                  phone: extractValue(row, mapping, "phone") || undefined,
                  email: extractValue(row, mapping, "email") || undefined,
                  address: extractValue(row, mapping, "address") || undefined,
                  notes: extractValue(row, mapping, "notes") || undefined,
                })
                .where(and(eq(clients.tenantId, tenantId), eq(clients.id, existingId)));

              // Handle filings update
              const rawFilings = extractValue(row, mapping, "filings");
              if (rawFilings) {
                const filingNames = rawFilings.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
                for (const name of filingNames) {
                  const match = allFilingTypes.find(ft => ft.code.toLowerCase() === name || ft.name.toLowerCase() === name);
                  if (match) {
                    // Check if already subscribed
                    const existingSub = await db.query.clientFilingSubscriptions.findFirst({
                      where: and(
                        eq(clientFilingSubscriptions.clientId, existingId),
                        eq(clientFilingSubscriptions.filingTypeId, match.id)
                      )
                    });
                    if (!existingSub) {
                      await db.insert(clientFilingSubscriptions).values({
                        tenantId,
                        clientId: existingId,
                        filingTypeId: match.id,
                      });
                    }
                  }
                }
              }

              results.push({
                rowIndex: results.length,
                status: "imported",
                clientName: rawName,
                pan,
              });
              importedCount++;
            } catch (e: any) {
              results.push({
                rowIndex: results.length,
                status: "failed",
                clientName: rawName,
                pan,
                reason: e.message,
              });
              failedCount++;
            }
            continue;
          }
        }
      }

      // Insert new client
      try {
        const clientCode = await getNextClientCode(tenantId, clientCodeOffset);
        clientCodeOffset++;

        let defaultLocationId: string | null = null;

        // Auto-create storage folder if parent location is provided
        if (parentLocationId) {
          const siblings = await db.query.storageLocations.findMany({
            where: and(
              eq(storageLocations.tenantId, tenantId),
              eq(storageLocations.parentId, parentLocationId)
            ),
          });
          const nextSortOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.sortOrder)) + 1 : 0;
          const sequenceNumber = siblings.length + 1;

          const [newLocation] = await db.insert(storageLocations).values({
            tenantId,
            parentId: parentLocationId,
            name: `${sequenceNumber} - ${rawName}`,
            levelLabel: "Folder",
            sortOrder: nextSortOrder,
          }).returning();
          
          defaultLocationId = newLocation.id;
        }

        const [newClient] = await db.insert(clients).values({
          tenantId,
          clientCode,
          pan: pan || `NO-PAN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: rawName,
          phone: extractValue(row, mapping, "phone") || null,
          email: extractValue(row, mapping, "email") || null,
          address: extractValue(row, mapping, "address") || null,
          notes: extractValue(row, mapping, "notes") || null,
          defaultLocationId,
        }).returning();

        // Handle filings creation
        const rawFilings = extractValue(row, mapping, "filings");
        if (rawFilings) {
          const filingNames = rawFilings.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
          for (const name of filingNames) {
            const match = allFilingTypes.find(ft => ft.code.toLowerCase() === name || ft.name.toLowerCase() === name);
            if (match) {
              await db.insert(clientFilingSubscriptions).values({
                tenantId,
                clientId: newClient.id,
                filingTypeId: match.id,
              });
            }
          }
        }

        results.push({
          rowIndex: results.length,
          status: "imported",
          clientName: rawName,
          pan,
        });
        importedCount++;
      } catch (e: any) {
        results.push({
          rowIndex: results.length,
          status: "failed",
          clientName: rawName,
          pan,
          reason: e.message,
        });
        failedCount++;
      }
    }

    options.onProgress?.(results.length, rows.length);
  }

  return {
    total: rows.length,
    imported: importedCount,
    skipped: skippedCount,
    failed: failedCount,
    duplicates,
    results,
  };
}
