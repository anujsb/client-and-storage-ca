import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { PaymentService } from "@/services/payment.service";
import { UpdatePaymentSchema } from "@/lib/validations/payment";
import { z } from "zod";

const paymentService = new PaymentService();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ paymentId: string }> }
) {
    try {
        const tenantId = await getTenantId();
        const { paymentId } = await params;
        
        const payment = await paymentService.getById(paymentId, tenantId);
        if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
        
        return NextResponse.json(payment);
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[PAYMENT_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ paymentId: string }> }
) {
    try {
        const tenantId = await getTenantId();
        const { paymentId } = await params;
        
        const body = await request.json();
        const updateData = UpdatePaymentSchema.parse(body);
        
        const result = await paymentService.update(paymentId, tenantId, updateData);
        
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof Error && error.message === "Paid amount cannot exceed total amount") {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[PAYMENT_PATCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
