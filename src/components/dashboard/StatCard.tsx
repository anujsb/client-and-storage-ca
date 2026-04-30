import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    colorClass: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, colorClass }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-border-base shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-md ${trend.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend.isPositive ? '+' : '-'}{trend.value}%
                    </div>
                )}
            </div>
            
            <div>
                <h3 className="text-3xl font-black text-brand-900 tracking-tight mb-1">{value}</h3>
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{title}</div>
                {subtitle && (
                    <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
                )}
            </div>
        </div>
    );
}
