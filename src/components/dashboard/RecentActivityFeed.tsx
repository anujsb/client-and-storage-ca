import { formatDistanceToNow } from "date-fns";
import { UserPlus, Briefcase, IndianRupee, Activity } from "lucide-react";

export function RecentActivityFeed({ activities }: { activities: any[] }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-text-dark">No recent activity</h4>
                <p className="text-xs text-text-muted mt-1">Actions will appear here soon.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent pt-2">
            {activities.map((activity, index) => {
                let icon;
                let bgColor = "";
                let textColor = "";

                if (activity.type === "client") {
                    icon = <UserPlus className="w-4 h-4" />;
                    bgColor = "bg-blue-50";
                    textColor = "text-blue-500";
                } else if (activity.type === "work") {
                    icon = <Briefcase className="w-4 h-4" />;
                    bgColor = "bg-brand-50";
                    textColor = "text-brand-500";
                } else {
                    icon = <IndianRupee className="w-4 h-4" />;
                    bgColor = "bg-green-50";
                    textColor = "text-green-500";
                }

                return (
                    <div key={activity.id + index} className="relative flex items-start group">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm shrink-0 z-10 ${bgColor} ${textColor}`}>
                            {icon}
                        </div>
                        <div className="ml-4 mt-1">
                            <div className="text-sm font-bold text-text-dark">{activity.title}</div>
                            <div className="text-xs font-semibold text-text-muted mt-0.5">{activity.subtitle}</div>
                            <div className="text-[11px] font-medium text-slate-400 mt-1">
                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
