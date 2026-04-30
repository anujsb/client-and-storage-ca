import { Badge } from "@/components/ui/badge";

interface PaymentStatusBadgeProps {
    status: string;
    className?: string;
}

export function PaymentStatusBadge({ status, className = "" }: PaymentStatusBadgeProps) {
    const getStatusStyles = () => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 uppercase font-bold text-[10px] tracking-wider";
            case "partial":
                return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 uppercase font-bold text-[10px] tracking-wider";
            case "overdue":
                return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200 uppercase font-bold text-[10px] tracking-wider";
            case "unpaid":
            default:
                return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 uppercase font-bold text-[10px] tracking-wider";
        }
    };

    return (
        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 ${getStatusStyles()} ${className}`}>
            {status}
        </Badge>
    );
}
