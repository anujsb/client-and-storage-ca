/**
 * Server-side Groq AI field mapper
 * Calls Groq (Llama3) to intelligently map user's column headers
 * to our internal schema fields
 * Production-safe: pure API call, no filesystem access
 */

import Groq from "groq-sdk";
import type { FieldMapping, ClientImportField, RawRow } from "@/types/import";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const CLIENT_FIELDS: { field: ClientImportField; description: string; examples: string[] }[] = [
  {
    field: "name",
    description: "Full name of the client or company",
    examples: ["Client Name", "Party Name", "Company", "Name", "Naam", "Customer", "Firm Name", "Business Name"],
  },
  {
    field: "pan",
    description: "PAN (Permanent Account Number) — 10 character alphanumeric Indian tax ID",
    examples: ["PAN", "PAN No", "PAN Number", "PANNO", "Permanent Account Number", "Tax ID", "PAN Card"],
  },
  {
    field: "phone",
    description: "Phone or mobile number",
    examples: ["Phone", "Mobile", "Contact", "Tel", "Mobile No", "Contact No", "Mob", "Phone No"],
  },
  {
    field: "email",
    description: "Email address",
    examples: ["Email", "Email ID", "Mail", "E-mail", "Email Address"],
  },
  {
    field: "address",
    description: "Physical address",
    examples: ["Address", "Office Address", "Registered Address", "Regd Address", "Addr", "Location"],
  },
  {
    field: "notes",
    description: "Any notes, remarks or comments about the client",
    examples: ["Notes", "Remarks", "Comments", "Note", "Remark"],
  },
  {
    field: "filings",
    description: "Comma separated list of filing types/services the client is subscribed to (e.g. GST, ITR, TDS)",
    examples: ["Filings", "Services", "Filing Types", "Subscriptions", "Work Types"],
  },
];

function buildPrompt(headers: string[], sampleRows: RawRow[]): string {
  const samplesText = sampleRows
    .slice(0, 5)
    .map((row, i) =>
      `Row ${i + 1}: ${Object.entries(row)
        .map(([k, v]) => `"${k}": "${v}"`)
        .join(", ")}`
    )
    .join("\n");

  const fieldsText = CLIENT_FIELDS.map(
    (f) => `- "${f.field}": ${f.description}\n  Common column names: ${f.examples.join(", ")}`
  ).join("\n");

  return `You are a data migration assistant for a Chartered Accountant (CA) firm management system in India.

A CA is importing client data from another software or Excel file. Your job is to map their column headers to our system's fields.

THEIR FILE HEADERS:
${headers.map((h) => `"${h}"`).join(", ")}

SAMPLE DATA (first few rows):
${samplesText}

OUR SYSTEM FIELDS TO MAP:
${fieldsText}

TASK: For each of our system fields, find the best matching column from their headers.

RULES:
1. Match by semantic meaning, not just exact name. "Party Name" = "name", "Mob" = "phone", etc.
2. PAN must be a 10-character alphanumeric code (like ABCDE1234F). Check sample data to confirm.
3. If no column matches a field, set column to null and confidence to 0.
4. Confidence: 95-100 = certain match, 70-94 = likely match, 40-69 = possible match, 0-39 = no match.
5. ONLY output valid JSON. No explanation, no markdown, no code blocks.

OUTPUT FORMAT (strict JSON, nothing else):
{
  "mappings": {
    "name": { "column": "exact header name or null", "confidence": 0 },
    "pan": { "column": "exact header name or null", "confidence": 0 },
    "phone": { "column": "exact header name or null", "confidence": 0 },
    "email": { "column": "exact header name or null", "confidence": 0 },
    "address": { "column": "exact header name or null", "confidence": 0 },
    "notes": { "column": "exact header name or null", "confidence": 0 },
    "filings": { "column": "exact header name or null", "confidence": 0 }
  }
}`;
}

export async function mapFieldsWithGroq(
  headers: string[],
  sampleRows: RawRow[]
): Promise<FieldMapping> {
  const prompt = buildPrompt(headers, sampleRows);

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.1, // Low temp for deterministic, structured output
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content || "{}";

  let parsed: { mappings?: Record<string, { column: string | null; confidence: number }> };
  try {
    parsed = JSON.parse(content);
  } catch {
    // Fallback: return all nulls if parsing fails
    parsed = { mappings: {} };
  }

  // Build the FieldMapping with defaults for any missing fields
  const mapping: FieldMapping = {} as FieldMapping;
  for (const { field } of CLIENT_FIELDS) {
    const entry = parsed.mappings?.[field];
    if (entry && entry.column && headers.includes(entry.column)) {
      mapping[field] = { column: entry.column, confidence: entry.confidence ?? 50 };
    } else {
      mapping[field] = { column: null, confidence: 0 };
    }
  }

  return mapping;
}
