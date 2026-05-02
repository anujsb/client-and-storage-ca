"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FilingTypeBadge } from "@/components/filings/FilingTypeBadge";
import { FilingRecordTable } from "@/components/filings/FilingRecordTable";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";

import { 
    ArrowLeft, Pencil, FileText, AlertTriangle, 
    CheckCircle2, Clock, MapPin, Phone, Mail, 
    RefreshCw, Calendar, File, ClipboardList, Folder,
    Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

interface ClientDetailDashboardProps {
    clientId: string;
}

export function ClientDetailDashboard({ clientId }: ClientDetailDashboardProps) {
    const router = useRouter();
    
    const [client, setClient] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [filingRecords, setFilingRecords] = useState<any[]>([]);
    const [works, setWorks] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    
    const [isLoadingClient, setIsLoadingClient] = useState(true);
    const [isLoadingRecords, setIsLoadingRecords] = useState(true);
    const [isLoadingWorks, setIsLoadingWorks] = useState(true);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Client Base Data
    useEffect(() => {
        const fetchClient = async () => {
            try {
                // Use the dedicated endpoint for efficiency
                const clientRes = await fetch(`/api/clients/${clientId}`);
                if (clientRes.ok) {
                    const clientData = await clientRes.json();
                    setClient(clientData);
                    // Subscriptions are included in the client response
                    if (clientData.filingSubscriptions) {
                        setSubscriptions(clientData.filingSubscriptions);
                    }
                }
            } catch (e) {
                toast.error("Failed to load client profile");
            } finally {
                setIsLoadingClient(false);
            }
        };
        fetchClient();
    }, [clientId]);

    // Fetch Filings
    const fetchFilings = useCallback(async () => {
        setIsLoadingRecords(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/filings`);
            if (res.ok) setFilingRecords(await res.json());
        } catch (e) {
            toast.error("Failed to load filings");
        } finally {
            setIsLoadingRecords(false);
        }
    }, [clientId]);

    useEffect(() => { fetchFilings(); }, [fetchFilings]);

    // Fetch Works
    useEffect(() => {
        const fetchWorks = async () => {
            setIsLoadingWorks(true);
            try {
                const res = await fetch(`/api/works?clientId=${clientId}`);
                if (res.ok) setWorks(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingWorks(false);
            }
        };
        fetchWorks();
    }, [clientId]);

    // Fetch Documents
    useEffect(() => {
        const fetchDocs = async () => {
            setIsLoadingDocs(true);
            try {
                const res = await fetch(`/api/documents?clientId=${clientId}`);
                if (res.ok) setDocuments(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingDocs(false);
            }
        };
        fetchDocs();
    }, [clientId]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/filings/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            toast.success(`Generated ${data.generated} new filing records`);
            fetchFilings();
        } catch {
            toast.error("Failed to generate filings");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Client deleted successfully");
                router.push("/clients");
                router.refresh();
            } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete");
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to delete client");
            setIsDeleting(false);
        }
    };

    if (isLoadingClient) {
        return <div className="p-8 text-center text-text-muted">Loading client details...</div>;
    }

    if (!client) {
        return <div className="p-8 text-center text-text-muted">Client not found.</div>;
    }

    // Compute Stats
    const now = new Date();
    const totalFilings = filingRecords.length;
    const filed = filingRecords.filter(r => r.status === "filed" || r.status === "late_filed").length;
    const inProgress = filingRecords.filter(r => r.status === "in_progress").length;
    const overdue = filingRecords.filter(r => 
        (r.status === "pending" || r.status === "in_progress") && new Date(r.dueDate) < now
    ).length;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 30);
    const upcomingFilings = filingRecords
        .filter(r => (r.status === "pending" || r.status === "in_progress") && new Date(r.dueDate) <= cutoff)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-[24px] border border-border-base shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-full border border-border-base shadow-sm">
                        <ArrowLeft className="w-4 h-4 text-text-dark" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-brand-900 tracking-tight leading-tight">{client.name}</h1>
                        <div className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mt-0.5">
                            <span className="text-brand-600">{client.clientCode}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>PAN: {client.pan}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/clients/${client.id}/edit`}>
                        <Button variant="outline" className="rounded-xl h-9 px-4 text-text-dark border-border-base shadow-sm">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </Link>
                    <Button 
                        variant="outline" 
                        className="rounded-xl h-9 px-4 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                {/* Left Column (Main Content) */}
                <div className="space-y-6">
                    
                    {/* Filing Subscriptions Card */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-[15px] font-bold text-brand-900 tracking-tight">Active Filing Types</h2>
                        </div>
                        {subscriptions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {subscriptions.map(sub => (
                                    <FilingTypeBadge key={sub.id} code={sub.filingType.code} category={sub.filingType.category} size="md" />
                                ))}
                            </div>
                        ) : (
                            <p className="text-[13px] text-text-muted italic">No filing types assigned to this client.</p>
                        )}
                    </div>

                    {/* Compliance Tracker */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-bold text-brand-900 tracking-tight">Compliance Tracker</h2>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-xl h-8 text-xs px-3 border-border-base shadow-sm"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                                {isGenerating ? "Generating..." : "Generate Upcoming"}
                            </Button>
                        </div>
                        <FilingRecordTable records={filingRecords} clientId={clientId} onRefresh={fetchFilings} />
                    </div>

                    {/* Recent Works */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-bold text-brand-900 tracking-tight">Active Works</h2>
                            <Link href={`/works?clientId=${clientId}`}>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg">
                                    View All Works
                                </Button>
                            </Link>
                        </div>
                        {isLoadingWorks ? (
                            <div className="text-[13px] text-text-muted">Loading works...</div>
                        ) : works.length === 0 ? (
                            <div className="text-[13px] text-text-muted py-4 text-center border border-dashed border-border-base rounded-xl">
                                No active works for this client.
                            </div>
                        ) : (
                            <div className="border border-border-base rounded-xl overflow-hidden">
                                <table className="w-full text-left text-[13px]">
                                    <thead className="bg-bg-main text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-border-light">
                                        <tr>
                                            <th className="px-4 py-2">Task</th>
                                            <th className="px-4 py-2">Filing</th>
                                            <th className="px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light">
                                        {works.slice(0, 5).map(w => (
                                            <tr key={w.id} className="hover:bg-brand-50/50 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-text-dark">{w.title}</td>
                                                <td className="px-4 py-3 text-text-muted">{w.filingType}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                                        ${w.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                          w.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                          "bg-slate-50 text-slate-700 border-slate-200"
                                                        }
                                                    `}>
                                                        {w.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-bold text-brand-900 tracking-tight">Recent Documents</h2>
                            <Link href={`/documents?clientId=${clientId}`}>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg">
                                    View Registry
                                </Button>
                            </Link>
                        </div>
                        {isLoadingDocs ? (
                            <div className="text-[13px] text-text-muted">Loading documents...</div>
                        ) : documents.length === 0 ? (
                            <div className="text-[13px] text-text-muted py-4 text-center border border-dashed border-border-base rounded-xl">
                                No documents in registry.
                            </div>
                        ) : (
                            <div className="border border-border-base rounded-xl overflow-hidden">
                                <table className="w-full text-left text-[13px]">
                                    <thead className="bg-bg-main text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-border-light">
                                        <tr>
                                            <th className="px-4 py-2">Code</th>
                                            <th className="px-4 py-2">Type</th>
                                            <th className="px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light">
                                        {documents.slice(0, 5).map(d => (
                                            <tr key={d.id} className="hover:bg-brand-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/documents/${d.id}`)}>
                                                <td className="px-4 py-3 font-semibold text-brand-600">{d.docCode}</td>
                                                <td className="px-4 py-3 text-text-dark">{d.docType}</td>
                                                <td className="px-4 py-3">
                                                    <DocumentStatusBadge status={d.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column (Context & Actions) */}
                <div className="space-y-6">
                    {/* Contact Info Card */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <h3 className="text-[15px] font-bold text-brand-900 tracking-tight mb-4">Contact Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-[13px]">
                                <Phone className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                <span className="font-medium text-text-dark">{client.phone || "No phone provided"}</span>
                            </div>
                            <div className="flex items-start gap-3 text-[13px]">
                                <Mail className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                <span className="font-medium text-text-dark">{client.email || "No email provided"}</span>
                            </div>
                            {client.address && (
                                <div className="flex items-start gap-3 text-[13px]">
                                    <MapPin className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                    <span className="font-medium text-text-dark">{client.address}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-3 text-[13px] pt-4 border-t border-border-light">
                                <Calendar className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Client Since</div>
                                    <div className="font-semibold text-brand-900">{format(new Date(client.createdAt), "dd MMM yyyy")}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Stats */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <h3 className="text-[15px] font-bold text-brand-900 tracking-tight mb-4">Compliance Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
                                <FileText className="w-4 h-4 text-brand-600 mb-2" />
                                <div className="text-[20px] font-bold text-brand-900">{totalFilings}</div>
                                <div className="text-[10px] font-bold text-brand-600/70 uppercase tracking-wider">Total Filings</div>
                            </div>
                            <div className={`rounded-xl p-3 border ${overdue > 0 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-200"}`}>
                                <AlertTriangle className={`w-4 h-4 mb-2 ${overdue > 0 ? "text-red-600" : "text-slate-400"}`} />
                                <div className={`text-[20px] font-bold ${overdue > 0 ? "text-red-600" : "text-slate-700"}`}>{overdue}</div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${overdue > 0 ? "text-red-600/70" : "text-slate-500"}`}>Overdue</div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <Clock className="w-4 h-4 text-blue-600 mb-2" />
                                <div className="text-[20px] font-bold text-blue-900">{inProgress}</div>
                                <div className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">In Progress</div>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-2" />
                                <div className="text-[20px] font-bold text-emerald-900">{filed}</div>
                                <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">Filed</div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    {upcomingFilings.length > 0 && (
                        <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                            <h3 className="text-[15px] font-bold text-brand-900 tracking-tight mb-4">Upcoming Deadlines</h3>
                            <div className="space-y-4">
                                {upcomingFilings.map(r => {
                                    const isOv = new Date(r.dueDate) < new Date();
                                    return (
                                        <div key={r.id} className="flex items-start gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isOv ? "bg-red-500" : "bg-amber-400"}`} />
                                            <div>
                                                <div className="text-[13px] font-bold text-brand-900">
                                                    {r.filingType.code} <span className="text-text-muted font-normal">— {r.periodLabel}</span>
                                                </div>
                                                <div className={`text-[11px] font-semibold mt-0.5 ${isOv ? "text-red-600" : "text-amber-700"}`}>
                                                    {isOv ? "Overdue:" : "Due:"} {format(new Date(r.dueDate), "dd MMM yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Storage Folder */}
                    {client.defaultLocation && (
                        <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                            <h3 className="text-[15px] font-bold text-brand-900 tracking-tight mb-4">Physical Storage</h3>
                            <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-brand-100">
                                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                                    <Folder className="w-4 h-4 text-brand-600" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[13px] font-bold text-brand-900 truncate">{client.defaultLocation.name}</div>
                                    {client.defaultLocation.levelLabel && (
                                        <div className="text-[11px] text-brand-600/70 font-medium">{client.defaultLocation.levelLabel}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                        <h3 className="text-[15px] font-bold text-brand-900 tracking-tight mb-4">Client Notes</h3>
                        {client.notes ? (
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                                <p className="text-[13px] text-text-dark whitespace-pre-wrap leading-relaxed">{client.notes}</p>
                            </div>
                        ) : (
                            <div className="text-[13px] text-text-muted italic py-2">No specific notes for this client.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
