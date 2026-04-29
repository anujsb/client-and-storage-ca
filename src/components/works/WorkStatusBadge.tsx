import { Badge } from "@/components/ui/badge";

interface WorkStatusBadgeProps {
    status: string;
    className?: string;
}

export function WorkStatusBadge({ status, className = "" }: WorkStatusBadgeProps) {
    const getStatusStyles = () => {
        switch (status) {
            case "pending":
                return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 uppercase font-bold text-[10px] tracking-wider";
            case "in_progress":
                return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 uppercase font-bold text-[10px] tracking-wider";
            case "under_review":
                return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 uppercase font-bold text-[10px] tracking-wider";
            case "completed":
                return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 uppercase font-bold text-[10px] tracking-wider";
            default:
                return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 uppercase font-bold text-[10px] tracking-wider";
        }
    };

    const getStatusLabel = () => {
        return status.replace("_", " ");
    };

    return (
        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 ${getStatusStyles()} ${className}`}>
            {getStatusLabel()}
        </Badge>
    );
}
