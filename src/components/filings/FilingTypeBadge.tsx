"use client";

interface FilingTypeBadgeProps {
    code: string;
    category: string;
    size?: "sm" | "md";
}

const CATEGORY_STYLES: Record<string, string> = {
    gst: "bg-emerald-50 text-emerald-700 border-emerald-200",
    income_tax: "bg-blue-50 text-blue-700 border-blue-200",
    tds: "bg-amber-50 text-amber-700 border-amber-200",
    audit: "bg-purple-50 text-purple-700 border-purple-200",
    other: "bg-slate-50 text-slate-600 border-slate-200",
};

export function FilingTypeBadge({ code, category, size = "sm" }: FilingTypeBadgeProps) {
    const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;
    const sizeClass = size === "sm"
        ? "text-[10px] px-2 py-0.5 font-bold tracking-wide"
        : "text-[11px] px-2.5 py-1 font-bold tracking-wide";

    return (
        <span className={`inline-flex items-center rounded-md border ${style} ${sizeClass} whitespace-nowrap`}>
            {code}
        </span>
    );
}
