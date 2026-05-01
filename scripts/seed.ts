/**
 * Seed script — run once to create your first tenant + owner account.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires DATABASE_URL in your .env.local
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import bcrypt from "bcryptjs";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ── Due date helpers ─────────────────────────────────────────────────────────

/** Returns JS Date for "day X of monthOffset months after referenceDate" */
function dueDateFor(referenceDate: Date, monthOffset: number, day: number): Date {
    const d = new Date(referenceDate);
    d.setMonth(d.getMonth() + monthOffset, day);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Start of a calendar month */
function monthStart(year: number, month: number): Date { // month: 0-indexed
    return new Date(year, month, 1, 0, 0, 0, 0);
}

/** End of a calendar month (last day, 23:59:59) */
function monthEnd(year: number, month: number): Date {
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

async function seed() {
    console.log("🌱 Seeding database...");

    // ── 1. Create tenant ────────────────────────────────────────────────────────
    const [tenant] = await db
        .insert(schema.tenants)
        .values({
            name: "Demo CA Firm",
            slug: "demo-ca",
        })
        .returning();

    console.log(`✅ Tenant created: ${tenant.name} (${tenant.id})`);

    // ── 2. Create owner user ────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash("password123", 12);

    const [user] = await db
        .insert(schema.users)
        .values({
            tenantId: tenant.id,
            name: "CA Owner",
            email: "owner@demo-ca.com",
            passwordHash,
            role: "owner",
        })
        .returning();

    console.log(`✅ User created: ${user.email}`);

    // ── 3. Sample employees ─────────────────────────────────────────────────────
    const [emp1, emp2] = await db.insert(schema.employees).values([
        { tenantId: tenant.id, name: "Priya Sharma", phone: "9876543210" },
        { tenantId: tenant.id, name: "Rahul Mehta", phone: "9123456780" },
    ]).returning();

    console.log("✅ Sample employees created");

    // ── 4. Sample storage locations ─────────────────────────────────────────────
    const [cupboard1, cupboard2] = await db
        .insert(schema.storageLocations)
        .values([
            { tenantId: tenant.id, parentId: null, name: "Cupboard 1", levelLabel: "Cupboard", sortOrder: 1 },
            { tenantId: tenant.id, parentId: null, name: "Cupboard 2", levelLabel: "Cupboard", sortOrder: 2 },
        ])
        .returning();

    await db.insert(schema.storageLocations).values([
        { tenantId: tenant.id, parentId: cupboard1.id, name: "Shelf 1 (GST)", levelLabel: "Shelf", sortOrder: 1 },
        { tenantId: tenant.id, parentId: cupboard1.id, name: "Shelf 2 (Income Tax)", levelLabel: "Shelf", sortOrder: 2 },
        { tenantId: tenant.id, parentId: cupboard1.id, name: "Shelf 3 (Tax Audit)", levelLabel: "Shelf", sortOrder: 3 },
        { tenantId: tenant.id, parentId: cupboard1.id, name: "Shelf 4 (Trust Audit)", levelLabel: "Shelf", sortOrder: 4 },
    ]);

    console.log("✅ Sample storage locations created");

    // ── 5. System filing types ───────────────────────────────────────────────────
    // tenantId = null → system-wide defaults visible to all tenants

    const filingTypeDefs = [
        {
            code: "GSTR-1",
            name: "GSTR-1 – Outward Supplies (Monthly)",
            category: "gst" as const,
            frequency: "monthly" as const,
            dueDay: 11,
            dueMonthOffset: 1,
            requiresAckNo: true,
            description: "Statement of outward supplies by a registered taxpayer. Due 11th of following month.",
        },
        {
            code: "GSTR-1-Q",
            name: "GSTR-1 – Outward Supplies (Quarterly / QRMP)",
            category: "gst" as const,
            frequency: "quarterly" as const,
            dueDay: 13,
            dueMonthOffset: 1,
            requiresAckNo: true,
            description: "Quarterly version for taxpayers under QRMP scheme. Due 13th of month following the quarter.",
        },
        {
            code: "GSTR-3B",
            name: "GSTR-3B – Summary Return (Monthly)",
            category: "gst" as const,
            frequency: "monthly" as const,
            dueDay: 20,
            dueMonthOffset: 1,
            requiresAckNo: true,
            description: "Monthly self-assessed summary return. Due 20th of following month.",
        },
        {
            code: "GSTR-3B-Q",
            name: "GSTR-3B – Summary Return (Quarterly / QRMP)",
            category: "gst" as const,
            frequency: "quarterly" as const,
            dueDay: 22,
            dueMonthOffset: 1,
            requiresAckNo: true,
            description: "Quarterly version under QRMP scheme. Due 22nd (or 24th) of month following the quarter.",
        },
        {
            code: "GSTR-7",
            name: "GSTR-7 – TDS Under GST",
            category: "gst" as const,
            frequency: "monthly" as const,
            dueDay: 10,
            dueMonthOffset: 1,
            requiresAckNo: true,
            description: "Return for TDS deducted under GST. Due 10th of following month.",
        },
        {
            code: "GSTR-9",
            name: "GSTR-9 – Annual Return",
            category: "gst" as const,
            frequency: "annually" as const,
            dueDay: 31,
            dueMonthOffset: 0, // special: fixed month (December) of following FY
            requiresAckNo: true,
            description: "Annual consolidated return for regular taxpayers. Due 31st December of following FY.",
        },
        {
            code: "ITR",
            name: "ITR – Income Tax Return (Non-Audit)",
            category: "income_tax" as const,
            frequency: "annually" as const,
            dueDay: 31,
            dueMonthOffset: 0, // special: fixed month (July)
            requiresAckNo: true,
            description: "Annual income tax return for individuals/firms not requiring audit. Due 31st July.",
        },
        {
            code: "ITR-AUDIT",
            name: "ITR – Income Tax Return (Audit Case)",
            category: "income_tax" as const,
            frequency: "annually" as const,
            dueDay: 31,
            dueMonthOffset: 0, // special: fixed month (October)
            requiresAckNo: true,
            description: "Annual income tax return for cases requiring tax audit. Due 31st October.",
        },
        {
            code: "TAX-AUDIT",
            name: "Tax Audit Report – Form 3CD",
            category: "audit" as const,
            frequency: "annually" as const,
            dueDay: 30,
            dueMonthOffset: 0, // special: fixed month (September)
            requiresAckNo: false,
            description: "Tax audit under Section 44AB. Report due 30th September of assessment year.",
        },
        {
            code: "ETDS-24Q",
            name: "eTDS – Form 24Q (Salary TDS)",
            category: "tds" as const,
            frequency: "quarterly" as const,
            dueDay: 31, // varies by quarter — Q1: 31 Jul, Q2: 31 Oct, Q3: 31 Jan, Q4: 31 May
            dueMonthOffset: 0,
            requiresAckNo: true,
            description: "Quarterly TDS return for salary payments. Q1: 31 Jul | Q2: 31 Oct | Q3: 31 Jan | Q4: 31 May.",
        },
        {
            code: "ETDS-26Q",
            name: "eTDS – Form 26Q (Non-Salary TDS)",
            category: "tds" as const,
            frequency: "quarterly" as const,
            dueDay: 31, // same quarterly schedule as 24Q
            dueMonthOffset: 0,
            requiresAckNo: true,
            description: "Quarterly TDS return for non-salary payments. Q1: 31 Jul | Q2: 31 Oct | Q3: 31 Jan | Q4: 31 May.",
        },
        {
            code: "ETDS-27Q",
            name: "eTDS – Form 27Q (NRI TDS)",
            category: "tds" as const,
            frequency: "quarterly" as const,
            dueDay: 31,
            dueMonthOffset: 0,
            requiresAckNo: true,
            description: "Quarterly TDS return for payments to NRI/foreign companies.",
        },
    ];

    const insertedFilingTypes = await db
        .insert(schema.filingTypes)
        .values(filingTypeDefs.map(f => ({ ...f, tenantId: null })))
        .returning();

    console.log(`✅ ${insertedFilingTypes.length} system filing types created`);

    // Build a lookup map: code → id
    const ftByCode: Record<string, string> = {};
    insertedFilingTypes.forEach(ft => { ftByCode[ft.code] = ft.id; });

    // ── 6. Sample clients ─────────────────────────────────────────────────────────
    const [client1] = await db
        .insert(schema.clients)
        .values({
            tenantId: tenant.id,
            clientCode: "C-0001",
            pan: "ABCDE1234F",
            name: "Ramesh Traders",
            phone: "9988776655",
            email: "ramesh@example.com",
            address: "12, Gandhi Nagar, Mumbai, MH 400001",
            notes: "GST monthly filer. Proprietorship firm. Regular client since 2019.",
        })
        .returning();

    const [client2] = await db
        .insert(schema.clients)
        .values({
            tenantId: tenant.id,
            clientCode: "C-0002",
            pan: "XYZAB5678G",
            name: "Sunita Constructions Pvt Ltd",
            phone: "9876001234",
            email: "sunita@sunitaconst.com",
            address: "45, MG Road, Pune, MH 411001",
            notes: "Audit case. Quarterly QRMP scheme.",
        })
        .returning();

    console.log(`✅ Sample clients created: ${client1.name}, ${client2.name}`);

    // ── 7. Client filing subscriptions ───────────────────────────────────────────
    // Client 1: GSTR-1 (monthly), GSTR-3B (monthly), ITR, ETDS-26Q
    await db.insert(schema.clientFilingSubscriptions).values([
        { tenantId: tenant.id, clientId: client1.id, filingTypeId: ftByCode["GSTR-1"] },
        { tenantId: tenant.id, clientId: client1.id, filingTypeId: ftByCode["GSTR-3B"] },
        { tenantId: tenant.id, clientId: client1.id, filingTypeId: ftByCode["ITR"] },
        { tenantId: tenant.id, clientId: client1.id, filingTypeId: ftByCode["ETDS-26Q"] },
    ]);

    // Client 2: GSTR-1-Q (quarterly), GSTR-3B-Q (quarterly), ITR-AUDIT, TAX-AUDIT
    await db.insert(schema.clientFilingSubscriptions).values([
        { tenantId: tenant.id, clientId: client2.id, filingTypeId: ftByCode["GSTR-1-Q"] },
        { tenantId: tenant.id, clientId: client2.id, filingTypeId: ftByCode["GSTR-3B-Q"] },
        { tenantId: tenant.id, clientId: client2.id, filingTypeId: ftByCode["ITR-AUDIT"] },
        { tenantId: tenant.id, clientId: client2.id, filingTypeId: ftByCode["TAX-AUDIT"] },
    ]);

    console.log("✅ Client filing subscriptions created");

    // ── 8. Sample filing records (current FY: Apr 2025 – Mar 2026) ──────────────
    const now = new Date();
    const filingRecordValues: (typeof schema.filingRecords.$inferInsert)[] = [];

    // Client 1: GSTR-1 monthly — Apr 2025 to current month
    // Apr 2025 = month index 3, year 2025
    const gstr1MonthlyMonths = [
        { year: 2025, month: 3, label: "Apr 2025" },  // due 11 May 2025
        { year: 2025, month: 4, label: "May 2025" },  // due 11 Jun 2025
        { year: 2025, month: 5, label: "Jun 2025" },  // due 11 Jul 2025 (future)
    ];
    for (const { year, month, label } of gstr1MonthlyMonths) {
        filingRecordValues.push({
            tenantId: tenant.id,
            clientId: client1.id,
            filingTypeId: ftByCode["GSTR-1"],
            periodLabel: label,
            periodStart: monthStart(year, month),
            periodEnd: monthEnd(year, month),
            dueDate: new Date(year, month + 1, 11), // 11th of next month
            status: label === "Apr 2025" ? "filed" : label === "May 2025" ? "in_progress" : "pending",
            filedDate: label === "Apr 2025" ? new Date(2025, 4, 9) : null,
            acknowledgmentNo: label === "Apr 2025" ? "AA01234567890" : null,
        });
    }

    // Client 1: GSTR-3B monthly
    const gstr3bMonthlyMonths = [
        { year: 2025, month: 3, label: "Apr 2025" },
        { year: 2025, month: 4, label: "May 2025" },
        { year: 2025, month: 5, label: "Jun 2025" },
    ];
    for (const { year, month, label } of gstr3bMonthlyMonths) {
        filingRecordValues.push({
            tenantId: tenant.id,
            clientId: client1.id,
            filingTypeId: ftByCode["GSTR-3B"],
            periodLabel: label,
            periodStart: monthStart(year, month),
            periodEnd: monthEnd(year, month),
            dueDate: new Date(year, month + 1, 20), // 20th of next month
            status: label === "Apr 2025" ? "filed" : "pending",
            filedDate: label === "Apr 2025" ? new Date(2025, 4, 18) : null,
            acknowledgmentNo: label === "Apr 2025" ? "BB09876543210" : null,
        });
    }

    // Client 1: ITR FY 2024-25 (annual)
    filingRecordValues.push({
        tenantId: tenant.id,
        clientId: client1.id,
        filingTypeId: ftByCode["ITR"],
        periodLabel: "FY 2024-25",
        periodStart: new Date(2024, 3, 1),   // 1 Apr 2024
        periodEnd: new Date(2025, 2, 31),    // 31 Mar 2025
        dueDate: new Date(2025, 6, 31),      // 31 Jul 2025
        status: "pending",
    });

    // Client 1: ETDS-26Q Q4 FY24-25 (due 31 May 2025) and Q1 FY25-26 (due 31 Jul 2025)
    filingRecordValues.push({
        tenantId: tenant.id,
        clientId: client1.id,
        filingTypeId: ftByCode["ETDS-26Q"],
        periodLabel: "Q4 FY 2024-25",
        periodStart: new Date(2025, 0, 1),   // 1 Jan 2025
        periodEnd: new Date(2025, 2, 31),    // 31 Mar 2025
        dueDate: new Date(2025, 4, 31),      // 31 May 2025
        status: "in_progress",
    });
    filingRecordValues.push({
        tenantId: tenant.id,
        clientId: client1.id,
        filingTypeId: ftByCode["ETDS-26Q"],
        periodLabel: "Q1 FY 2025-26",
        periodStart: new Date(2025, 3, 1),   // 1 Apr 2025
        periodEnd: new Date(2025, 5, 30),    // 30 Jun 2025
        dueDate: new Date(2025, 6, 31),      // 31 Jul 2025
        status: "pending",
    });

    // Client 2: GSTR-1-Q quarterly (Q4 FY24-25: due 13 Apr, Q1 FY25-26: due 13 Jul)
    filingRecordValues.push({
        tenantId: tenant.id,
        clientId: client2.id,
        filingTypeId: ftByCode["GSTR-1-Q"],
        periodLabel: "Q4 FY 2024-25",
        periodStart: new Date(2025, 0, 1),
        periodEnd: new Date(2025, 2, 31),
        dueDate: new Date(2025, 3, 13),      // 13 Apr 2025
        status: "filed",
        filedDate: new Date(2025, 3, 10),
        acknowledgmentNo: "CC11122233344",
    });
    filingRecordValues.push({
        tenantId: tenant.id,
        clientId: client2.id,
        filingTypeId: ftByCode["GSTR-1-Q"],
        periodLabel: "Q1 FY 2025-26",
        periodStart: new Date(2025, 3, 1),
        periodEnd: new Date(2025, 5, 30),
        dueDate: new Date(2025, 6, 13),      // 13 Jul 2025
        status: "pending",
    });

    // Client 2: TAX-AUDIT FY 2024-25 (due 30 Sep 2025)
    filingRecordValues.push({
        tenantId: tenant.id,
        clientId: client2.id,
        filingTypeId: ftByCode["TAX-AUDIT"],
        periodLabel: "FY 2024-25",
        periodStart: new Date(2024, 3, 1),
        periodEnd: new Date(2025, 2, 31),
        dueDate: new Date(2025, 8, 30),      // 30 Sep 2025
        status: "pending",
    });

    // Client 2: ITR-AUDIT FY 2024-25 (due 31 Oct 2025)
    filingRecordValues.push({
        tenantId: tenant.id,
        clientId: client2.id,
        filingTypeId: ftByCode["ITR-AUDIT"],
        periodLabel: "FY 2024-25",
        periodStart: new Date(2024, 3, 1),
        periodEnd: new Date(2025, 2, 31),
        dueDate: new Date(2025, 9, 31),      // 31 Oct 2025
        status: "pending",
    });

    await db.insert(schema.filingRecords).values(filingRecordValues);
    console.log(`✅ ${filingRecordValues.length} sample filing records created`);

    console.log("\n🎉 Seed complete!");
    console.log("─────────────────────────────────");
    console.log(`Login email    : owner@demo-ca.com`);
    console.log(`Login password : password123`);
    console.log("─────────────────────────────────");

    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});