import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { FilingService } from "@/services/filing.service";

export const dynamic = "force-dynamic";

interface Params { params: Promise<{ clientId: string }> }

export async function GET(_req: Request, { params }: Params) {
    try {
        const tenantId = await getTenantId();
        const { clientId } = await params;
        const records = await FilingService.getClientFilingRecords(tenantId, clientId);
        return NextResponse.json(records);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
