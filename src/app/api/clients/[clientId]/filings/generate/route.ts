import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { FilingService } from "@/services/filing.service";

export const dynamic = "force-dynamic";

interface Params { params: Promise<{ clientId: string }> }

export async function POST(req: Request, { params }: Params) {
    try {
        const tenantId = await getTenantId();
        const { clientId } = await params;
        const body = await req.json();

        const fromDate = body.fromDate ? new Date(body.fromDate) : new Date(new Date().getFullYear() - 1, 3, 1); // 1 Apr last FY
        const toDate = body.toDate ? new Date(body.toDate) : new Date(new Date().getFullYear() + 1, 2, 31); // 31 Mar next FY

        const count = await FilingService.generateFilingRecords(tenantId, clientId, fromDate, toDate);
        return NextResponse.json({ generated: count });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
