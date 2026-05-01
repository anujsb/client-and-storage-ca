import { requireAuth } from "@/lib/auth/helpers";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
                        {/* Mobile Header */}
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border-base px-4 md:hidden bg-white">
                            <SidebarTrigger />
                            <div className="flex items-center gap-2 ml-2">
                                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                                    CF
                                </div>
                                <span className="text-sm font-bold text-slate-900 tracking-tight">CA FileTrack</span>
                            </div>
                        </header>

                        <main className="flex-1 overflow-y-auto p-4 sm:p-10">{children}</main>
                    </SidebarInset>
                </div>
            </TooltipProvider>
        </SidebarProvider>
    );
}