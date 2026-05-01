"use client";

type FilingStatus = "pending" | "in_progress" | "filed" | "late_filed" | "not_applicable";

interface FilingStatusBadgeProps {
    status: FilingStatus;
}

const STATUS_CONFIG: Record<FilingStatus, { label: string; className: string; dot: string }> = {
    filed: {
        label: "Filed",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
    },
    late_filed: {
        label: "Late Filed",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
    },
    in_progress: {
        label: "In Progress",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
    },
    pending: {
        label: "Pending",
        className: "bg-slate-50 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
    },
    not_applicable: {
        label: "N/A",
        className: "bg-slate-50 text-slate-400 border-slate-100 line-through",
        dot: "bg-slate-300",
    },
};

export function FilingStatusBadge({ status }: FilingStatusBadgeProps) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}
