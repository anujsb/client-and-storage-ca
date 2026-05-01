"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Client } from "@/types/client";
import { FilingTypeBadge } from "@/components/filings/FilingTypeBadge";
import { Check, FolderPlus } from "lucide-react";
import { LocationPicker } from "@/components/storage/LocationPicker";

// ── Validation ────────────────────────────────────────────────────────────────

const clientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    pan: z.string().min(10, "PAN must be 10 characters").max(10).regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    address: z.string().optional(),
    notes: z.string().optional(),
    parentLocationId: z.string().optional().nullable(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────

interface FilingType {
    id: string;
    code: string;
    name: string;
    category: string;
    frequency: string;
}

interface ClientFormProps {
    initialData?: Client & { subscriptionIds?: string[] };
}

// ── Category display order ────────────────────────────────────────────────────

const CATEGORY_ORDER = ["gst", "income_tax", "tds", "audit", "other"] as const;
const CATEGORY_LABELS: Record<string, string> = {
    gst: "GST Returns",
    income_tax: "Income Tax",
    tds: "TDS / eTDS",
    audit: "Audit",
    other: "Other",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ClientForm({ initialData }: ClientFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFilingTypes, setIsLoadingFilingTypes] = useState(true);
    const [filingTypes, setFilingTypes] = useState<FilingType[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>(initialData?.subscriptionIds ?? []);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema as any),
        defaultValues: {
            name: initialData?.name || "",
            pan: initialData?.pan || "",
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            address: initialData?.address || "",
            notes: initialData?.notes || "",
            parentLocationId: null,
        },
    });

    useEffect(() => {
        setIsLoadingFilingTypes(true);
        fetch("/api/filing-types")
            .then(r => r.json())
            .then(setFilingTypes)
            .catch(console.error)
            .finally(() => setIsLoadingFilingTypes(false));

        // If editing, load existing subscriptions
        if (initialData?.id) {
            fetch(`/api/clients/${initialData.id}/subscriptions`)
                .then(r => r.json())
                .then((subs: any[]) => setSelectedIds(subs.map(s => s.filingTypeId)))
                .catch(console.error);
        }
    }, [initialData?.id]);

    const toggleFiling = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Group filing types by category
    const grouped = CATEGORY_ORDER.reduce<Record<string, FilingType[]>>((acc, cat) => {
        const items = filingTypes.filter(ft => ft.category === cat);
        if (items.length > 0) acc[cat] = items;
        return acc;
    }, {});

    async function onSubmit(data: ClientFormValues) {
        try {
            setIsLoading(true);

            const url = initialData ? `/api/clients/${initialData.id}` : "/api/clients";
            const response = await fetch(url, {
                method: initialData ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.message || "Failed to save client");
            }

            const client = await response.json();

            // Save subscriptions
            await fetch(`/api/clients/${client.id}/subscriptions`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filingTypeIds: selectedIds }),
            });

            // Generate filing records if new client with subscriptions
            if (!initialData && selectedIds.length > 0) {
                await fetch(`/api/clients/${client.id}/filings/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });
            }

            toast.success(initialData ? "Client updated successfully" : "Client created successfully");
            router.push("/clients");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "An error occurred while saving");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Name *</FormLabel>
                            <FormControl><Input placeholder="Enter client's full name or firm name" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="pan" render={({ field }) => (
                        <FormItem>
                            <FormLabel>PAN Number *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="ABCDE1234F"
                                    className="uppercase font-mono"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input placeholder="e.g. 9876543210" {...field} value={field.value || ""} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input type="email" placeholder="client@example.com" {...field} value={field.value || ""} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Enter complete address" className="resize-none h-20" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Any additional information about this client..." className="resize-none h-20" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                {(!initialData || !initialData.defaultLocationId) && (
                    <div className="p-5 rounded-2xl border border-brand-100 bg-brand-50/50 space-y-4">
                        <div className="flex items-center gap-2 text-brand-700">
                            <FolderPlus className="w-5 h-5" />
                            <div>
                                <h4 className="text-[14px] font-bold">Physical Storage Folder</h4>
                                <p className="text-[12px] text-brand-600/80">
                                    {initialData 
                                        ? "This client doesn't have a default folder yet. Select a parent location to create one." 
                                        : "Select a parent location to automatically create a storage folder for this client."}
                                </p>
                            </div>
                        </div>
                        <FormField control={form.control} name="parentLocationId" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <LocationPicker
                                        selectedLocationId={field.value}
                                        onSelectLocation={(id) => field.onChange(id)}
                                        triggerText={field.value ? "Location Selected" : "Select Parent Location (e.g. Main Cupboard > Shelf 1)"}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                )}

                {/* Filing Types */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-[14px] font-bold text-text-dark">Filing Types</h3>
                        <p className="text-[12px] text-text-muted mt-0.5">
                            Select all return filings this client requires. This determines the compliance calendar.
                        </p>
                    </div>

                    {isLoadingFilingTypes ? (
                        <div className="text-[13px] text-text-muted py-4 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></span>
                            Loading filing types...
                        </div>
                    ) : filingTypes.length === 0 ? (
                        <div className="text-[13px] text-text-muted py-4 bg-amber-50 text-amber-700 rounded-lg px-4 border border-amber-200">
                            No filing types configured. Please set them up in Settings.
                        </div>
                    ) : (
                        <div className="space-y-5 rounded-2xl border border-border-base p-5 bg-bg-main/30">
                            {Object.entries(grouped).map(([cat, types]) => (
                                <div key={cat}>
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2.5">
                                        {CATEGORY_LABELS[cat]}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {types.map(ft => {
                                            const selected = selectedIds.includes(ft.id);
                                            return (
                                                <button
                                                    key={ft.id}
                                                    type="button"
                                                    onClick={() => toggleFiling(ft.id)}
                                                    className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-semibold transition-all ${selected
                                                            ? "bg-white border-brand-500 ring-1 ring-brand-500 shadow-sm text-text-dark"
                                                            : "bg-white text-text-muted border-border-base hover:border-brand-300 hover:text-text-dark shadow-sm"
                                                        }`}
                                                    title={ft.name}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-brand-600 border-brand-600" : "bg-white border-border-base"
                                                        }`}>
                                                        {selected && <Check className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                    <FilingTypeBadge
                                                        code={ft.code}
                                                        category={ft.category}
                                                        size="sm"
                                                    />
                                                    <span className="hidden sm:inline text-[11px] text-text-muted max-w-[120px] truncate ml-1">
                                                        {ft.frequency === "monthly" ? "Monthly" :
                                                            ft.frequency === "quarterly" ? "Quarterly" :
                                                                ft.frequency === "annually" ? "Annual" : ""}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedIds.length > 0 && (
                        <p className="text-[12px] text-brand-600 font-medium">
                            {selectedIds.length} filing type{selectedIds.length > 1 ? "s" : ""} selected
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-border-light">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl px-6 h-11 border-border-base text-text-muted hover:bg-bg-main"
                        onClick={() => router.push("/clients")}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 h-11 shadow-sm"
                    >
                        {isLoading ? "Saving..." : initialData ? "Save Changes" : "Create Client Profile"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
