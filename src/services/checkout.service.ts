import { db } from "@/lib/db";
import { documents, fileCheckouts } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { CheckoutDocumentInput, CheckinDocumentInput } from "@/lib/validations/document";

export class CheckoutService {
    async checkOut(tenantId: string, documentId: string, input: CheckoutDocumentInput) {
        // 1. Verify document exists and belongs to tenant
        const [doc] = await db
            .select()
            .from(documents)
            .where(and(eq(documents.id, documentId), eq(documents.tenantId, tenantId)))
            .limit(1);

        if (!doc) {
            throw new Error("Document not found");
        }

        if (doc.status === "checked_out") {
            throw new Error("Document is already checked out");
        }

        // 2. Perform checkout sequentially since neon-http doesn't support transactions
        // Create checkout record
        const [checkoutRecord] = await db
            .insert(fileCheckouts)
            .values({
                tenantId,
                documentId,
                employeeId: input.employeeId,
                purpose: input.purpose || null,
                workId: input.workId || null,
            })
            .returning();

        // Update document status
        await db
            .update(documents)
            .set({ status: "checked_out" })
            .where(eq(documents.id, documentId));

        return checkoutRecord;
    }

    async checkIn(tenantId: string, documentId: string, input: CheckinDocumentInput) {
        // 1. Verify document
        const [doc] = await db
            .select()
            .from(documents)
            .where(and(eq(documents.id, documentId), eq(documents.tenantId, tenantId)))
            .limit(1);

        if (!doc) {
            throw new Error("Document not found");
        }

        if (doc.status !== "checked_out") {
            throw new Error("Document is not currently checked out");
        }

        // 2. Find active checkout
        const [activeCheckout] = await db
            .select()
            .from(fileCheckouts)
            .where(
                and(
                    eq(fileCheckouts.documentId, documentId),
                    eq(fileCheckouts.tenantId, tenantId),
                    isNull(fileCheckouts.checkedInAt)
                )
            )
            .limit(1);

        if (activeCheckout) {
            // Update checkout record with checkin time
            await db
                .update(fileCheckouts)
                .set({ checkedInAt: new Date() })
                .where(eq(fileCheckouts.id, activeCheckout.id));
        }

        // 3. Update document status and location
        const updateData: any = { status: "in_office" };
        if (input.locationId !== undefined) {
            updateData.locationId = input.locationId;
        }

        await db
            .update(documents)
            .set(updateData)
            .where(eq(documents.id, documentId));

        return { success: true };
    }
}
