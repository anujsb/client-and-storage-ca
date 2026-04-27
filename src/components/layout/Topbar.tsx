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
        <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-white border-b border-zinc-200">
            {/* Firm name */}
            <p className="text-sm font-medium text-zinc-800">{firmName}</p>

            {/* Right side */}
            <div className="flex items-center gap-2">
                {/* Notification bell — wired up in T-68 */}
                <NotificationBell />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900"
                        >
                            <span className="text-sm font-medium">{userName}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}