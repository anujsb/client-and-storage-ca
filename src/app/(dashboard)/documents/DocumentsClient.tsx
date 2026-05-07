"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DocumentsClient() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
    const [isLoadingTracking, setIsLoadingTracking] = useState(true);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClient, setSelectedClient] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    
    const router = useRouter();

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/documents");
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            } else {
                toast.error("Failed to load documents");
            }
        } catch (error) {
            toast.error("An error occurred while loading documents");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTracking = async () => {
        setIsLoadingTracking(true);
        try {
            const res = await fetch("/api/documents/tracking");
            if (res.ok) {
                const data = await res.json();
                setTrackingEvents(data);
            }
        } catch (error) {
            console.error("Failed to fetch tracking data", error);
        } finally {
            setIsLoadingTracking(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients");
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error("Failed to fetch clients", error);
        }
    };

    useEffect(() => {
        fetchDocuments();
        fetchTracking();
        fetchClients();
    }, []);

    // Derived unique document types from current documents
    const uniqueDocTypes = Array.from(new Set(documents.map(doc => doc.docType).filter(Boolean)));

    // Filter documents
    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = 
            !searchTerm || 
            doc.docCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.docType?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesClient = selectedClient === "all" || doc.clientId === selectedClient;
        const matchesType = selectedType === "all" || doc.docType === selectedType;
        const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;

        return matchesSearch && matchesClient && matchesType && matchesStatus;
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white p-5 rounded-[24px] border border-border-base shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Document Code / Name</label>
                            <Input 
                                placeholder="e.g. C-0001-D-01" 
                                className="rounded-xl h-10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Client</label>
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                                <SelectTrigger className="rounded-xl h-10">
                                    <SelectValue placeholder="All Clients" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Clients</SelectItem>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Doc Type</label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="rounded-xl h-10">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {uniqueDocTypes.map(type => (
                                        <SelectItem key={type as string} value={type as string}>{type as string}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
                        <div className="w-full md:w-1/3 space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Status</label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="rounded-xl h-10">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="in_office">In Office</SelectItem>
                                    <SelectItem value="checked_out">Checked Out</SelectItem>
                                    <SelectItem value="missing">Missing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            {/* Search is now instant via state filtering, this button can just clear filters if needed, or be removed. We'll make it a clear filters button. */}
                            <Button 
                                variant="outline"
                                className="w-full md:w-auto rounded-xl h-10 px-6 border-border-base shadow-sm"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedClient("all");
                                    setSelectedType("all");
                                    setSelectedStatus("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[24px] border border-border-base shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-border-light flex items-center justify-between">
                        <h3 className="text-base font-bold text-brand-900 tracking-tight">Document Inventory</h3>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="rounded-xl h-9 px-4 text-text-dark border-border-base shadow-sm hidden md:flex">
                                <Printer className="w-4 h-4 mr-2" />
                                Print Labels
                            </Button>
                            <DocumentForm onSuccess={fetchDocuments} />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-text-muted">Loading documents...</div>
                    ) : (
                    <div className="overflow-x-auto">
                        <DocumentTable documents={filteredDocuments} />
                    </div>
                    )}
                </div>
            </div>

            {/* Right Column: Tracking & Checkouts Feed */}
            <div className="space-y-6">
                <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <h3 className="font-bold text-brand-900 tracking-tight">Tracking & Checkouts</h3>
                    </div>
                    <p className="text-xs text-text-muted mb-6">Recent document movements</p>

                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border-base before:to-transparent">
                        {isLoadingTracking ? (
                            <div className="text-center py-4 text-xs text-text-muted">Loading tracking history...</div>
                        ) : trackingEvents.length === 0 ? (
                            <div className="text-center py-4 text-xs text-text-muted">No recent tracking activity</div>
                        ) : (
                            trackingEvents.map((event) => {
                                const isOut = event.type === "checked_out";
                                const isMissing = event.type === "marked_missing"; // Future-proofing
                                const dateStr = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(event.timestamp));
                                const initials = event.employeeName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase();

                                return (
                                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 ${isOut ? 'bg-amber-500' : isMissing ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <div className="w-full pl-8">
                                            <div className={`p-3 rounded-xl border border-border-base shadow-sm ${isMissing ? 'bg-red-50/30' : 'bg-white'}`}>
                                                <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-text-muted uppercase">
                                                    <span className={isOut ? 'text-amber-600' : isMissing ? 'text-red-600' : 'text-green-600'}>
                                                        {isOut ? "Checked Out" : isMissing ? "Marked Missing" : "Checked In"}
                                                    </span>
                                                    <span>{dateStr}</span>
                                                </div>
                                                <div className="text-brand-600 font-semibold text-xs">{event.docCode}</div>
                                                <div className="text-brand-900 font-bold text-[13px] mb-2 leading-tight">{event.description}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${isMissing ? 'bg-slate-100 text-slate-500' : 'bg-brand-100 text-brand-700'}`}>
                                                        {isMissing ? 'SA' : initials}
                                                    </div>
                                                    <span className="text-xs text-text-dark font-medium">{isMissing ? 'System Audit' : `by ${event.employeeName}`}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <Button variant="outline" className="w-full mt-4 rounded-xl text-text-dark font-semibold h-10 border-border-base">
                        View Full History Log
                    </Button>
                </div>
            </div>
        </div>
    );
}
