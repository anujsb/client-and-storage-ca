"use client";

import { useState, useMemo } from "react";
import { FilingStatusBadge } from "./FilingStatusBadge";
import { FilingTypeBadge } from "./FilingTypeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Check, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

type FilingStatus = "pending" | "in_progress" | "filed" | "late_filed" | "not_applicable";

interface FilingType {
    id: string;
    code: string;
    name: string;
    category: string;
    frequency: string;
    requiresAckNo: boolean;
}

interface FilingRecord {
    id: string;
    periodLabel: string;
    dueDate: string;
    status: FilingStatus;
    filedDate: string | null;
    acknowledgmentNo: string | null;
    notes: string | null;
    filingType: FilingType;
}

interface FilingRecordTableProps {
    records: FilingRecord[];
    clientId: string;
    onRefresh: () => void;
}

const CATEGORY_FILTERS = ["All", "GST", "Income Tax", "TDS", "Audit"] as const;
const CATEGORY_MAP: Record<string, string> = {
    gst: "GST",
    income_tax: "Income Tax",
    tds: "TDS",
    audit: "Audit",
};

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return format(new Date(dateStr), "dd MMM yyyy");
}

function isOverdue(record: FilingRecord) {
    return (record.status === "pending" || record.status === "in_progress")
        && new Date(record.dueDate) < new Date();
}

export function FilingRecordTable({ records, clientId, onRefresh }: FilingRecordTableProps) {
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Inline edit state
    const [editAck, setEditAck] = useState<Record<string, string>>({});
    const [editFiledDate, setEditFiledDate] = useState<Record<string, string>>({});

    const filtered = useMemo(() => {
        if (categoryFilter === "All") return records;
        return records.filter(r => CATEGORY_MAP[r.filingType.category] === categoryFilter);
    }, [records, categoryFilter]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [filtered]);

    const handleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
        if (!editAck[id]) {
            const rec = records.find(r => r.id === id);
            if (rec) {
                setEditAck(e => ({ ...e, [id]: rec.acknowledgmentNo || "" }));
                setEditFiledDate(e => ({ ...e, [id]: rec.filedDate ? rec.filedDate.slice(0, 10) : "" }));
            }
        }
    };

    const handleMarkFiled = async (record: FilingRecord) => {
        setSavingId(record.id);
        try {
            const filedDate = editFiledDate[record.id] ? new Date(editFiledDate[record.id]) : new Date();
            const res = await fetch(`/api/filing-records/${record.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "filed",
                    filedDate: filedDate.toISOString(),
                    acknowledgmentNo: editAck[record.id] || null,
                }),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success("Filing marked as filed");
            setExpandedId(null);
            onRefresh();
        } catch {
            toast.error("Failed to update filing");
        } finally {
            setSavingId(null);
        }
    };

    const handleUpdateNotes = async (record: FilingRecord, notes: string) => {
        setSavingId(record.id);
        try {
            await fetch(`/api/filing-records/${record.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });
            toast.success("Notes saved");
            onRefresh();
        } catch {
            toast.error("Failed to save notes");
        } finally {
            setSavingId(null);
        }
    };

    if (records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                    <RefreshCw className="w-7 h-7 text-brand-500" />
                </div>
                <p className="text-[15px] font-semibold text-text-dark">No filing records yet</p>
                <p className="text-[13px] text-text-muted mt-1 max-w-xs">
                    Generate filing records based on this client's subscriptions.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Category filter tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {CATEGORY_FILTERS.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                            categoryFilter === cat
                                ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                                : "bg-white text-text-muted border-border-base hover:bg-bg-main"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
                <span className="ml-auto text-[12px] text-text-muted">{sorted.length} records</span>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border-base overflow-hidden bg-white shadow-soft">
                {/* Header */}
                <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-bg-main/50 border-b border-border-light">
                    {["Period", "Filing Type", "Due Date", "Status", "Ack / Filed On", ""].map(h => (
                        <div key={h} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{h}</div>
                    ))}
                </div>

                {/* Rows */}
                {sorted.map((record) => {
                    const overdue = isOverdue(record);
                    const expanded = expandedId === record.id;
                    const isFiled = record.status === "filed" || record.status === "late_filed";

                    return (
                        <div key={record.id} className={`border-b border-border-light last:border-0 ${overdue ? "bg-red-50/30" : ""}`}>
                            {/* Main row */}
                            <div
                                className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center cursor-pointer hover:bg-bg-main/40 transition-colors"
                                onClick={() => handleExpand(record.id)}
                            >
                                {/* Period */}
                                <div className="text-[13px] font-semibold text-text-dark">{record.periodLabel}</div>

                                {/* Filing type */}
                                <div className="flex flex-col gap-1">
                                    <FilingTypeBadge code={record.filingType.code} category={record.filingType.category} />
                                    <span className="text-[11px] text-text-muted leading-tight">{record.filingType.name.split("–")[0].trim()}</span>
                                </div>

                                {/* Due date */}
                                <div className={`text-[13px] font-medium ${overdue ? "text-red-600" : "text-text-muted"}`}>
                                    {formatDate(record.dueDate)}
                                    {overdue && <span className="block text-[10px] font-bold text-red-500 mt-0.5">OVERDUE</span>}
                                </div>

                                {/* Status */}
                                <div><FilingStatusBadge status={record.status} /></div>

                                {/* Ack / Filed On */}
                                <div className="text-[12px] text-text-muted">
                                    {isFiled ? (
                                        <span className="text-emerald-700">
                                            {record.acknowledgmentNo && <div className="font-mono font-semibold">{record.acknowledgmentNo}</div>}
                                            {record.filedDate && <div className="text-[11px]">{formatDate(record.filedDate)}</div>}
                                        </span>
                                    ) : "—"}
                                </div>

                                {/* Expand toggle */}
                                <div className="flex items-center gap-2">
                                    {expanded
                                        ? <ChevronUp className="w-4 h-4 text-text-muted" />
                                        : <ChevronDown className="w-4 h-4 text-text-muted" />}
                                </div>
                            </div>

                            {/* Expanded panel */}
                            {expanded && (
                                <div className="px-5 pb-5 bg-bg-main/30 border-t border-border-light">
                                    <div className="pt-4 space-y-4">
                                        {!isFiled && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                                                        Filed Date
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        className="h-9 text-sm rounded-xl"
                                                        value={editFiledDate[record.id] || ""}
                                                        onChange={e => setEditFiledDate(p => ({ ...p, [record.id]: e.target.value }))}
                                                    />
                                                </div>
                                                {record.filingType.requiresAckNo && (
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                                                            Acknowledgment Number
                                                        </label>
                                                        <Input
                                                            placeholder="e.g. AA01234567890"
                                                            className="h-9 text-sm rounded-xl font-mono"
                                                            value={editAck[record.id] || ""}
                                                            onChange={e => setEditAck(p => ({ ...p, [record.id]: e.target.value }))}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            {!isFiled && (
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-5 gap-2"
                                                    onClick={() => handleMarkFiled(record)}
                                                    disabled={savingId === record.id}
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    {savingId === record.id ? "Saving..." : "Mark as Filed"}
                                                </Button>
                                            )}
                                            <Link
                                                href={`/works?client=${clientId}&filing=${record.filingType.code}&period=${encodeURIComponent(record.periodLabel)}`}
                                            >
                                                <Button size="sm" variant="outline" className="rounded-xl h-9 px-4 gap-2 border-border-base">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Create / View Work
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
