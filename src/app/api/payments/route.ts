import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { PaymentService } from "@/services/payment.service";
import { NotificationService } from "@/services/notification.service";
import { CreatePaymentSchema } from "@/lib/validations/payment";
import { z } from "zod";

const paymentService = new PaymentService();
const notificationService = new NotificationService();

export async function GET() {
    try {
        const tenantId = await getTenantId();
        const payments = await paymentService.list(tenantId);
        return NextResponse.json(payments);
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[PAYMENTS_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const tenantId = await getTenantId();
        const body = await request.json();
        const data = CreatePaymentSchema.parse(body);
        
        const payment = await paymentService.create(tenantId, data);

        await notificationService.create(tenantId, {
            title: "New Payment Recorded",
            message: `Payment of ${data.totalAmount / 100} recorded for ${data.filingType}`,
            type: "payment_due",
            link: "/payments"
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[PAYMENTS_POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
