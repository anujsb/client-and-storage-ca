"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDocumentSchema, CreateDocumentInput } from "@/lib/validations/document";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { LocationPicker } from "@/components/storage/LocationPicker";

interface DocumentFormProps {
    onSuccess: () => void;
    defaultClientId?: string;
    document?: any;
    trigger?: React.ReactNode;
}

export function DocumentForm({ onSuccess, defaultClientId, document, trigger }: DocumentFormProps) {
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState<{ id: string; name: string; defaultLocationId?: string | null }[]>([]);

    const isEdit = !!document;

    const form = useForm<CreateDocumentInput>({
        resolver: zodResolver(CreateDocumentSchema as any),
        defaultValues: {
            clientId: document?.clientId || defaultClientId || "",
            docType: document?.docType || "",
            description: document?.description || "",
            yearPeriod: document?.yearPeriod || "",
            pagesVolume: document?.pagesVolume || "",
            locationId: document?.locationId || null,
            createdAt: document?.createdAt ? new Date(document.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        },
    });

    useEffect(() => {
        if (open) {
            fetch("/api/clients")
                .then((res) => res.json())
                .then((data) => {
                    setClients(data);
                    if (!isEdit && defaultClientId && !form.getValues("clientId")) {
                        form.setValue("clientId", defaultClientId);
                        // Optional: auto-select default location if possible
                        const selectedClient = data.find((c: any) => c.id === defaultClientId);
                        if (selectedClient?.defaultLocationId) {
                            form.setValue("locationId", selectedClient.defaultLocationId);
                        }
                    }
                })
                .catch(() => toast.error("Failed to load clients"));
                
            if (isEdit && document) {
                form.reset({
                    clientId: document.clientId || "",
                    docType: document.docType || "",
                    description: document.description || "",
                    yearPeriod: document.yearPeriod || "",
                    pagesVolume: document.pagesVolume || "",
                    locationId: document.locationId || null,
                    createdAt: document.createdAt ? new Date(document.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                });
            }
        }
    }, [open, defaultClientId, form, isEdit, document]);

    const onSubmit = async (data: CreateDocumentInput) => {
        try {
            const url = isEdit ? `/api/documents/${document.id}` : "/api/documents";
            const method = isEdit ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} document`);
            }

            toast.success(isEdit ? "Document updated successfully" : "Document added to registry");
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-9 px-4">
                        <Plus className="w-4 h-4 mr-2" />
                        New Document
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[24px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Document Details" : "Add to Registry"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update document details and location." : "Register a new document and assign it a physical storage location."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client *</FormLabel>
                                    <Select 
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            const selectedClient = clients.find(c => c.id === val);
                                            if (selectedClient?.defaultLocationId) {
                                                form.setValue("locationId", selectedClient.defaultLocationId);
                                            }
                                        }} 
                                        value={field.value}
                                        disabled={!!defaultClientId || isEdit}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="Select client" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="docType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Document Type *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Audit, Tax, Legal" className="rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="yearPeriod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year / Period</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. FY 22-23" className="rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description / Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Finalized Audit Report" className="rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="createdAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date Added</FormLabel>
                                        <FormControl>
                                            <Input type="date" className="rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="pagesVolume"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pages / Volume</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 142 Pages (1 Vol)" className="rounded-xl" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="locationId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Storage Location</FormLabel>
                                    <FormControl>
                                        <LocationPicker
                                            selectedLocationId={field.value}
                                            onSelectLocation={(id) => field.onChange(id)}
                                            triggerText={field.value ? "Location Selected" : "Select Location"}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
                                {form.formState.isSubmitting ? "Saving..." : "Save Document"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
