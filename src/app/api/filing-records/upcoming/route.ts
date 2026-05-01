import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { FilingService } from "@/services/filing.service";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const tenantId = await getTenantId();
        const upcomings = await FilingService.getUpcomingFilings(tenantId, 365); // 1 year lookahead for full table view
        return NextResponse.json(upcomings);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
