import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { FilingService } from "@/services/filing.service";

export const dynamic = "force-dynamic";

interface Params { params: Promise<{ clientId: string }> }

export async function GET(_req: Request, { params }: Params) {
    try {
        const tenantId = await getTenantId();
        const { clientId } = await params;
        const subscriptions = await FilingService.getClientSubscriptions(tenantId, clientId);
        return NextResponse.json(subscriptions);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function PUT(req: Request, { params }: Params) {
    try {
        const tenantId = await getTenantId();
        const { clientId } = await params;
        const body = await req.json();
        const { filingTypeIds } = body as { filingTypeIds: string[] };

        if (!Array.isArray(filingTypeIds)) {
            return NextResponse.json({ error: "filingTypeIds must be an array" }, { status: 400 });
        }

        await FilingService.setClientSubscriptions(tenantId, clientId, filingTypeIds);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
