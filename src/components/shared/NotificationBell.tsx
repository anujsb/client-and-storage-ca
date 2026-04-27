"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder — fully wired up in T-68 (notifications phase)
export function NotificationBell() {
    return (
        <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-zinc-900">
            <Bell className="w-4 h-4" />
            {/* Unread badge — shown in T-68 */}
        </Button>
    );
}