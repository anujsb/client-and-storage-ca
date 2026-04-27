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
        <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-zinc-200 h-full">
            {/* Logo */}
            <div className="h-14 flex items-center px-5 border-b border-zinc-200">
                <span className="text-sm font-semibold tracking-tight text-zinc-900">
                    CA<span className="text-indigo-600">FileTrack</span>
                </span>
            </div>

            {/* Main nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive(href)
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                    >
                        <Icon
                            className={cn(
                                "w-4 h-4 shrink-0",
                                isActive(href) ? "text-indigo-600" : "text-zinc-400"
                            )}
                        />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Bottom nav */}
            <div className="px-3 pb-4 space-y-0.5 border-t border-zinc-100 pt-3">
                {bottomItems.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive(href)
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                    >
                        <Icon
                            className={cn(
                                "w-4 h-4 shrink-0",
                                isActive(href) ? "text-indigo-600" : "text-zinc-400"
                            )}
                        />
                        {label}
                    </Link>
                ))}
            </div>
        </aside>
    );
}