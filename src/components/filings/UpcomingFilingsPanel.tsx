"use client";

import { useEffect, useState } from "react";
import { FilingTypeBadge } from "@/components/filings/FilingTypeBadge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, ChevronDown, ChevronUp, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { format, isPast, isWithinInterval, addDays } from "date-fns";

interface FilingRecord {
    id: string;
    periodLabel: string;
    dueDate: string;
    status: string;
    filingType: { id: string; code: string; category: string; name: string };
    client: { id: string; name: string; clientCode: string };
}

export function UpcomingFilingsPanel() {
    const [records, setRecords] = useState<FilingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        fetch("/api/filing-records/upcoming")
            .then(r => r.ok ? r.json() : [])
            .then(setRecords)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return null;
    if (records.length === 0) return null;

    const now = new Date();
    const overdue = records.filter(r => isPast(new Date(r.dueDate)) && r.status !== "filed");
    const thisWeek = records.filter(r => {
        const d = new Date(r.dueDate);
        return !isPast(d) && isWithinInterval(d, { start: now, end: addDays(now, 7) });
    });
    const later = records.filter(r => {
        const d = new Date(r.dueDate);
        return !isPast(d) && !isWithinInterval(d, { start: now, end: addDays(now, 7) });
    });

    const FilingRow = ({ r, isOv }: { r: FilingRecord; isOv?: boolean }) => (
        <div className={`flex items-center justify-between px-5 py-3 ${isOv ? "bg-red-50/50" : "hover:bg-bg-main/50"} transition-colors`}>
            <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isOv ? "bg-red-500" : "bg-amber-400"}`} />
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <FilingTypeBadge code={r.filingType.code} category={r.filingType.category} />
                        <span className="text-[13px] font-semibold text-text-dark truncate">
                            {r.client.name}
                        </span>
                        <span className="text-[12px] text-text-muted">— {r.periodLabel}</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isOv ? "text-red-500 font-semibold" : "text-text-muted"}`}>
                        {isOv ? "Was due" : "Due"}: {format(new Date(r.dueDate), "dd MMM yyyy")}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
                <Link href={`/clients/${r.client.id}?tab=filings`}>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] rounded-lg gap-1 text-text-muted hover:text-brand-600">
                        <ExternalLink className="w-3 h-3" />
                        Client
                    </Button>
                </Link>
                <Link href={`/works/new?clientId=${r.client.id}&filingCode=${r.filingType.code}&period=${encodeURIComponent(r.periodLabel)}`}>
                    <Button size="sm" className="h-7 px-3 text-[11px] rounded-lg gap-1 bg-brand-600 hover:bg-brand-700 text-white">
                        <Plus className="w-3 h-3" />
                        Create Work
                    </Button>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="rounded-2xl border border-border-base bg-white shadow-soft overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4 border-b border-border-light cursor-pointer hover:bg-bg-main/30 transition-colors"
                onClick={() => setCollapsed(p => !p)}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {overdue.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg px-2.5 py-1 text-[11px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                {overdue.length} Overdue
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2.5 py-1 text-[11px] font-bold">
                            <Calendar className="w-3 h-3" />
                            {records.length} Upcoming (30 days)
                        </div>
                    </div>
                    <span className="text-[13px] font-bold text-text-dark hidden sm:block">Filing Deadlines</span>
                </div>
                <div className="text-text-muted">
                    {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
            </div>

            {/* Body */}
            {!collapsed && (
                <div className="divide-y divide-border-light">
                    {/* Overdue section */}
                    {overdue.length > 0 && (
                        <div>
                            <div className="px-5 py-2 bg-red-50/60 border-b border-red-100">
                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">🔴 Overdue ({overdue.length})</p>
                            </div>
                            {overdue.map(r => <FilingRow key={r.id} r={r} isOv />)}
                        </div>
                    )}

                    {/* This week */}
                    {thisWeek.length > 0 && (
                        <div>
                            <div className="px-5 py-2 bg-amber-50/60 border-b border-amber-100">
                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">📅 Due This Week ({thisWeek.length})</p>
                            </div>
                            {thisWeek.map(r => <FilingRow key={r.id} r={r} />)}
                        </div>
                    )}

                    {/* Later this month */}
                    {later.length > 0 && (
                        <div>
                            <div className="px-5 py-2 bg-bg-main/50 border-b border-border-light">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">📌 Later This Month ({later.length})</p>
                            </div>
                            {later.map(r => <FilingRow key={r.id} r={r} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
