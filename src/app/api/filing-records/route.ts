import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { FilingService } from "@/services/filing.service";

export async function POST(req: Request) {
    try {
        const tenantId = await getTenantId();
        const body = await req.json();

        if (!body.clientId || !body.filingTypeId || !body.periodLabel || !body.dueDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const record = await FilingService.createFilingRecord(tenantId, {
            clientId: body.clientId,
            filingTypeId: body.filingTypeId,
            periodLabel: body.periodLabel,
            dueDate: new Date(body.dueDate),
            status: body.status,
            notes: body.notes,
        });

        return NextResponse.json(record);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to create filing record" }, { status: 500 });
    }
}
