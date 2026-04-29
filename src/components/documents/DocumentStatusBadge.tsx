import { cn } from "@/lib/utils";

type Status = "in_office" | "checked_out" | "missing" | "returned_to_client" | string;

interface DocumentStatusBadgeProps {
    status: Status;
    className?: string;
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
    const config: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
        in_office: {
            label: "In Office",
            dot: "bg-green-500",
            bg: "bg-green-50",
            text: "text-green-700",
            border: "border-green-200",
        },
        checked_out: {
            label: "Checked Out",
            dot: "bg-amber-500",
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200",
        },
        missing: {
            label: "Missing",
            dot: "bg-red-500",
            bg: "bg-red-50",
            text: "text-red-700",
            border: "border-red-200",
        },
        returned_to_client: {
            label: "Returned",
            dot: "bg-slate-500",
            bg: "bg-slate-50",
            text: "text-slate-700",
            border: "border-slate-200",
        },
    };

    const s = config[status] || config.returned_to_client;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
            s.bg, s.text, s.border,
            className
        )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)}></span>
            {s.label}
        </span>
    );
}
