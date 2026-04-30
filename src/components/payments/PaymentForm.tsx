"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    payment?: any; // If provided, edit mode
}

export function PaymentForm({ open, onOpenChange, onSuccess, payment }: PaymentFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        clientId: "",
        filingType: "",
        period: "",
        totalAmount: "",
        paidAmount: "0",
        dueDate: "",
        paymentMode: "none",
        notes: "",
    });

    useEffect(() => {
        if (open) {
            fetchClients();
            if (payment) {
                setFormData({
                    clientId: payment.client?.id || payment.clientId || "",
                    filingType: payment.filingType || "",
                    period: payment.period || "",
                    totalAmount: (payment.totalAmount / 100).toString(),
                    paidAmount: (payment.paidAmount / 100).toString(),
                    dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : "",
                    paymentMode: payment.paymentMode || "none",
                    notes: payment.notes || "",
                });
            } else {
                setFormData({
                    clientId: "", filingType: "", period: "", totalAmount: "", paidAmount: "0", dueDate: "", paymentMode: "none", notes: ""
                });
            }
        }
    }, [open, payment]);

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients");
            if (res.ok) setClients(await res.json());
        } catch (e) {}
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload: any = {
                clientId: formData.clientId,
                filingType: formData.filingType,
                period: formData.period,
                totalAmount: Math.round(parseFloat(formData.totalAmount) * 100),
                paidAmount: Math.round(parseFloat(formData.paidAmount || "0") * 100),
            };

            if (formData.dueDate) payload.dueDate = new Date(formData.dueDate).toISOString();
            if (formData.paymentMode && formData.paymentMode !== "none") payload.paymentMode = formData.paymentMode;
            if (formData.notes) payload.notes = formData.notes;

            const url = payment ? `/api/payments/${payment.id}` : "/api/payments";
            const method = payment ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(payment ? "Payment updated" : "Payment recorded");
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to save payment");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[24px] p-0 overflow-hidden border-border-base shadow-soft">
                <div className="p-6 border-b border-border-light bg-bg-main">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-brand-900">
                            {payment ? "Update Payment" : "Record New Payment"}
                        </DialogTitle>
                    </DialogHeader>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Client <span className="text-red-500">*</span></Label>
                            <Select required disabled={!!payment} value={formData.clientId || undefined} onValueChange={v => setFormData({...formData, clientId: v})}>
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Select Client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.clientCode} - {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Filing Type <span className="text-red-500">*</span></Label>
                            <Input required placeholder="e.g. ITR Filing" value={formData.filingType} onChange={e => setFormData({...formData, filingType: e.target.value})} className="h-10 rounded-xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Period <span className="text-red-500">*</span></Label>
                            <Input required placeholder="e.g. FY 2024-25" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="h-10 rounded-xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Total Amount (₹) <span className="text-red-500">*</span></Label>
                            <Input required type="number" step="0.01" min="0" placeholder="0.00" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Paid Amount (₹)</Label>
                            <Input type="number" step="0.01" min="0" placeholder="0.00" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} className="h-10 rounded-xl" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Mode</Label>
                        <Select value={formData.paymentMode || undefined} onValueChange={v => setFormData({...formData, paymentMode: v})}>
                            <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Not specified</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea placeholder="Any additional notes..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="min-h-[80px] rounded-xl resize-none" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border-light">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-xl px-6 border-border-base">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="h-10 rounded-xl px-6 bg-brand-600 hover:bg-brand-700 text-white shadow-sm">
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {payment ? "Update Payment" : "Record Payment"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
