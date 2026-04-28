"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder — fully wired up in T-68 (notifications phase)
export function NotificationBell() {
    return (
        <Button variant="ghost" size="icon" className="relative w-9 h-9 text-text-muted hover:text-text-dark hover:bg-bg-main rounded-lg transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
        </Button>
    );
}