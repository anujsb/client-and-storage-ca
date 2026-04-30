import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { NotificationService } from "@/services/notification.service";

const notificationService = new NotificationService();

export async function GET() {
    try {
        const tenantId = await getTenantId();
        const notifications = await notificationService.getUnread(tenantId);
        
        return NextResponse.json(notifications);
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[NOTIFICATIONS_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
