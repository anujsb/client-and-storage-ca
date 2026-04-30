"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    message: string;
    type: "info" | "success" | "warning" | "error" | "file_checked_in" | "file_checked_out" | "file_overdue" | "payment_due";
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch("/api/notifications/read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds: [id] }),
            });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch("/api/notifications/read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAll: true }),
            });
            if (res.ok) {
                setNotifications([]);
            }
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "file_checked_in": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "file_checked_out": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case "file_overdue": 
            case "payment_due": return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const unreadCount = notifications.length;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative w-9 h-9 text-text-muted hover:text-text-dark hover:bg-bg-main rounded-lg transition-all">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white border-2 border-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 mt-2 rounded-xl shadow-soft border-border-base overflow-hidden">
                <div className="p-4 border-b border-border-light flex items-center justify-between bg-white">
                    <h3 className="text-sm font-bold text-text-dark">Notifications</h3>
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {unreadCount === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-text-dark">All caught up!</p>
                            <p className="text-xs text-text-muted mt-1">No new notifications.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border-light">
                            {notifications.map((n) => (
                                <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex gap-3">
                                        <div className="mt-1 shrink-0">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-bold text-text-dark leading-tight">{n.message}</p>
                                                <button 
                                                    onClick={() => markAsRead(n.id)}
                                                    className="shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-md border border-transparent hover:border-border-base transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3 h-3 text-text-muted" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-[10px] font-medium text-slate-400">
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                </p>
                                                {n.link && (
                                                    <Link 
                                                        href={n.link}
                                                        onClick={() => {
                                                            markAsRead(n.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-[10px] font-bold text-brand-600 hover:underline"
                                                    >
                                                        View Details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}