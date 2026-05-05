"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FilingTypeBadge } from "@/components/filings/FilingTypeBadge";
import { FilingRecordTable } from "@/components/filings/FilingRecordTable";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { PaymentTable } from "@/components/payments/PaymentTable";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { WorksTable } from "@/components/works/WorksTable";
import { ClientForm } from "@/components/clients/ClientForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { 
    ArrowLeft, Pencil, FileText, AlertTriangle, 
    CheckCircle2, Clock, MapPin, Phone, Mail, 
    RefreshCw, Calendar, Folder, Trash2, Plus, 
    Briefcase, FileSymlink, IndianRupee
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ClientDetailDashboardProps {
    clientId: string;
}

export function ClientDetailDashboard({ clientId }: ClientDetailDashboardProps) {
    const router = useRouter();
    
    // Core Data States
    const [client, setClient] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [filingRecords, setFilingRecords] = useState<any[]>([]);
    const [works, setWorks] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    
    // Loading States
    const [isLoadingClient, setIsLoadingClient] = useState(true);
    const [isLoadingRecords, setIsLoadingRecords] = useState(true);
    const [isLoadingWorks, setIsLoadingWorks] = useState(true);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);

    // Fetch Client Base Data
    const fetchClient = useCallback(async () => {
        try {
            const clientRes = await fetch(`/api/clients/${clientId}`);
            if (clientRes.ok) {
                const clientData = await clientRes.json();
                setClient(clientData);
                if (clientData.filingSubscriptions) {
                    setSubscriptions(clientData.filingSubscriptions);
                }
            }
        } catch (e) {
            toast.error("Failed to load client profile");
        } finally {
            setIsLoadingClient(false);
        }
    }, [clientId]);

    useEffect(() => {
        fetchClient();
    }, [fetchClient]);

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
    const fetchDocs = useCallback(async () => {
        setIsLoadingDocs(true);
        try {
            const res = await fetch(`/api/documents?clientId=${clientId}`);
            if (res.ok) setDocuments(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDocs(false);
        }
    }, [clientId]);

    useEffect(() => { fetchDocs(); }, [fetchDocs]);

    // Fetch Payments
    const fetchPayments = useCallback(async () => {
        setIsLoadingPayments(true);
        try {
            const res = await fetch(`/api/payments?clientId=${clientId}`);
            if (res.ok) setPayments(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingPayments(false);
        }
    }, [clientId]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

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

    const handleEditPayment = (payment: any) => {
        setEditingPayment(payment);
        setIsPaymentOpen(true);
    };

    if (isLoadingClient) {
        return <div className="p-8 text-center text-text-muted font-medium">Loading client details...</div>;
    }

    if (!client) {
        return <div className="p-8 text-center text-text-muted font-medium">Client not found.</div>;
    }

    // Compute Stats
    const now = new Date();
    const totalFilings = filingRecords.length;
    const filed = filingRecords.filter(r => r.status === "filed" || r.status === "late_filed").length;
    const inProgress = filingRecords.filter(r => r.status === "in_progress").length;
    const overdue = filingRecords.filter(r => 
        (r.status === "pending" || r.status === "in_progress") && new Date(r.dueDate) < now
    ).length;

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
            {/* Main Header Card */}
            <div className="bg-white p-6 rounded-[24px] border border-border-base shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full border border-border-base shadow-sm shrink-0">
                            <ArrowLeft className="w-5 h-5 text-text-dark" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-brand-900 tracking-tight leading-tight">{client.name}</h1>
                            <div className="text-sm font-semibold text-text-muted flex items-center gap-2 mt-1">
                                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">{client.clientCode}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                <span>PAN: <span className="text-text-dark uppercase">{client.pan}</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => setIsProfileOpen(true)}
                            variant="outline" 
                            className="rounded-xl h-10 px-4 text-brand-700 border-brand-200 hover:bg-brand-50 shadow-sm"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                        <Button 
                            variant="outline" 
                            className="rounded-xl h-10 px-4 text-red-600 border-red-200 hover:bg-red-50 shadow-sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border-light">
                    {/* Contact Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                <Phone className="w-4 h-4 text-text-muted" />
                            </div>
                            <span className="font-medium text-text-dark">{client.phone || "No phone provided"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                <Mail className="w-4 h-4 text-text-muted" />
                            </div>
                            <span className="font-medium text-text-dark">{client.email || "No email provided"}</span>
                        </div>
                        {client.address && (
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                    <MapPin className="w-4 h-4 text-text-muted" />
                                </div>
                                <span className="font-medium text-text-dark mt-1.5 leading-snug">{client.address}</span>
                            </div>
                        )}
                    </div>

                    {/* Storage Info */}
                    <div className="space-y-3">
                        {client.defaultLocation ? (
                            <div className="flex items-start gap-3 bg-brand-50/50 p-3 rounded-xl border border-brand-100">
                                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                                    <Folder className="w-5 h-5 text-brand-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-brand-600/70 uppercase tracking-wider mb-0.5">Physical Storage</div>
                                    <div className="text-sm font-bold text-brand-900">{client.defaultLocation.name}</div>
                                    {client.defaultLocation.levelLabel && (
                                        <div className="text-xs text-brand-700/80 font-medium mt-0.5">{client.defaultLocation.levelLabel}</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 text-sm text-text-muted italic border border-dashed border-border-base rounded-xl bg-slate-50/50 flex items-center">
                                No physical storage folder assigned
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                <Calendar className="w-4 h-4 text-text-muted" />
                            </div>
                            <div>
                                <span className="text-text-muted font-medium mr-1">Client Since:</span> 
                                <span className="font-semibold text-text-dark">{format(new Date(client.createdAt), "dd MMM yyyy")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Overview */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <FileText className="w-4 h-4 text-slate-500 mb-1" />
                            <div className="text-xl font-bold text-text-dark">{totalFilings}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Filings</div>
                        </div>
                        <div className={`rounded-xl p-3 border ${overdue > 0 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                            <AlertTriangle className={`w-4 h-4 mb-1 ${overdue > 0 ? "text-red-500" : "text-slate-400"}`} />
                            <div className={`text-xl font-bold ${overdue > 0 ? "text-red-600" : "text-slate-700"}`}>{overdue}</div>
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${overdue > 0 ? "text-red-600/70" : "text-slate-500"}`}>Overdue</div>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                            <Clock className="w-4 h-4 text-blue-500 mb-1" />
                            <div className="text-xl font-bold text-blue-900">{inProgress}</div>
                            <div className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">In Progress</div>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                            <div className="text-xl font-bold text-emerald-900">{filed}</div>
                            <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">Filed</div>
                        </div>
                    </div>
                </div>

                {/* Subscriptions & Notes Footer */}
                {(subscriptions.length > 0 || client.notes) && (
                    <div className="mt-6 pt-6 border-t border-border-light grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscriptions.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Active Services</h3>
                                <div className="flex flex-wrap gap-2">
                                    {subscriptions.map(sub => (
                                        <FilingTypeBadge key={sub.id} code={sub.filingType.code} category={sub.filingType.category} size="sm" />
                                    ))}
                                </div>
                            </div>
                        )}
                        {client.notes && (
                            <div>
                                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Internal Notes</h3>
                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100/50">
                                    <p className="text-sm text-text-dark whitespace-pre-wrap leading-relaxed">{client.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Compliance Tracker Section */}
            <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-brand-900 tracking-tight">Compliance Tracker</h2>
                            <p className="text-sm text-text-muted font-medium">Monitor upcoming deadlines and filing statuses</p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="rounded-xl h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                        {isGenerating ? "Generating..." : "Generate Upcoming"}
                    </Button>
                </div>
                <div className="border border-border-base rounded-[20px] overflow-hidden">
                    <FilingRecordTable records={filingRecords} clientId={clientId} onRefresh={fetchFilings} />
                </div>
            </div>

            {/* Active Works Section */}
            <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                            <Briefcase className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-brand-900 tracking-tight">Works & Tasks</h2>
                            <p className="text-sm text-text-muted font-medium">All tasks and assignments for this client</p>
                        </div>
                    </div>
                </div>
                <div className="border border-border-base rounded-[20px] overflow-hidden">
                    {isLoadingWorks ? (
                        <div className="p-8 text-center text-text-muted">Loading works...</div>
                    ) : (
                        <WorksTable works={works} />
                    )}
                </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <FileSymlink className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-brand-900 tracking-tight">Document Registry</h2>
                            <p className="text-sm text-text-muted font-medium">All physical and digital documents stored</p>
                        </div>
                    </div>
                    <DocumentForm onSuccess={fetchDocs} defaultClientId={clientId} />
                </div>
                <div className="border border-border-base rounded-[20px] overflow-hidden">
                    {isLoadingDocs ? (
                        <div className="p-8 text-center text-text-muted">Loading documents...</div>
                    ) : (
                        <DocumentTable documents={documents} />
                    )}
                </div>
            </div>

            {/* Payments Section */}
            <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                            <IndianRupee className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-brand-900 tracking-tight">Payments & Invoices</h2>
                            <p className="text-sm text-text-muted font-medium">Financial records for services rendered</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => {
                            setEditingPayment(null);
                            setIsPaymentOpen(true);
                        }}
                        className="rounded-xl h-10 bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Record Payment
                    </Button>
                </div>
                <div className="border border-border-base rounded-[20px] overflow-hidden">
                    {isLoadingPayments ? (
                        <div className="p-8 text-center text-text-muted">Loading payments...</div>
                    ) : (
                        <PaymentTable payments={payments} onEdit={handleEditPayment} />
                    )}
                </div>
            </div>

            {/* Modals */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[24px] border-border-base shadow-xl">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-bold text-brand-900">Edit Client Profile</DialogTitle>
                        <DialogDescription>Update client information and filing subscriptions.</DialogDescription>
                    </DialogHeader>
                    <ClientForm 
                        initialData={{...client, subscriptionIds: subscriptions.map(s => s.filingTypeId)}} 
                        onSuccess={() => {
                            setIsProfileOpen(false);
                            fetchClient();
                            fetchFilings();
                        }}
                        onCancel={() => setIsProfileOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <PaymentForm
                open={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
                onSuccess={fetchPayments}
                payment={editingPayment || { clientId }} // Pass clientId for new payments
            />
        </div>
    );
}
