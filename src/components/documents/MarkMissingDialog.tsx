"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface MarkMissingDialogProps {
    documentId: string;
    currentStatus: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function MarkMissingDialog({ documentId, currentStatus, open, onOpenChange, onSuccess }: MarkMissingDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isMissing = currentStatus === "missing";

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            const newStatus = isMissing ? "in_office" : "missing";
            
            const res = await fetch(`/api/documents/${documentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update status");
            }

            toast.success(isMissing ? "Document marked as found" : "Document marked as missing");
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isMissing ? (
                            <>
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                Mark as Found
                            </>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                Mark as Missing
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isMissing 
                            ? "This will update the document's status back to 'In Office'. Ensure you place it in its correct storage location."
                            : "This will flag the document as missing for the entire team. Please verify before proceeding."}
                    </DialogDescription>
                </DialogHeader>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        onClick={onSubmit} 
                        disabled={isSubmitting} 
                        className={`rounded-xl text-white ${isMissing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isSubmitting ? "Processing..." : (isMissing ? "Confirm Found" : "Confirm Missing")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
