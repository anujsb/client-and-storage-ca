"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckinDocumentSchema, CheckinDocumentInput } from "@/lib/validations/document";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { LocationPicker } from "@/components/storage/LocationPicker";

interface CheckinDialogProps {
    documentId: string;
    currentLocationId?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CheckinDialog({ documentId, currentLocationId, open, onOpenChange, onSuccess }: CheckinDialogProps) {
    const form = useForm<CheckinDocumentInput>({
        resolver: zodResolver(CheckinDocumentSchema as any),
        defaultValues: {
            locationId: currentLocationId || null,
        },
    });

    const onSubmit = async (data: CheckinDocumentInput) => {
        try {
            const res = await fetch(`/api/documents/${documentId}/checkin`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to check in document");
            }

            toast.success("Document returned successfully");
            onOpenChange(false);
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
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <LogIn className="w-4 h-4 mr-0.5" />
                        </div>
                        Return Document
                    </DialogTitle>
                    <DialogDescription>
                        Confirm the return of this document to the office and update its storage location.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="locationId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Returned To Location</FormLabel>
                                    <FormControl>
                                        <LocationPicker
                                            selectedLocationId={field.value}
                                            onSelectLocation={(id) => field.onChange(id)}
                                            triggerText={field.value ? "Location Selected" : "Select Location"}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-text-muted mt-1.5">
                                        You can leave this unchanged to return it to its previous location.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
                                {form.formState.isSubmitting ? "Processing..." : "Confirm Return"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
