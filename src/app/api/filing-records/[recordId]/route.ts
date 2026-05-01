import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { FilingService } from "@/services/filing.service";

export const dynamic = "force-dynamic";

interface Params { params: Promise<{ recordId: string }> }

export async function PATCH(req: Request, { params }: Params) {
    try {
        const tenantId = await getTenantId();
        const { recordId } = await params;
        const body = await req.json();

        const updated = await FilingService.updateFilingRecord(tenantId, recordId, {
            status: body.status,
            filedDate: body.filedDate ? new Date(body.filedDate) : undefined,
            acknowledgmentNo: body.acknowledgmentNo,
            notes: body.notes,
        });

        return NextResponse.json(updated);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 });
    }
}

export async function GET(_req: Request, { params }: Params) {
    try {
        const tenantId = await getTenantId();
        const { recordId } = await params;
        // Upcoming filings across all clients
        const upcomings = await FilingService.getUpcomingFilings(tenantId, 30);
        return NextResponse.json(upcomings);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
