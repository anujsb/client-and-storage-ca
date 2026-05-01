import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { isNull } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seedFilingsOnly() {
    console.log("🌱 Seeding ONLY filing types...");

    // ── 5. System filing types ───────────────────────────────────────────────────
    const filingTypeDefs = [
        { code: "GSTR-1", name: "GSTR-1 – Outward Supplies (Monthly)", category: "gst" as const, frequency: "monthly" as const, dueDay: 11, dueMonthOffset: 1, requiresAckNo: true, description: "Statement of outward supplies by a registered taxpayer. Due 11th of following month." },
        { code: "GSTR-1-Q", name: "GSTR-1 – Outward Supplies (Quarterly / QRMP)", category: "gst" as const, frequency: "quarterly" as const, dueDay: 13, dueMonthOffset: 1, requiresAckNo: true, description: "Quarterly version for taxpayers under QRMP scheme. Due 13th of month following the quarter." },
        { code: "GSTR-3B", name: "GSTR-3B – Summary Return (Monthly)", category: "gst" as const, frequency: "monthly" as const, dueDay: 20, dueMonthOffset: 1, requiresAckNo: true, description: "Monthly self-assessed summary return. Due 20th of following month." },
        { code: "GSTR-3B-Q", name: "GSTR-3B – Summary Return (Quarterly / QRMP)", category: "gst" as const, frequency: "quarterly" as const, dueDay: 22, dueMonthOffset: 1, requiresAckNo: true, description: "Quarterly version under QRMP scheme. Due 22nd (or 24th) of month following the quarter." },
        { code: "GSTR-7", name: "GSTR-7 – TDS Under GST", category: "gst" as const, frequency: "monthly" as const, dueDay: 10, dueMonthOffset: 1, requiresAckNo: true, description: "Return for TDS deducted under GST. Due 10th of following month." },
        { code: "GSTR-9", name: "GSTR-9 – Annual Return", category: "gst" as const, frequency: "annually" as const, dueDay: 31, dueMonthOffset: 0, requiresAckNo: true, description: "Annual consolidated return for regular taxpayers. Due 31st December of following FY." },
        { code: "ITR", name: "ITR – Income Tax Return (Non-Audit)", category: "income_tax" as const, frequency: "annually" as const, dueDay: 31, dueMonthOffset: 0, requiresAckNo: true, description: "Annual income tax return for individuals/firms not requiring audit. Due 31st July." },
        { code: "ITR-AUDIT", name: "ITR – Income Tax Return (Audit Case)", category: "income_tax" as const, frequency: "annually" as const, dueDay: 31, dueMonthOffset: 0, requiresAckNo: true, description: "Annual income tax return for cases requiring tax audit. Due 31st October." },
        { code: "TAX-AUDIT", name: "Tax Audit Report – Form 3CD", category: "audit" as const, frequency: "annually" as const, dueDay: 30, dueMonthOffset: 0, requiresAckNo: false, description: "Tax audit under Section 44AB. Report due 30th September of assessment year." },
        { code: "ETDS-24Q", name: "eTDS – Form 24Q (Salary TDS)", category: "tds" as const, frequency: "quarterly" as const, dueDay: 31, dueMonthOffset: 0, requiresAckNo: true, description: "Quarterly TDS return for salary payments. Q1: 31 Jul | Q2: 31 Oct | Q3: 31 Jan | Q4: 31 May." },
        { code: "ETDS-26Q", name: "eTDS – Form 26Q (Non-Salary TDS)", category: "tds" as const, frequency: "quarterly" as const, dueDay: 31, dueMonthOffset: 0, requiresAckNo: true, description: "Quarterly TDS return for non-salary payments. Q1: 31 Jul | Q2: 31 Oct | Q3: 31 Jan | Q4: 31 May." },
        { code: "ETDS-27Q", name: "eTDS – Form 27Q (NRI TDS)", category: "tds" as const, frequency: "quarterly" as const, dueDay: 31, dueMonthOffset: 0, requiresAckNo: true, description: "Quarterly TDS return for payments to NRI/foreign companies." },
    ];

    // Clear existing to avoid duplicates if re-run
    await db.delete(schema.filingTypes).where(isNull(schema.filingTypes.tenantId));

    const insertedFilingTypes = await db
        .insert(schema.filingTypes)
        .values(filingTypeDefs.map(f => ({ ...f, tenantId: null })))
        .returning();

    console.log(`✅ ${insertedFilingTypes.length} system filing types created`);
    process.exit(0);
}

seedFilingsOnly().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
