import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { CheckoutService } from "@/services/checkout.service";
import { CheckinDocumentSchema } from "@/lib/validations/document";
import { z } from "zod";

const checkoutService = new CheckoutService();

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
) {
    try {
        const tenantId = await getTenantId();
        const { documentId } = await params;
        const body = await request.json();
        
        const data = CheckinDocumentSchema.parse(body);
        await checkoutService.checkIn(tenantId, documentId, data);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error instanceof Error && error.message.includes("not currently checked out")) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("[CHECKIN_PATCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
