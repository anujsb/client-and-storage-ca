"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FilingTypeBadge } from "@/components/filings/FilingTypeBadge";
import { Button } from "@/components/ui/button";
import { Users, Search, ArrowUpDown, ChevronDown, ChevronUp, Folder } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface FilingType {
    id: string;
    code: string;
    category: string;
    name: string;
}

interface ClientWithFilings {
    id: string;
    clientCode: string;
    name: string;
    pan: string;
    phone: string | null;
    email: string | null;
    createdAt: string;
    filingSubscriptions?: Array<{ filingType: FilingType }>;
    defaultLocation?: {
        name: string;
        levelLabel?: string | null;
    } | null;
}

interface ClientTableProps {
    clients: ClientWithFilings[];
}

type SortField = "clientCode" | "name" | "createdAt";
type SortDirection = "asc" | "desc";

export function ClientTable({ clients }: ClientTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filingTypeFilter, setFilingTypeFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const availableFilingTypes = useMemo(() => {
        const typesMap = new Map<string, string>();
        clients.forEach(c => {
            c.filingSubscriptions?.forEach(sub => {
                typesMap.set(sub.filingType.code, sub.filingType.name);
            });
        });
        return Array.from(typesMap.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => a.code.localeCompare(b.code));
    }, [clients]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const filteredAndSortedClients = useMemo(() => {
        // Filter
        let result = [...clients]; // Copy array to prevent mutating original state

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c => 
                c.name.toLowerCase().includes(q) || 
                c.clientCode.toLowerCase().includes(q) || 
                c.pan.toLowerCase().includes(q)
            );
        }

        // Filter by Filing Type
        if (filingTypeFilter !== "all") {
            result = result.filter(c => 
                c.filingSubscriptions?.some(sub => sub.filingType.code === filingTypeFilter)
            );
        }

        // Sort
        return result.sort((a, b) => {
            if (sortField === "createdAt") {
                const timeA = new Date(a.createdAt).getTime();
                const timeB = new Date(b.createdAt).getTime();
                return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
            }

            const valA = (a[sortField as keyof typeof a] as string || "").toLowerCase();
            const valB = (b[sortField as keyof typeof b] as string || "").toLowerCase();

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [clients, searchQuery, filingTypeFilter, sortField, sortDirection]);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 text-text-muted/50 inline-block" />;
        return sortDirection === "asc" 
            ? <ChevronUp className="w-3 h-3 ml-1 text-brand-600 inline-block" /> 
            : <ChevronDown className="w-3 h-3 ml-1 text-brand-600 inline-block" />;
    };

    if (clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-border-base rounded-[24px] shadow-soft">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-brand-500" />
                </div>
                <h3 className="text-lg font-bold text-text-dark">No clients yet</h3>
                <p className="text-[14px] text-text-muted mt-2 max-w-sm">
                    You haven't added any clients to your firm. Get started by creating your first client profile.
                </p>
                <div className="mt-8">
                    <Link href="/clients/new">
                        <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 h-11">
                            Add New Client
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-3 rounded-2xl border border-border-base shadow-sm gap-3">
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input 
                            placeholder="Search by name, code or PAN..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 rounded-xl border-border-base bg-bg-main/50 focus-visible:ring-1 focus-visible:ring-brand-500"
                        />
                    </div>
                    <select
                        value={filingTypeFilter}
                        onChange={(e) => setFilingTypeFilter(e.target.value)}
                        className="h-10 rounded-xl border border-border-base bg-bg-main/50 px-3 text-[13px] font-medium text-text-dark focus-visible:ring-1 focus-visible:ring-brand-500 outline-none w-full md:w-auto"
                    >
                        <option value="all">All Filing Types</option>
                        {availableFilingTypes.map(ft => (
                            <option key={ft.code} value={ft.code}>{ft.code} - {ft.name}</option>
                        ))}
                    </select>
                </div>
                <div className="text-[13px] text-text-muted font-medium px-4">
                    Showing <span className="font-bold text-text-dark">{filteredAndSortedClients.length}</span> clients
                </div>
            </div>

            {/* Table */}
            <div className="rounded-[24px] border border-border-base overflow-hidden bg-white shadow-soft w-full">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] min-w-[700px] md:min-w-full">
                        <thead className="bg-bg-main text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            <tr>
                                <th 
                                    className="px-5 py-3 cursor-pointer hover:bg-border-light transition-colors"
                                    onClick={() => handleSort("clientCode")}
                                >
                                    Client Code <SortIcon field="clientCode" />
                                </th>
                                <th 
                                    className="px-5 py-3 cursor-pointer hover:bg-border-light transition-colors"
                                    onClick={() => handleSort("name")}
                                >
                                    Full Name <SortIcon field="name" />
                                </th>
                                <th className="px-5 py-3 hidden md:table-cell">Storage Folder</th>
                                <th className="px-5 py-3">PAN Number</th>
                                <th className="px-5 py-3 hidden md:table-cell">Phone</th>
                                <th className="px-5 py-3">Filings</th>
                                <th 
                                    className="px-5 py-3 hidden lg:table-cell cursor-pointer hover:bg-border-light transition-colors"
                                    onClick={() => handleSort("createdAt")}
                                >
                                    Added On <SortIcon field="createdAt" />
                                </th>
                            </tr>
                        </thead>
                    <tbody className="divide-y divide-border-light">
                        {filteredAndSortedClients.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                                    No clients match your search.
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedClients.map((client) => (
                                <tr 
                                    key={client.id} 
                                    onClick={() => router.push(`/clients/${client.id}`)}
                                    className="hover:bg-brand-50/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-5 py-3.5 align-top">
                                        <div className="inline-flex items-center text-[12px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100 group-hover:bg-white transition-colors">
                                            {client.clientCode}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 align-top">
                                        <div className="font-bold text-text-dark group-hover:text-brand-600 transition-colors">
                                            {client.name}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 align-top hidden md:table-cell">
                                        {client.defaultLocation ? (
                                            <div className="flex items-center gap-1.5 text-[12px] text-brand-700 font-medium">
                                                <Folder className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate max-w-[150px]" title={client.defaultLocation.name}>
                                                    {client.defaultLocation.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[12px] text-text-muted italic">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 align-top text-text-muted font-mono text-[13px]">
                                        {client.pan}
                                    </td>
                                    <td className="px-5 py-3.5 align-top hidden md:table-cell text-text-muted text-[13px]">
                                        {client.phone || <span className="text-border-base">—</span>}
                                    </td>
                                    <td className="px-5 py-3.5 align-top">
                                        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                                            {client.filingSubscriptions && client.filingSubscriptions.length > 0 ? (
                                                <>
                                                    {client.filingSubscriptions.slice(0, 3).map(sub => (
                                                        <FilingTypeBadge
                                                            key={sub.filingType.id}
                                                            code={sub.filingType.code}
                                                            category={sub.filingType.category}
                                                        />
                                                    ))}
                                                    {client.filingSubscriptions.length > 3 && (
                                                        <span className="inline-flex items-center text-[10px] font-bold text-text-muted bg-slate-50 px-2 py-0.5 rounded-md border border-border-base">
                                                            +{client.filingSubscriptions.length - 3}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[12px] text-text-muted italic">No filings set</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 align-top hidden lg:table-cell text-text-muted text-[13px]">
                                        {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                            .format(new Date(client.createdAt))}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}
