import { db } from "@/lib/db";
import {
    filingTypes,
    clientFilingSubscriptions,
    filingRecords,
    clients,
} from "@/lib/db/schema";
import { eq, and, lte, or, inArray, desc, asc, gte } from "drizzle-orm";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type FilingType = typeof filingTypes.$inferSelect;
export type ClientFilingSubscription = typeof clientFilingSubscriptions.$inferSelect;
export type FilingRecord = typeof filingRecords.$inferSelect;

export type FilingRecordWithType = FilingRecord & {
    filingType: FilingType;
};

export type FilingRecordWithClientAndType = FilingRecord & {
    filingType: FilingType;
    client: { id: string; name: string; clientCode: string };
};

export type SubscriptionWithType = ClientFilingSubscription & {
    filingType: FilingType;
};

// ─── Due date computation ───────────────────────────────────────────────────────

/**
 * Compute the due date for a filing record given:
 *  - The filing type's dueDay and dueMonthOffset
 *  - The period end date
 *
 * Special cases for eTDS quarterly and annual filings are handled by
 * pre-setting the dueDate at generation time.
 */
function computeDueDate(
    filingType: FilingType,
    periodEnd: Date
): Date {
    const { dueDay, dueMonthOffset } = filingType;
    if (!dueDay) return periodEnd;

    const due = new Date(periodEnd);
    due.setMonth(due.getMonth() + (dueMonthOffset ?? 1), dueDay);
    due.setHours(23, 59, 59, 999);
    return due;
}

/**
 * eTDS quarterly due dates (hardcoded by quarter).
 * quarter: 1 = Apr-Jun, 2 = Jul-Sep, 3 = Oct-Dec, 4 = Jan-Mar
 */
function etdsDueDate(quarter: 1 | 2 | 3 | 4, fiscalYear: number): Date {
    // fiscalYear = the year the quarter STARTS in
    switch (quarter) {
        case 1: return new Date(fiscalYear, 6, 31);       // 31 Jul
        case 2: return new Date(fiscalYear, 9, 31);       // 31 Oct
        case 3: return new Date(fiscalYear + 1, 0, 31);   // 31 Jan
        case 4: return new Date(fiscalYear + 1, 4, 31);   // 31 May
    }
}

// ─── Period generation helpers ─────────────────────────────────────────────────

interface GeneratedPeriod {
    label: string;
    start: Date;
    end: Date;
    dueDate: Date;
}

function generateMonthlyPeriods(
    filingType: FilingType,
    fromDate: Date,
    toDate: Date
): GeneratedPeriod[] {
    const months: GeneratedPeriod[] = [];
    const cur = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    const end = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    while (cur <= end) {
        const year = cur.getFullYear();
        const month = cur.getMonth();
        const periodEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
        months.push({
            label: `${MONTH_NAMES[month]} ${year}`,
            start: new Date(year, month, 1),
            end: periodEnd,
            dueDate: computeDueDate(filingType, periodEnd),
        });
        cur.setMonth(cur.getMonth() + 1);
    }
    return months;
}

function generateQuarterlyPeriods(
    filingType: FilingType,
    fromDate: Date,
    toDate: Date
): GeneratedPeriod[] {
    const isETDS = filingType.code.startsWith("ETDS-");
    const periods: GeneratedPeriod[] = [];

    // Quarters are Apr-Jun (Q1), Jul-Sep (Q2), Oct-Dec (Q3), Jan-Mar (Q4) in Indian FY
    const quarters = [
        { q: 1 as const, months: [3, 4, 5] },   // Apr, May, Jun  (month indices)
        { q: 2 as const, months: [6, 7, 8] },   // Jul, Aug, Sep
        { q: 3 as const, months: [9, 10, 11] }, // Oct, Nov, Dec
        { q: 4 as const, months: [0, 1, 2] },   // Jan, Feb, Mar (next calendar year)
    ];

    // Walk FY years from fromDate to toDate
    const startFY = fromDate.getMonth() >= 3 ? fromDate.getFullYear() : fromDate.getFullYear() - 1;
    const endFY = toDate.getMonth() >= 3 ? toDate.getFullYear() : toDate.getFullYear() - 1;

    for (let fy = startFY; fy <= endFY; fy++) {
        for (const { q, months } of quarters) {
            const calYear = q === 4 ? fy + 1 : fy;
            const qStart = new Date(calYear, months[0], 1);
            const qEnd = new Date(calYear, months[2] + 1, 0, 23, 59, 59, 999);

            if (qStart > toDate || qEnd < fromDate) continue;

            const fyLabel = `FY ${fy}-${String(fy + 1).slice(-2)}`;
            const label = `Q${q} ${fyLabel}`;
            const dueDate = isETDS ? etdsDueDate(q, fy) : computeDueDate(filingType, qEnd);

            periods.push({ label, start: qStart, end: qEnd, dueDate });
        }
    }
    return periods;
}

function generateAnnualPeriods(
    filingType: FilingType,
    fromDate: Date,
    toDate: Date
): GeneratedPeriod[] {
    const periods: GeneratedPeriod[] = [];
    const startFY = fromDate.getMonth() >= 3 ? fromDate.getFullYear() : fromDate.getFullYear() - 1;
    const endFY = toDate.getMonth() >= 3 ? toDate.getFullYear() : toDate.getFullYear() - 1;

    for (let fy = startFY; fy <= endFY; fy++) {
        const fyStart = new Date(fy, 3, 1);          // 1 Apr
        const fyEnd = new Date(fy + 1, 2, 31, 23, 59, 59);  // 31 Mar

        let dueDate: Date;
        switch (filingType.code) {
            case "GSTR-9":
                dueDate = new Date(fy + 1, 11, 31); // 31 Dec of following year
                break;
            case "ITR":
                dueDate = new Date(fy + 1, 6, 31);  // 31 Jul
                break;
            case "ITR-AUDIT":
                dueDate = new Date(fy + 1, 9, 31);  // 31 Oct
                break;
            case "TAX-AUDIT":
                dueDate = new Date(fy + 1, 8, 30);  // 30 Sep
                break;
            default:
                dueDate = computeDueDate(filingType, fyEnd);
        }

        periods.push({
            label: `FY ${fy}-${String(fy + 1).slice(-2)}`,
            start: fyStart,
            end: fyEnd,
            dueDate,
        });
    }
    return periods;
}

// ─── Filing Service ────────────────────────────────────────────────────────────

export const FilingService = {
    // ── Filing Types ──────────────────────────────────────────────────────────

    /** Get all active filing types (system defaults + tenant custom) */
    async getFilingTypes(tenantId: string): Promise<FilingType[]> {
        const all = await db.query.filingTypes.findMany({
            where: and(
                eq(filingTypes.isActive, true),
                or(
                    eq(filingTypes.tenantId as any, null),
                    eq(filingTypes.tenantId, tenantId)
                )
            ),
            orderBy: [asc(filingTypes.category), asc(filingTypes.code)],
        });
        // Drizzle doesn't perfectly handle IS NULL in the above — do a raw filter too
        return all;
    },

    // ── Subscriptions ─────────────────────────────────────────────────────────

    /** Get all filing subscriptions for a client */
    async getClientSubscriptions(tenantId: string, clientId: string): Promise<SubscriptionWithType[]> {
        return await db.query.clientFilingSubscriptions.findMany({
            where: and(
                eq(clientFilingSubscriptions.tenantId, tenantId),
                eq(clientFilingSubscriptions.clientId, clientId),
                eq(clientFilingSubscriptions.isActive, true),
            ),
            with: { filingType: true },
        }) as SubscriptionWithType[];
    },

    /** Replace all subscriptions for a client (used during create/edit) */
    async setClientSubscriptions(
        tenantId: string,
        clientId: string,
        filingTypeIds: string[]
    ): Promise<void> {
        // Delete existing
        await db.delete(clientFilingSubscriptions).where(
            and(
                eq(clientFilingSubscriptions.tenantId, tenantId),
                eq(clientFilingSubscriptions.clientId, clientId),
            )
        );

        if (filingTypeIds.length === 0) return;

        // Insert new
        await db.insert(clientFilingSubscriptions).values(
            filingTypeIds.map(ftId => ({
                tenantId,
                clientId,
                filingTypeId: ftId,
            }))
        );
    },

    // ── Filing Records ────────────────────────────────────────────────────────

    /** Get all filing records for a client, newest first */
    async getClientFilingRecords(
        tenantId: string,
        clientId: string
    ): Promise<FilingRecordWithType[]> {
        return await db.query.filingRecords.findMany({
            where: and(
                eq(filingRecords.tenantId, tenantId),
                eq(filingRecords.clientId, clientId),
            ),
            with: { filingType: true },
            orderBy: [desc(filingRecords.dueDate)],
        }) as FilingRecordWithType[];
    },

    /**
     * Get all pending/overdue filing records across ALL clients for this tenant.
     * Used by the Works page Upcoming Filings panel.
     */
    async getUpcomingFilings(
        tenantId: string,
        daysAhead: number = 365
    ): Promise<FilingRecordWithClientAndType[]> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + daysAhead);

        const pastCutoff = new Date();
        pastCutoff.setMonth(pastCutoff.getMonth() - 3); // Show history up to 3 months ago

        const records = await db.query.filingRecords.findMany({
            where: and(
                eq(filingRecords.tenantId, tenantId),
                lte(filingRecords.dueDate, cutoff),
                or(
                    // If it's pending/in_progress, show it even if it's older than 3 months (overdue)
                    eq(filingRecords.status, "pending"),
                    eq(filingRecords.status, "in_progress"),
                    // If it's filed, only show if it was due in the last 3 months
                    gte(filingRecords.dueDate, pastCutoff)
                )
            ),
            with: {
                filingType: true,
                client: true,
            },
            orderBy: [desc(filingRecords.dueDate)],
        });

        return records.map(r => ({
            ...r,
            client: { id: r.client.id, name: r.client.name, clientCode: r.client.clientCode },
        })) as FilingRecordWithClientAndType[];
    },

    /** Get stats for a client: total, overdue, in_progress, filed */
    async getClientFilingStats(tenantId: string, clientId: string) {
        const records = await db.query.filingRecords.findMany({
            where: and(
                eq(filingRecords.tenantId, tenantId),
                eq(filingRecords.clientId, clientId),
            ),
        });

        const now = new Date();
        const total = records.length;
        const filed = records.filter(r => r.status === "filed" || r.status === "late_filed").length;
        const inProgress = records.filter(r => r.status === "in_progress").length;
        const overdue = records.filter(
            r => (r.status === "pending" || r.status === "in_progress") && r.dueDate < now
        ).length;
        const pending = records.filter(r => r.status === "pending").length;

        return { total, filed, inProgress, overdue, pending };
    },

    /** Get upcoming filings for a specific client (next N days) */
    async getClientUpcomingFilings(
        tenantId: string,
        clientId: string,
        daysAhead: number = 30
    ): Promise<FilingRecordWithType[]> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + daysAhead);

        return await db.query.filingRecords.findMany({
            where: and(
                eq(filingRecords.tenantId, tenantId),
                eq(filingRecords.clientId, clientId),
                or(
                    eq(filingRecords.status, "pending"),
                    eq(filingRecords.status, "in_progress"),
                ),
                lte(filingRecords.dueDate, cutoff),
            ),
            with: { filingType: true },
            orderBy: [asc(filingRecords.dueDate)],
        }) as FilingRecordWithType[];
    },

    /** Update a filing record (mark filed, enter ack number, change status, or edit details) */
    async updateFilingRecord(
        tenantId: string,
        recordId: string,
        data: {
            status?: typeof filingRecords.$inferInsert["status"];
            filedDate?: Date | null;
            acknowledgmentNo?: string | null;
            notes?: string | null;
            periodLabel?: string;
            dueDate?: Date;
            filingTypeId?: string;
        }
    ): Promise<FilingRecord> {
        const [updated] = await db
            .update(filingRecords)
            .set({
                ...data,
                // Auto-detect late filing
                ...(data.status === "filed" && data.filedDate ? {
                    status: data.filedDate > (await db.query.filingRecords.findFirst({
                        where: and(eq(filingRecords.tenantId, tenantId), eq(filingRecords.id, recordId))
                    }))!.dueDate ? "late_filed" : "filed",
                } : {}),
            })
            .where(and(eq(filingRecords.tenantId, tenantId), eq(filingRecords.id, recordId)))
            .returning();

        if (!updated) throw new Error("Filing record not found");
        return updated;
    },

    /** Manually create a single filing record */
    async createFilingRecord(
        tenantId: string,
        data: {
            clientId: string;
            filingTypeId: string;
            periodLabel: string;
            dueDate: Date;
            status?: typeof filingRecords.$inferInsert["status"];
            notes?: string | null;
        }
    ): Promise<FilingRecord> {
        const [record] = await db
            .insert(filingRecords)
            .values({
                tenantId,
                clientId: data.clientId,
                filingTypeId: data.filingTypeId,
                periodLabel: data.periodLabel,
                dueDate: data.dueDate,
                status: data.status || "pending",
                notes: data.notes,
                periodStart: new Date(), // Manual records might not have strict periods
                periodEnd: new Date(),
            })
            .returning();
        
        return record;
    },

    /** Delete a filing record */
    async deleteFilingRecord(tenantId: string, recordId: string): Promise<void> {
        await db
            .delete(filingRecords)
            .where(and(eq(filingRecords.tenantId, tenantId), eq(filingRecords.id, recordId)));
    },

    /**
     * Generate filing records for a client based on their subscriptions.
     * fromDate → toDate window. Skips periods that already have a record.
     */
    async generateFilingRecords(
        tenantId: string,
        clientId: string,
        fromDate: Date,
        toDate: Date
    ): Promise<number> {
        const subscriptions = await db.query.clientFilingSubscriptions.findMany({
            where: and(
                eq(clientFilingSubscriptions.tenantId, tenantId),
                eq(clientFilingSubscriptions.clientId, clientId),
                eq(clientFilingSubscriptions.isActive, true),
            ),
            with: { filingType: true },
        });

        if (subscriptions.length === 0) return 0;

        const existingRecords = await db.query.filingRecords.findMany({
            where: and(
                eq(filingRecords.tenantId, tenantId),
                eq(filingRecords.clientId, clientId),
            ),
        });

        // Build a set of "filingTypeId:periodLabel" already present
        const existing = new Set(existingRecords.map(r => `${r.filingTypeId}:${r.periodLabel}`));

        const toInsert: (typeof filingRecords.$inferInsert)[] = [];

        for (const sub of subscriptions) {
            const ft = (sub as any).filingType as FilingType;
            let periods: GeneratedPeriod[] = [];

            switch (ft.frequency) {
                case "monthly":
                    periods = generateMonthlyPeriods(ft, fromDate, toDate);
                    break;
                case "quarterly":
                    periods = generateQuarterlyPeriods(ft, fromDate, toDate);
                    break;
                case "annually":
                    periods = generateAnnualPeriods(ft, fromDate, toDate);
                    break;
                default:
                    break;
            }

            for (const p of periods) {
                const key = `${ft.id}:${p.label}`;
                if (existing.has(key)) continue;
                toInsert.push({
                    tenantId,
                    clientId,
                    filingTypeId: ft.id,
                    periodLabel: p.label,
                    periodStart: p.start,
                    periodEnd: p.end,
                    dueDate: p.dueDate,
                    status: "pending",
                });
            }
        }

        if (toInsert.length > 0) {
            await db.insert(filingRecords).values(toInsert);
        }
        return toInsert.length;
    },
};
