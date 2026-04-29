"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface WorkFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function WorkForm({ open, onOpenChange, onSuccess }: WorkFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        clientId: "",
        employeeId: "none",
        filingType: "",
        customFilingType: "",
        priority: "normal",
        description: "",
        tags: "",
        dueDate: "",
        estimatedMinutes: 0,
    });

    useEffect(() => {
        if (open) {
            fetchClients();
            fetchEmployees();
        }
    }, [open]);

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients");
            if (res.ok) setClients(await res.json());
        } catch (e) {}
    };

    const fetchEmployees = async () => {
        try {
            const res = await fetch("/api/employees");
            if (res.ok) setEmployees(await res.json());
        } catch (e) {}
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const tagsArray = formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
            
            const payload: any = {
                title: formData.title,
                clientId: formData.clientId,
                filingType: formData.filingType,
                priority: formData.priority,
            };

            if (formData.employeeId && formData.employeeId !== "none") payload.employeeId = formData.employeeId;
            if (formData.filingType === "custom") payload.customFilingType = formData.customFilingType;
            if (formData.description) payload.description = formData.description;
            if (formData.dueDate) payload.dueDate = new Date(formData.dueDate).toISOString();
            if (tagsArray.length > 0) payload.tags = tagsArray;
            if (formData.estimatedMinutes > 0) payload.estimatedMinutes = formData.estimatedMinutes;

            const res = await fetch("/api/works", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onOpenChange(false);
                setFormData({
                    title: "", clientId: "", employeeId: "none", filingType: "", customFilingType: "", priority: "normal", description: "", tags: "", dueDate: "", estimatedMinutes: 0
                });
                router.refresh();
                if (onSuccess) onSuccess();
            } else {
                alert("Failed to create task");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[24px] p-0 overflow-hidden border-border-base shadow-soft">
                <div className="p-6 border-b border-border-light bg-bg-main">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-brand-900">Create New Task</DialogTitle>
                    </DialogHeader>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title <span className="text-red-500">*</span></Label>
                        <Input id="title" required placeholder="e.g. Q3 Tax Filing Preparation" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-10 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Client <span className="text-red-500">*</span></Label>
                            <Select required value={formData.clientId} onValueChange={v => setFormData({...formData, clientId: v})}>
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
                            <Label>Assignee</Label>
                            <Select value={formData.employeeId} onValueChange={v => setFormData({...formData, employeeId: v})}>
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    {employees.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Filing Type <span className="text-red-500">*</span></Label>
                            <Select required value={formData.filingType} onValueChange={v => setFormData({...formData, filingType: v})}>
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ITR">ITR</SelectItem>
                                    <SelectItem value="GST">GST</SelectItem>
                                    <SelectItem value="TDS">TDS</SelectItem>
                                    <SelectItem value="Audit">Audit</SelectItem>
                                    <SelectItem value="custom">Custom...</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {formData.filingType === "custom" && (
                        <div className="space-y-2">
                            <Label>Custom Filing Type</Label>
                            <Input required placeholder="Enter custom type" value={formData.customFilingType} onChange={e => setFormData({...formData, customFilingType: e.target.value})} className="h-10 rounded-xl" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Tags (Comma separated)</Label>
                        <Input placeholder="Tax, Accounting, High Priority" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="h-10 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Est. Time (minutes)</Label>
                            <Input type="number" min="0" step="30" value={formData.estimatedMinutes || ""} onChange={e => setFormData({...formData, estimatedMinutes: parseInt(e.target.value) || 0})} className="h-10 rounded-xl" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Task details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[80px] rounded-xl resize-none" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border-light">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-xl px-6 border-border-base">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="h-10 rounded-xl px-6 bg-brand-600 hover:bg-brand-700 text-white shadow-sm">
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Create Task
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
