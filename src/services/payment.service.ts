import { db } from "@/lib/db";
import { payments, clients } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CreatePaymentInput, UpdatePaymentInput } from "@/lib/validations/payment";
import { PaymentStatus } from "@/types/payment";

export class PaymentService {
    static computeStatus(totalAmount: number, paidAmount: number, dueDate: Date | null): PaymentStatus {
        if (paidAmount >= totalAmount) return "paid";
        
        if (dueDate && new Date(dueDate) < new Date() && paidAmount < totalAmount) {
            return "overdue";
        }
        
        if (paidAmount > 0) return "partial";
        
        return "unpaid";
    }

    async list(tenantId: string) {
        const results = await db
            .select({
                id: payments.id,
                filingType: payments.filingType,
                period: payments.period,
                totalAmount: payments.totalAmount,
                paidAmount: payments.paidAmount,
                dueDate: payments.dueDate,
                paymentMode: payments.paymentMode,
                createdAt: payments.createdAt,
                client: {
                    id: clients.id,
                    name: clients.name,
                    clientCode: clients.clientCode,
                }
            })
            .from(payments)
            .innerJoin(clients, eq(payments.clientId, clients.id))
            .where(eq(payments.tenantId, tenantId))
            .orderBy(desc(payments.createdAt));

        return results.map(p => ({
            ...p,
            status: PaymentService.computeStatus(p.totalAmount, p.paidAmount, p.dueDate)
        }));
    }

    async getById(id: string, tenantId: string) {
        const [payment] = await db
            .select({
                id: payments.id,
                filingType: payments.filingType,
                period: payments.period,
                totalAmount: payments.totalAmount,
                paidAmount: payments.paidAmount,
                dueDate: payments.dueDate,
                paymentMode: payments.paymentMode,
                notes: payments.notes,
                createdAt: payments.createdAt,
                client: {
                    id: clients.id,
                    name: clients.name,
                    clientCode: clients.clientCode,
                }
            })
            .from(payments)
            .innerJoin(clients, eq(payments.clientId, clients.id))
            .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)))
            .limit(1);

        if (!payment) return null;

        return {
            ...payment,
            status: PaymentService.computeStatus(payment.totalAmount, payment.paidAmount, payment.dueDate)
        };
    }

    async create(tenantId: string, input: CreatePaymentInput) {
        let dueDateObj = input.dueDate ? new Date(input.dueDate) : null;

        const [payment] = await db.insert(payments).values({
            tenantId,
            clientId: input.clientId,
            filingType: input.filingType,
            period: input.period,
            totalAmount: input.totalAmount,
            paidAmount: input.paidAmount || 0,
            dueDate: dueDateObj,
            paymentMode: input.paymentMode || null,
            notes: input.notes || null,
        }).returning();

        return {
            ...payment,
            status: PaymentService.computeStatus(payment.totalAmount, payment.paidAmount, payment.dueDate)
        };
    }

    async update(id: string, tenantId: string, input: UpdatePaymentInput) {
        // Fetch current to validate
        const [current] = await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.tenantId, tenantId))).limit(1);
        if (!current) throw new Error("Payment not found");

        const updateData: any = { ...input };
        
        if (input.dueDate !== undefined) {
            updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
        }

        // Validate paid amount doesn't exceed total
        const newTotal = input.totalAmount !== undefined ? input.totalAmount : current.totalAmount;
        const newPaid = input.paidAmount !== undefined ? input.paidAmount : current.paidAmount;
        
        if (newPaid > newTotal) {
            throw new Error("Paid amount cannot exceed total amount");
        }

        const [payment] = await db.update(payments).set(updateData).where(and(eq(payments.id, id), eq(payments.tenantId, tenantId))).returning();
        
        return {
            ...payment,
            status: PaymentService.computeStatus(payment.totalAmount, payment.paidAmount, payment.dueDate)
        };
    }
}
