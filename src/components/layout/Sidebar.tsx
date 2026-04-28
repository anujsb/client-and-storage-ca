"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FolderOpen,
    Briefcase,
    CreditCard,
    UserCheck,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Documents", href: "/documents", icon: FolderOpen },
    { label: "Works", href: "/works", icon: Briefcase },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Employees", href: "/employees", icon: UserCheck },
];

const bottomItems = [
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-border-base h-full shadow-soft z-10">
            {/* Logo area */}
            <div className="h-16 flex items-center px-6 border-b border-border-light">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-brand-900">
                        CA<span className="text-brand-600">FileTrack</span>
                    </span>
                </div>
            </div>

            {/* Main navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-4 px-2">
                    Main Menu
                </div>
                {navItems.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200",
                            isActive(href)
                                ? "bg-brand-50 text-brand-600 shadow-sm"
                                : "text-text-muted hover:bg-bg-main hover:text-text-dark"
                        )}
                    >
                        <Icon
                            className={cn(
                                "w-4.5 h-4.5 shrink-0 transition-colors",
                                isActive(href) ? "text-brand-600" : "text-text-muted group-hover:text-text-dark"
                            )}
                        />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Bottom items */}
            <div className="px-4 pb-6 space-y-1 pt-4 border-t border-border-light">
                {bottomItems.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200",
                            isActive(href)
                                ? "bg-brand-50 text-brand-600 shadow-sm"
                                : "text-text-muted hover:bg-bg-main hover:text-text-dark"
                        )}
                    >
                        <Icon
                            className={cn(
                                "w-4.5 h-4.5 shrink-0",
                                isActive(href) ? "text-brand-600" : "text-text-muted"
                            )}
                        />
                        {label}
                    </Link>
                ))}
            </div>
        </aside>
    );
}