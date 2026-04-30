import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { NotificationService } from "@/services/notification.service";

const notificationService = new NotificationService();

export async function POST(request: NextRequest) {
    try {
        const tenantId = await getTenantId();
        const body = await request.json();
        
        if (body.markAll) {
            await notificationService.markAllAsRead(tenantId);
        } else if (body.notificationIds && Array.isArray(body.notificationIds)) {
            await notificationService.markAsRead(tenantId, body.notificationIds);
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[NOTIFICATIONS_READ_POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
