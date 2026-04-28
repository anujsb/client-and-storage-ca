"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface TopbarProps {
    firmName: string;
    userName: string;
}

export function Topbar({ firmName, userName }: TopbarProps) {
    return (
        <header className="h-16 shrink-0 flex items-center justify-between px-8 bg-white border-b border-border-light z-0">
            {/* Firm name */}
            <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-text-dark">{firmName}</p>
                <div className="w-1 h-1 rounded-full bg-border-base" />
                <p className="text-[12px] text-text-muted">Management Portal</p>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notification bell — wired up in T-68 */}
                <NotificationBell />

                <div className="w-px h-6 bg-border-light mx-1" />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 px-2 hover:bg-bg-main rounded-lg transition-all"
                        >
                            <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-[11px]">
                                {userName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[13px] font-medium text-text-dark leading-none">{userName}</span>
                                <span className="text-[10px] text-text-muted leading-none mt-1">Administrator</span>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-xl shadow-soft border-border-base">
                        <DropdownMenuItem
                            className="flex items-center gap-2 p-2 text-red-600 focus:text-red-600 cursor-pointer rounded-lg"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Sign out</span>
                                <span className="text-[10px] text-red-400">End your current session</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}