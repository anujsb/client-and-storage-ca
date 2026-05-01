import { formatCurrency } from "@/lib/utils/currency";
import { DollarSign, Clock, AlertCircle } from "lucide-react";
import { PaymentStatusBadge } from "../payments/PaymentStatusBadge";

export function PendingPaymentsList({ payments }: { payments: any[] }) {
    if (!payments || payments.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-text-dark">All payments cleared</h4>
                <p className="text-xs text-text-muted mt-1">No overdue or pending invoices.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {payments.map(payment => {
                const balance = payment.totalAmount - payment.paidAmount;
                const isOverdue = payment.status === "overdue";

                return (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl border border-border-base hover:bg-slate-50 transition-colors gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                {isOverdue ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-text-dark truncate">{payment.client.name}</div>
                                <div className="text-[11px] font-semibold text-text-muted truncate">
                                    {payment.filingType} • {payment.client.clientCode}
                                </div>
                            </div>
                        </div>
                        <div className="text-right shrink-0 ml-4 flex flex-col items-end">
                            <div className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                {formatCurrency(balance / 100)}
                            </div>
                            <div className="mt-1">
                                <PaymentStatusBadge status={payment.status} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
