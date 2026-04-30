"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { formatCurrency } from "@/lib/utils/currency";
import { Edit2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentTableProps {
    payments: any[];
    onEdit: (payment: any) => void;
}

export function PaymentTable({ payments, onEdit }: PaymentTableProps) {
    if (payments.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-[24px] border border-border-base">
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-text-dark font-bold text-lg mb-1">No payments found</h3>
                <p className="text-text-muted">You haven't recorded any payments or invoices yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] border border-border-base overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-border-base">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-text-dark text-xs uppercase tracking-wider py-4 pl-6">Client / Filing</TableHead>
                            <TableHead className="font-bold text-text-dark text-xs uppercase tracking-wider py-4">Total Amt</TableHead>
                            <TableHead className="font-bold text-text-dark text-xs uppercase tracking-wider py-4">Paid Amt</TableHead>
                            <TableHead className="font-bold text-text-dark text-xs uppercase tracking-wider py-4">Balance</TableHead>
                            <TableHead className="font-bold text-text-dark text-xs uppercase tracking-wider py-4">Due Date</TableHead>
                            <TableHead className="font-bold text-text-dark text-xs uppercase tracking-wider py-4">Status</TableHead>
                            <TableHead className="text-right py-4 pr-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => {
                            const balance = payment.totalAmount - payment.paidAmount;
                            return (
                                <TableRow key={payment.id} className="hover:bg-slate-50 transition-colors border-b border-border-light last:border-0">
                                    <TableCell className="pl-6 py-4 align-top">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                                    {payment.client.clientCode}
                                                </span>
                                                <span className="text-sm font-bold text-text-dark">{payment.client.name}</span>
                                            </div>
                                            <div className="text-xs font-semibold text-text-muted">
                                                {payment.filingType} • {payment.period}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 align-top">
                                        <span className="text-sm font-semibold text-text-dark">
                                            {formatCurrency(payment.totalAmount / 100)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 align-top">
                                        <span className="text-sm font-semibold text-brand-600">
                                            {formatCurrency(payment.paidAmount / 100)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 align-top">
                                        <span className={`text-sm font-bold ${balance > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                            {formatCurrency(balance / 100)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 align-top">
                                        <span className="text-sm font-medium text-text-muted">
                                            {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('en-IN') : "—"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 align-top">
                                        <PaymentStatusBadge status={payment.status} />
                                    </TableCell>
                                    <TableCell className="pr-6 py-4 align-top text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(payment)} className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
