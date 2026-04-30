export type PaymentStatus = "paid" | "partial" | "unpaid" | "overdue";

export interface Payment {
    id: string;
    tenantId: string;
    clientId: string;
    filingType: string;
    period: string;
    totalAmount: number; // Stored in paise
    paidAmount: number;  // Stored in paise
    dueDate: Date | null;
    paymentMode: "cash" | "upi" | "bank_transfer" | "cheque" | null;
    notes: string | null;
    createdAt: Date;
    // Relations
    client?: {
        id: string;
        name: string;
        clientCode: string;
    };
    // Computed dynamically on the client or server
    status?: PaymentStatus;
}
