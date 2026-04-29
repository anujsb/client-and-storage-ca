import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface WorkPriorityBadgeProps {
    priority: string;
    className?: string;
}

export function WorkPriorityBadge({ priority, className = "" }: WorkPriorityBadgeProps) {
    const getPriorityStyles = () => {
        switch (priority) {
            case "low":
                return "bg-slate-50 text-slate-600 border-slate-200";
            case "normal":
                return "bg-slate-50 text-slate-700 border-slate-200";
            case "medium":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "high":
            case "urgent":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    const isHighPriority = priority === "high" || priority === "urgent";

    return (
        <Badge variant="outline" className={`rounded-md px-2 py-0.5 font-medium text-[11px] gap-1 ${getPriorityStyles()} ${className}`}>
            {isHighPriority && <Flame className="w-3 h-3 text-red-500" />}
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
    );
}
