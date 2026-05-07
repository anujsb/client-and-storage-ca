"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { DocumentForm } from "@/components/documents/DocumentForm";

import { 
    ArrowLeft, Printer, Pencil, LogOut, LogIn, 
    AlertTriangle, MessageSquare, ExternalLink,
    Building2, Database, Box, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckoutDialog } from "@/components/documents/CheckoutDialog";
import { CheckinDialog } from "@/components/documents/CheckinDialog";
import { MarkMissingDialog } from "@/components/documents/MarkMissingDialog";

export function DocumentDetailClient({ documentId }: { documentId: string }) {
    const [doc, setDoc] = useState<any>(null);
    const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    const [isMissingOpen, setIsMissingOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchDocAndTracking = async () => {
            try {
                // Fetch document
                const docRes = await fetch(`/api/documents/${documentId}`);
                if (!docRes.ok) {
                    toast.error("Failed to load document");
                    return;
                }
                const data = await docRes.json();
                setDoc(data);

                // Fetch tracking history for this specific document
                const trackingRes = await fetch(`/api/documents/tracking?documentId=${documentId}`);
                if (trackingRes.ok) {
                    const events = await trackingRes.json();
                    setTrackingEvents(events);
                }
            } catch (error) {
                toast.error("Error loading document data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocAndTracking();
    }, [documentId]);

    const handleRefresh = () => {
        fetch(`/api/documents/${documentId}`)
            .then((res) => res.json())
            .then((data) => {
                setDoc(data);
                fetch(`/api/documents/tracking?documentId=${documentId}`)
                    .then(res => res.json())
                    .then(events => setTrackingEvents(events));
            })
            .catch(() => toast.error("Error reloading document"));
    };

    if (isLoading) {
        return <div className="p-8 text-center text-text-muted">Loading document details...</div>;
    }

    if (!doc) {
        return <div className="p-8 text-center text-text-muted">Document not found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-[24px] border border-border-base shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-full border border-border-base shadow-sm">
                        <ArrowLeft className="w-4 h-4 text-text-dark" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-brand-900 tracking-tight leading-tight">Document Details</h1>
                        <div className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mt-0.5">
                            <span className="text-brand-600">{doc.docCode}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{doc.client.name} ({doc.client.clientCode})</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DocumentForm 
                        document={doc} 
                        onSuccess={handleRefresh} 
                        trigger={
                            <Button variant="outline" className="rounded-xl h-9 px-4 text-text-dark border-border-base shadow-sm">
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Details
                            </Button>
                        } 
                    />
                    <Button variant="outline" className="rounded-xl h-9 px-4 text-text-dark border-border-base shadow-sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Label
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <div className="flex items-start gap-3 mb-3">
                            <h2 className="text-[22px] font-bold text-brand-900 tracking-tight leading-tight">
                                {doc.description || doc.docType}
                            </h2>
                            <DocumentStatusBadge status={doc.status} />
                        </div>
                        <p className="text-[13px] text-text-dark leading-relaxed mb-8 max-w-2xl">
                            {doc.description || "No detailed description provided for this document."}
                        </p>

                        <div className="grid grid-cols-4 gap-6 pt-6 border-t border-border-light">
                            <div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Doc Type</div>
                                <div className="text-[13px] font-bold text-brand-900">{doc.docType}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Year/Period</div>
                                <div className="text-[13px] font-bold text-brand-900">{doc.yearPeriod || "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Added On</div>
                                <div className="text-[13px] font-bold text-brand-900">
                                    {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(doc.createdAt))}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Pages/Volume</div>
                                <div className="text-[13px] font-bold text-brand-900">{doc.pagesVolume || "Unknown"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Command Center */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <h3 className="text-[15px] font-bold text-brand-900 tracking-tight mb-4">Action Command Center</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-3 rounded-2xl border-border-base hover:border-amber-200 hover:bg-amber-50"
                                onClick={() => setIsCheckoutOpen(true)}
                                disabled={doc.status === "checked_out"}
                            >
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <LogOut className="w-5 h-5 ml-0.5" />
                                </div>
                                <span className="font-bold text-[13px] text-brand-900">Check Out</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-3 rounded-2xl border-border-base hover:border-green-200 hover:bg-green-50"
                                onClick={() => setIsCheckinOpen(true)}
                                disabled={doc.status !== "checked_out"}
                            >
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <LogIn className="w-5 h-5 mr-0.5" />
                                </div>
                                <span className="font-bold text-[13px] text-brand-900">Return</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className={`h-auto py-4 flex-col gap-3 rounded-2xl border-border-base ${doc.status === 'missing' ? 'hover:border-emerald-200 hover:bg-emerald-50' : 'hover:border-red-200 hover:bg-red-50'}`}
                                onClick={() => setIsMissingOpen(true)}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${doc.status === 'missing' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-[13px] text-brand-900">{doc.status === 'missing' ? 'Mark Found' : 'Mark Missing'}</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex-col gap-3 rounded-2xl border-border-base hover:border-brand-200 hover:bg-brand-50">
                                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-[13px] text-brand-900">Add Note</span>
                            </Button>
                        </div>
                    </div>

                    {/* Audit Timeline */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[15px] font-bold text-brand-900 tracking-tight">Audit Timeline</h3>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">
                                Export Log
                            </Button>
                        </div>

                        <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-base">
                            {trackingEvents.map(event => {
                                const isOut = event.type === 'checked_out';
                                const initials = event.employeeName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase();
                                return (
                                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal group is-active mb-8">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 ${isOut ? 'bg-amber-500' : 'bg-green-500'}`} />
                                        <div className="w-full pl-8">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isOut ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'}`}>
                                                        {isOut ? 'Checked Out' : 'Checked In'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-text-muted font-medium">
                                                    {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(event.timestamp))}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium mt-2">
                                                <Avatar className="w-4 h-4"><AvatarFallback className="bg-slate-200 text-[8px]">{initials}</AvatarFallback></Avatar>
                                                {event.employeeName}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="relative flex items-center justify-between md:justify-normal group is-active mb-8">
                                <div className="flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-white bg-brand-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0" />
                                <div className="w-full pl-8">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded">Created</span>
                                            <span className="font-bold text-[13px] text-brand-900">Added to Document Registry</span>
                                        </div>
                                        <span className="text-xs text-text-muted font-medium">
                                            {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(doc.createdAt))}
                                        </span>
                                    </div>
                                    <div className="text-[13px] text-text-dark mb-2">Initial filing of document.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Storage Location */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[15px] font-bold text-brand-900 tracking-tight">Storage Location</h3>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                Quick Jump
                            </Button>
                        </div>
                        
                        {doc.status === 'checked_out' && doc.activeCheckout ? (
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                                <div className="flex items-center gap-2 text-amber-800 text-[13px] font-bold">
                                    <LogOut className="w-4 h-4" />
                                    Currently Checked Out
                                </div>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                                    <Avatar className="w-8 h-8 border border-amber-200">
                                        <AvatarFallback className="bg-amber-100 text-amber-700 text-[11px] font-bold">
                                            {doc.activeCheckout.employeeName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-sm font-bold text-brand-900">{doc.activeCheckout.employeeName}</div>
                                        <div className="text-[11px] text-amber-700 font-medium">Since {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(doc.activeCheckout.checkedOutAt))}</div>
                                    </div>
                                </div>
                            </div>
                        ) : doc.status === 'missing' ? (
                            <div className="bg-red-50 rounded-xl p-4 border border-red-200 space-y-2">
                                <div className="flex items-center gap-2 text-red-800 text-[13px] font-bold">
                                    <AlertTriangle className="w-4 h-4" />
                                    Marked Missing
                                </div>
                                <div className="text-[12px] text-red-700 font-medium pl-6">
                                    Location unknown. Please notify the team if found.
                                </div>
                            </div>
                        ) : doc.location ? (
                            <div className="bg-bg-main rounded-xl p-4 border border-border-light space-y-2">
                                <div className="flex items-center gap-2 text-text-muted text-[13px] font-medium">
                                    <Building2 className="w-3.5 h-3.5" />
                                    Main Office
                                </div>
                                <div className="flex items-center gap-2 text-text-muted text-[13px] font-medium pl-4">
                                    <Database className="w-3.5 h-3.5" />
                                    {doc.location.name}
                                </div>
                                <div className="flex items-center gap-2 text-brand-700 text-[13px] font-bold pl-8 bg-brand-50 py-1 px-2 rounded-lg w-fit mt-1">
                                    <Box className="w-3.5 h-3.5" />
                                    Assigned Here
                                </div>
                            </div>
                        ) : (
                            <div className="text-[13px] text-text-muted text-center py-4 bg-bg-main rounded-xl border border-dashed border-border-base">No location assigned.</div>
                        )}
                    </div>

                    {/* Metadata & Notes */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <h3 className="text-[15px] font-bold text-brand-900 tracking-tight mb-4">Metadata & Notes</h3>
                        
                        <div className="mb-6">
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Tags</div>
                            <div className="flex flex-wrap gap-2">
                                {doc.tags && doc.tags.length > 0 ? doc.tags.map((tag: string, i: number) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                                        {tag.startsWith("#") ? tag : `#${tag}`}
                                    </span>
                                )) : (
                                    <span className="text-xs text-text-muted">No tags added.</span>
                                )}
                                <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] font-semibold text-text-muted rounded-md border-dashed">
                                    + Add Tag
                                </Button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Custom Fields</div>
                            <div className="space-y-2 text-[13px]">
                                {doc.customFields && Object.keys(doc.customFields).length > 0 ? Object.entries(doc.customFields).map(([key, value]) => (
                                    <div key={key} className="flex justify-between border-b border-border-light pb-2">
                                        <span className="text-text-muted">{key}</span>
                                        <span className="font-bold text-brand-900">{value as string}</span>
                                    </div>
                                )) : (
                                    <div className="text-xs text-text-muted border-b border-border-light pb-2">No custom fields defined.</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Recent Notes</div>
                            <div className="space-y-3">
                                {doc.notes ? (
                                    <div className="bg-bg-main p-3 rounded-xl border border-border-light">
                                        <p className="text-[11px] text-text-dark">{doc.notes}</p>
                                    </div>
                                ) : (
                                    <div className="text-xs text-text-muted">No recent notes.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CheckoutDialog 
                documentId={documentId} 
                open={isCheckoutOpen} 
                onOpenChange={setIsCheckoutOpen} 
                onSuccess={handleRefresh} 
            />

            <CheckinDialog 
                documentId={documentId} 
                currentLocationId={doc.locationId}
                open={isCheckinOpen} 
                onOpenChange={setIsCheckinOpen} 
                onSuccess={handleRefresh} 
            />

            <MarkMissingDialog
                documentId={documentId}
                currentStatus={doc.status}
                open={isMissingOpen}
                onOpenChange={setIsMissingOpen}
                onSuccess={handleRefresh}
            />
        </div>
    );
}
