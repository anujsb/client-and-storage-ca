import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export class NotificationService {
    async create(tenantId: string, payload: {
        message: string;
        type: "file_checked_out" | "file_checked_in" | "file_overdue" | "work_status_changed" | "payment_due";
    }) {
        const [notification] = await db.insert(notifications).values({
            tenantId,
            message: payload.message,
            type: payload.type,
            isRead: false,
        }).returning();

        return notification;
    }

    async getUnread(tenantId: string, limit = 20) {
        return await db.select()
            .from(notifications)
            .where(and(eq(notifications.tenantId, tenantId), eq(notifications.isRead, false)))
            .orderBy(desc(notifications.createdAt))
            .limit(limit);
    }

    async markAsRead(tenantId: string, notificationIds: string[]) {
        if (notificationIds.length === 0) return;

        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.tenantId, tenantId),
                inArray(notifications.id, notificationIds)
            ));
    }
    
    async markAllAsRead(tenantId: string) {
        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.tenantId, tenantId),
                eq(notifications.isRead, false)
            ));
    }
}
