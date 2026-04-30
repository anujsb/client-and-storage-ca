import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { CheckedOutList } from "@/components/dashboard/CheckedOutList";
import { PendingPaymentsList } from "@/components/dashboard/PendingPaymentsList";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { Users, FileText, CheckCircle2, DollarSign } from "lucide-react";
import { DashboardService } from "@/services/dashboard.service";
import { getTenantId } from "@/lib/auth/helpers";
import { formatCurrency } from "@/lib/utils/currency";

export const metadata = {
    title: "Dashboard | CA FileTrack",
};

export default async function DashboardPage() {
    const tenantId = await getTenantId();
    const dashboardService = new DashboardService();
    const { stats, checkedOut, pendingPayments, activity } = await dashboardService.getDashboardData(tenantId);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <PageHeader
                title="Dashboard Overview"
                description="Your firm's operational snapshot at a glance."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Clients" 
                    value={stats.totalClients} 
                    icon={Users} 
                    colorClass="bg-blue-50 text-blue-600" 
                />
                <StatCard 
                    title="Documents Stored" 
                    value={stats.totalDocuments} 
                    icon={FileText} 
                    colorClass="bg-indigo-50 text-indigo-600" 
                />
                <StatCard 
                    title="Pending Tasks" 
                    value={stats.pendingWorks} 
                    icon={CheckCircle2} 
                    colorClass="bg-amber-50 text-amber-600" 
                />
                <StatCard 
                    title="Overdue Invoices" 
                    value={stats.overduePayments} 
                    icon={DollarSign} 
                    colorClass="bg-red-50 text-red-600" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Priority Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Documents Currently Out */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider">Checked Out Documents</h3>
                        </div>
                        <CheckedOutList documents={checkedOut} />
                    </div>

                    {/* Pending & Overdue Payments */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider">Pending Payments</h3>
                        </div>
                        <PendingPaymentsList payments={pendingPayments} />
                    </div>
                </div>

                {/* Right Column - Activity */}
                <div className="space-y-8">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider">Recent Activity</h3>
                        </div>
                        <RecentActivityFeed activities={activity} />
                    </div>
                </div>
            </div>
        </div>
    );
}
