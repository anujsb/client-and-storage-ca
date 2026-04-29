"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutDocumentSchema, CheckoutDocumentInput } from "@/lib/validations/document";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

interface CheckoutDialogProps {
    documentId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CheckoutDialog({ documentId, open, onOpenChange, onSuccess }: CheckoutDialogProps) {
    const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

    const form = useForm<CheckoutDocumentInput>({
        resolver: zodResolver(CheckoutDocumentSchema as any),
        defaultValues: {
            employeeId: "",
            purpose: "",
        },
    });

    useEffect(() => {
        if (open && employees.length === 0) {
            setIsLoadingEmployees(true);
            fetch("/api/employees")
                .then((res) => res.json())
                .then((data) => setEmployees(data))
                .catch(() => toast.error("Failed to load employees"))
                .finally(() => setIsLoadingEmployees(false));
        }
    }, [open]);

    const onSubmit = async (data: CheckoutDocumentInput) => {
        try {
            const res = await fetch(`/api/documents/${documentId}/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to checkout document");
            }

            toast.success("Document checked out successfully");
            onOpenChange(false);
            form.reset();
            onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <LogOut className="w-4 h-4 ml-0.5" />
                        </div>
                        Check Out Document
                    </DialogTitle>
                    <DialogDescription>
                        Assign this document to an employee and record the purpose.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign To *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingEmployees}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder={isLoadingEmployees ? "Loading..." : "Select employee"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purpose / Reason</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Audit preparation, client meeting..." className="rounded-xl" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
                                {form.formState.isSubmitting ? "Checking out..." : "Confirm Check Out"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
