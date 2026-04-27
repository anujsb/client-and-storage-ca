import { requireAuth } from "@/lib/auth/helpers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireAuth();

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar
                    firmName={session.user.tenantName}
                    userName={session.user.name}
                />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}