"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, ArrowRight, Lightbulb, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DocumentData {
    id: string;
    docCode: string;
    name: string;
    clientName: string;
    exactPath: string;
    status: "in_office" | "checked_out" | "missing";
}

interface LocationDocumentsTableProps {
    locationId: string;
    locationName: string;
}

export function LocationDocumentsTable({ locationId, locationName }: LocationDocumentsTableProps) {
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/storage-locations/${locationId}/documents`);
                if (res.ok) {
                    const data = await res.json();
                    setDocuments(data || []);
                } else {
                    setDocuments([]);
                }
            } catch {
                setDocuments([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocs();
    }, [locationId]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "in_office":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        In Office
                    </span>
                );
            case "checked_out":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        Checked Out
                    </span>
                );
            case "missing":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Missing
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Returned
                    </span>
                );
        }
    };

    return (
        <div className="bg-white rounded-[24px] border border-border-base shadow-soft overflow-hidden">
            <div className="p-5 border-b border-border-light flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-[15px] font-bold text-brand-900 tracking-tight">Documents in this Location (Nested)</h3>
                    <div className="hidden lg:flex items-center gap-3 text-xs font-medium text-text-muted bg-bg-main px-3 py-1.5 rounded-full">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> In Office</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Checked Out</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Missing</span>
                    </div>
                </div>
                <Button variant="outline" className="h-9 px-3 rounded-xl border-border-base shadow-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                    <thead className="bg-bg-main text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-5 py-3">Document Code / Name</th>
                            <th className="px-5 py-3">Client</th>
                            <th className="px-5 py-3">Exact Path</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                                    Loading documents...
                                </td>
                            </tr>
                        ) : documents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                                    No documents found in this location.
                                </td>
                            </tr>
                        ) : (
                            documents.map((doc, idx) => (
                                <tr key={idx} className="hover:bg-brand-50/50 transition-colors">
                                    <td className="px-5 py-3.5 align-top">
                                        <div className="text-brand-600 font-semibold text-[13px]">{doc.docCode}</div>
                                        <div className="text-brand-900 font-bold mt-0.5">{doc.name}</div>
                                    </td>
                                    <td className="px-5 py-3.5 align-top text-text-dark">{doc.clientName}</td>
                                    <td className="px-5 py-3.5 align-top">
                                        <span className="bg-bg-main border border-border-base px-2 py-1 rounded text-xs text-text-muted">
                                            {doc.exactPath}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 align-top">
                                        {getStatusBadge(doc.status)}
                                    </td>
                                    <td className="px-5 py-3.5 align-top text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-brand-600">
                                                <Lightbulb className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-brand-600">
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-border-light flex items-center justify-between text-xs text-text-muted">
                <span>Showing {documents.length} of 1,240 documents in {locationName}</span>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-md" disabled><ChevronRight className="w-3.5 h-3.5 rotate-180" /></Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-md bg-brand-50 text-brand-600 border-brand-200">1</Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-md">2</Button>
                    <span className="px-1">...</span>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-md"><ChevronRight className="w-3.5 h-3.5" /></Button>
                </div>
            </div>
        </div>
    );
}
