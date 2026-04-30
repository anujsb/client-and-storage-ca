import { z } from "zod";

export const CreatePaymentSchema = z.object({
    clientId: z.string().uuid("Invalid client ID"),
    filingType: z.string().min(1, "Filing type is required").max(100),
    period: z.string().min(1, "Period is required").max(50),
    totalAmount: z.number().int().nonnegative("Total amount must be positive"), // Sent in paise
    paidAmount: z.number().int().nonnegative().optional().default(0), // Sent in paise
    dueDate: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
    paymentMode: z.enum(["cash", "upi", "bank_transfer", "cheque"]).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
}).refine(data => (data.paidAmount ?? 0) <= data.totalAmount, {
    message: "Paid amount cannot exceed total amount",
    path: ["paidAmount"],
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

export const UpdatePaymentSchema = z.object({
    filingType: z.string().min(1).max(100).optional(),
    period: z.string().min(1).max(50).optional(),
    totalAmount: z.number().int().nonnegative().optional(),
    paidAmount: z.number().int().nonnegative().optional(),
    dueDate: z.string().datetime().nullable().optional().or(z.date().nullable().optional()),
    paymentMode: z.enum(["cash", "upi", "bank_transfer", "cheque"]).nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
});

// We can't do the same refine here easily because they might just update paidAmount 
// without sending totalAmount. Service layer will validate constraints during update.

export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
