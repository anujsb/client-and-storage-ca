"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface FilingRecord {
    id: string;
    clientId: string;
    filingType: { id: string; code: string; name: string };
    periodLabel: string;
    dueDate: string;
    status: string;
    notes?: string | null;
}

interface FilingRecordFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    initialClientId?: string;
    record?: FilingRecord | null;
}

export function FilingRecordForm({ open, onOpenChange, onSuccess, initialClientId, record }: FilingRecordFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [filingTypes, setFilingTypes] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        clientId: "",
        filingTypeId: "",
        periodLabel: "",
        dueDate: "",
        status: "pending",
        notes: "",
    });

    useEffect(() => {
        if (open) {
            fetchClients();
            fetchFilingTypes();
            
            if (record) {
                setFormData({
                    clientId: record.clientId || initialClientId || "",
                    filingTypeId: record.filingType?.id || "",
                    periodLabel: record.periodLabel || "",
                    dueDate: record.dueDate ? format(new Date(record.dueDate), "yyyy-MM-dd") : "",
                    status: record.status || "pending",
                    notes: record.notes || "",
                });
            } else {
                setFormData({
                    clientId: initialClientId || "",
                    filingTypeId: "",
                    periodLabel: "",
                    dueDate: "",
                    status: "pending",
                    notes: "",
                });
            }
        }
    }, [open, initialClientId, record]);

    const fetchFilingTypes = async () => {
        try {
            const res = await fetch("/api/filing-types");
            if (res.ok) setFilingTypes(await res.json());
        } catch (e) {}
    };

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
            const payload = {
                clientId: formData.clientId,
                filingTypeId: formData.filingTypeId,
                periodLabel: formData.periodLabel,
                dueDate: formData.dueDate,
                status: formData.status,
                notes: formData.notes,
            };

            const url = record ? `/api/filing-records/${record.id}` : "/api/filing-records";
            const method = record ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(record ? "Filing record updated" : "Filing record created");
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save filing record");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
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
                            {record ? "Edit Filing Record" : "Add Filing Record"}
                        </DialogTitle>
                    </DialogHeader>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div className="space-y-2">
                        <Label>Client <span className="text-red-500">*</span></Label>
                        <Select 
                            required 
                            disabled={!!record || !!initialClientId} 
                            value={formData.clientId || undefined} 
                            onValueChange={v => setFormData({...formData, clientId: v})}
                        >
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
                        <Select required value={formData.filingTypeId || undefined} onValueChange={v => setFormData({...formData, filingTypeId: v})}>
                            <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {filingTypes.map(ft => (
                                    <SelectItem key={ft.id} value={ft.id}>{ft.code} - {ft.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Period Label <span className="text-red-500">*</span></Label>
                            <Input 
                                required 
                                placeholder="e.g. Q1 FY 2024" 
                                value={formData.periodLabel} 
                                onChange={e => setFormData({...formData, periodLabel: e.target.value})} 
                                className="h-10 rounded-xl" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date <span className="text-red-500">*</span></Label>
                            <Input 
                                required 
                                type="date" 
                                value={formData.dueDate} 
                                onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                                className="h-10 rounded-xl" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                            <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="filed">Filed</SelectItem>
                                <SelectItem value="late_filed">Late Filed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea 
                            placeholder="Optional notes..." 
                            value={formData.notes} 
                            onChange={e => setFormData({...formData, notes: e.target.value})} 
                            className="min-h-[80px] rounded-xl resize-none" 
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border-light">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-xl px-6 border-border-base">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="h-10 rounded-xl px-6 bg-brand-600 hover:bg-brand-700 text-white shadow-sm">
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {record ? "Update Record" : "Add Record"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
