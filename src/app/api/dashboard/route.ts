import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { DashboardService } from "@/services/dashboard.service";

const dashboardService = new DashboardService();

export async function GET() {
    try {
        const tenantId = await getTenantId();
        const data = await dashboardService.getDashboardData(tenantId);
        
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[DASHBOARD_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
