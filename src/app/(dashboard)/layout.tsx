import { requireAuth } from "@/lib/auth/helpers";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireAuth();

    return (
        <SidebarProvider>
            <TooltipProvider>
                <div className="flex h-screen bg-bg-main bg-dot-pattern overflow-hidden w-full">
                    <Sidebar user={session.user} />
                    <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden bg-transparent">
                        <main className="flex-1 overflow-y-auto p-10">{children}</main>
                    </SidebarInset>
                </div>
            </TooltipProvider>
        </SidebarProvider>
    );
}