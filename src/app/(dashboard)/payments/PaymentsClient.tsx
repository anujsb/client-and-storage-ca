"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { PaymentTable } from "@/components/payments/PaymentTable";
import { formatCurrency } from "@/lib/utils/currency";

export function PaymentsClient() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/payments");
            if (res.ok) setPayments(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleEdit = (payment: any) => {
        setEditingPayment(payment);
        setIsFormOpen(true);
    };

    const handleFormClose = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) setTimeout(() => setEditingPayment(null), 200);
    };

    const filteredPayments = payments.filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.client.name.toLowerCase().includes(q) ||
            p.client.clientCode.toLowerCase().includes(q) ||
            p.filingType.toLowerCase().includes(q);
    });

    const metrics = {
        totalReceivables: payments.reduce((acc, p) => acc + p.totalAmount, 0),
        totalCollected: payments.reduce((acc, p) => acc + p.paidAmount, 0),
        outstanding: payments.reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0),
        overdue: payments.filter(p => p.status === "overdue").reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0)
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-border-base shadow-sm">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Total Receivables</div>
                    <div className="text-2xl font-black text-brand-900 tracking-tight">{formatCurrency(metrics.totalReceivables / 100)}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-border-base shadow-sm">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Total Collected</div>
                    <div className="text-2xl font-black text-green-600 tracking-tight">{formatCurrency(metrics.totalCollected / 100)}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-border-base shadow-sm">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Total Outstanding</div>
                    <div className="text-2xl font-black text-amber-600 tracking-tight">{formatCurrency(metrics.outstanding / 100)}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-border-base shadow-sm bg-red-50/50">
                    <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Overdue Amount</div>
                    <div className="text-2xl font-black text-red-600 tracking-tight">{formatCurrency(metrics.overdue / 100)}</div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:max-w-md bg-white rounded-2xl p-1.5 border border-border-base shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search client, filing type..."
                            className="pl-9 h-10 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-4 rounded-xl border-border-base bg-white text-text-dark font-semibold shadow-sm">
                        <Filter className="w-4 h-4 mr-2 text-text-muted" />
                        Filter
                    </Button>
                    <Button onClick={() => setIsFormOpen(true)} className="h-11 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-soft">
                        <Plus className="w-4 h-4 mr-2" />
                        Record Payment
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                </div>
            ) : (
                <PaymentTable payments={filteredPayments} onEdit={handleEdit} />
            )}

            <PaymentForm
                open={isFormOpen}
                onOpenChange={handleFormClose}
                onSuccess={fetchPayments}
                payment={editingPayment}
            />
        </div>
    );
}
