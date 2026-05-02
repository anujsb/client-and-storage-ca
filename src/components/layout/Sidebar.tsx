"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    FolderOpen,
    Database,
    ListTodo,
    CreditCard,
    UserCheck,
    LogOut,
    Building2,
    ChevronUp,
    User2,
    Settings,
} from "lucide-react";

import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/shared/NotificationBell";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Client Registry", href: "/clients", icon: Users },
    { label: "Document Registry", href: "/documents", icon: FolderOpen },
    { label: "Storage Locations", href: "/locations", icon: Database },
    { label: "Work/Task Board", href: "/works", icon: ListTodo },
    { label: "Payments & Billing", href: "/payments", icon: CreditCard },
    { label: "Employee Directory", href: "/employees", icon: UserCheck },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Import Data", href: "/import", icon: Database },
];

interface AppSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function Sidebar({ user }: AppSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <ShadcnSidebar collapsible="icon" className="border-r border-border-base bg-white">

            {/* Header / Logo */}
            <SidebarHeader className="h-20 flex flex-row items-center justify-between px-4 py-6">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 border border-brand-100">
                        <Building2 className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="text-[15px] font-bold text-brand-900 truncate tracking-tight">
                            CA Firm Management
                        </span>
                    </div>
                </div>
                <div className="group-data-[collapsible=icon]:hidden">
                    <NotificationBell />
                </div>
            </SidebarHeader>


            {/* Main Content */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2 px-2">
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={item.label}
                                            className={cn(
                                                "h-10 px-3 transition-all duration-200 group relative",
                                                active
                                                    ? "bg-brand-50 text-brand-600 font-semibold hover:bg-brand-50 hover:text-brand-600"
                                                    : "text-text-muted hover:bg-bg-main hover:text-text-dark"
                                            )}
                                        >
                                            <Link href={item.href} className="flex items-center gap-3 w-full">
                                                {/* Active indicator bar */}
                                                {active && (
                                                    <div className="absolute left-0 top-[15%] bottom-[15%] w-1 bg-brand-600 rounded-r-md" />
                                                )}
                                                <item.icon className={cn(
                                                    "w-[18px] h-[18px] shrink-0 transition-colors",
                                                    active ? "text-brand-600" : "text-slate-400 group-hover:text-text-dark"
                                                )} />
                                                <span className="text-[14px] group-data-[collapsible=icon]:hidden">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer / User Profile */}
            <SidebarFooter className="p-3 border-t border-border-light">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="w-full h-14 rounded-xl hover:bg-bg-main transition-all px-2"
                                >
                                    <Avatar className="w-9 h-9 rounded-lg border border-border-base">
                                        {user?.image ? (
                                            <AvatarImage src={user.image} alt={user.name || ""} />
                                        ) : null}
                                        <AvatarFallback className="bg-brand-50 text-brand-600 font-bold text-xs rounded-lg">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start ml-2 leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="text-sm font-bold text-text-dark truncate">
                                            {user?.name || "Admin User"}
                                        </span>
                                        <span className="text-[11px] text-text-muted truncate">
                                            {user?.email || "admin@cafirm.com"}
                                        </span>
                                    </div>
                                    <ChevronUp className="w-4 h-4 ml-auto text-text-muted group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="w-56 mb-2 p-2 rounded-2xl shadow-soft border-border-base"
                            >
                                <DropdownMenuItem className="rounded-xl p-2 gap-3 cursor-pointer">
                                    <User2 className="w-4 h-4 text-text-muted" />
                                    <span className="text-sm font-medium text-text-dark">View Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="rounded-xl p-2 gap-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </ShadcnSidebar>
    );
}