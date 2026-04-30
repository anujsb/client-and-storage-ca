"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { getTenantId } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTenantSettings() {
    try {
        const tenantId = await getTenantId();
        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, tenantId),
        });

        if (!tenant) throw new Error("Tenant not found");
        return { success: true, data: tenant };
    } catch (error) {
        return { success: false, error: "Failed to fetch settings" };
    }
}

export async function updateFirmProfile(data: { name: string; gstin: string; email: string; phone: string; address: string }) {
    try {
        const tenantId = await getTenantId();
        await db.update(tenants).set({
            name: data.name,
            gstin: data.gstin,
            email: data.email,
            phone: data.phone,
            address: data.address,
        }).where(eq(tenants.id, tenantId));

        revalidatePath("/settings");
        revalidatePath("/dashboard"); // since firm name might be used elsewhere
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update profile" };
    }
}

export async function updatePreferences(preferences: { emailAlerts: boolean; overdueAlerts: boolean; paymentAlerts: boolean; defaultTaskView: string }) {
    try {
        const tenantId = await getTenantId();
        await db.update(tenants).set({
            preferences: preferences
        }).where(eq(tenants.id, tenantId));

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update preferences" };
    }
}
