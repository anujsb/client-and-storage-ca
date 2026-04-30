"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, MessageSquare, Paperclip, Loader2 } from "lucide-react";
import { WorkForm } from "@/components/works/WorkForm";
import { WorkPriorityBadge } from "@/components/works/WorkPriorityBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface WorkItem {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    tags: string[] | null;
    filingType: string;
    timeTracking: { estimatedMinutes?: number; loggedMinutes?: number } | null;
    subTasks: any[] | null;
    client: { id: string; name: string; clientCode: string };
    assignee: { id: string; name: string } | null;
}

export function WorksBoardClient() {
    const router = useRouter();
    const [works, setWorks] = useState<WorkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Search & filters (client side for now to be fast)
    const [searchQuery, setSearchQuery] = useState("");

    // Drag state
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const fetchWorks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/works");
            if (res.ok) setWorks(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, []);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        // Small delay to hide the original element or style it
        setTimeout(() => {
            const el = document.getElementById(`work-${id}`);
            if (el) el.style.opacity = "0.5";
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent, id: string) => {
        setDraggingId(null);
        setDragOverColumn(null);
        const el = document.getElementById(`work-${id}`);
        if (el) el.style.opacity = "1";
    };

    const handleDragOver = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverColumn !== status) setDragOverColumn(status);
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        setDragOverColumn(null);
        const id = e.dataTransfer.getData("text/plain");
        if (!id) return;

        const workToMove = works.find(w => w.id === id);
        if (!workToMove || workToMove.status === targetStatus) return;

        // Optimistic UI update
        setWorks(prev => prev.map(w => w.id === id ? { ...w, status: targetStatus } : w));

        try {
            await fetch(`/api/works/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update", payload: { status: targetStatus } }),
            });
        } catch (error) {
            console.error("Failed to update status", error);
            fetchWorks(); // Revert on failure
        }
    };

    const getColumns = () => {
        const columns = [
            { id: "pending", label: "PENDING", color: "bg-slate-500" },
            { id: "in_progress", label: "IN PROGRESS", color: "bg-blue-500" },
            { id: "under_review", label: "UNDER REVIEW", color: "bg-amber-500" },
            { id: "completed", label: "COMPLETED", color: "bg-green-500" },
        ];

        return columns.map(col => {
            const items = works.filter(w => {
                if (w.status !== col.id) return false;
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return w.title.toLowerCase().includes(q) || w.client.name.toLowerCase().includes(q) || w.client.clientCode.toLowerCase().includes(q);
                }
                return true;
            });
            return { ...col, items };
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:max-w-2xl bg-white rounded-2xl p-1.5 border border-border-base shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks, clients..."
                            className="pl-9 h-10 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsFormOpen(true)} className="h-11 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-soft">
                        <Plus className="w-4 h-4 mr-2" />
                        Quick Create Task
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                </div>
            ) : (
                <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px] items-start">
                    {getColumns().map(column => (
                        <div
                            key={column.id}
                            className={`shrink-0 w-80 flex flex-col gap-3 rounded-[20px] transition-colors p-3 ${dragOverColumn === column.id ? 'bg-brand-50 border-2 border-dashed border-brand-300' : 'bg-transparent border-2 border-transparent'}`}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDragLeave={() => setDragOverColumn(null)}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className="flex items-center justify-between px-1 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black text-white tracking-wider ${column.color}`}>
                                        {column.label}
                                    </span>
                                    <span className="text-text-muted text-sm font-semibold">{column.items.length}</span>
                                </div>
                            </div>

                            {column.items.map(work => (
                                <div
                                    key={work.id}
                                    id={`work-${work.id}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, work.id)}
                                    onDragEnd={(e) => handleDragEnd(e, work.id)}
                                    onClick={() => router.push(`/works/${work.id}`)}
                                    className="bg-white border border-border-base rounded-[16px] p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                                {work.client.clientCode}
                                            </span>
                                            <span className="text-xs font-semibold text-text-muted truncate max-w-[120px]">
                                                {work.client.name}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-brand-900 text-sm mb-3 leading-snug group-hover:text-brand-600 transition-colors">
                                        {work.title}
                                    </h4>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                            {work.filingType}
                                        </span>
                                        <WorkPriorityBadge priority={work.priority} />
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-border-light">
                                        <div>
                                            {work.assignee ? (
                                                <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
                                                    <AvatarFallback className="text-[10px] bg-brand-100 text-brand-700">
                                                        {work.assignee.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                                                    <span className="text-[10px] text-slate-400">?</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-text-muted text-[11px] font-medium">
                                            {work.subTasks && work.subTasks.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Paperclip className="w-3 h-3" />
                                                    <span>{work.subTasks.filter(t => t.completed).length}/{work.subTasks.length}</span>
                                                </div>
                                            )}
                                            {work.dueDate && (
                                                <div className={`flex items-center gap-1 ${new Date(work.dueDate) < new Date() && work.status !== 'completed' ? 'text-red-500' : ''}`}>
                                                    <Calendar className="w-3 h-3" />
                                                    <span>
                                                        {new Date(work.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {column.id === "pending" && (
                                <Button variant="ghost" onClick={() => setIsFormOpen(true)} className="w-full h-12 border-2 border-dashed border-border-base rounded-[16px] text-text-muted hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 mt-1">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <WorkForm open={isFormOpen} onOpenChange={setIsFormOpen} onSuccess={fetchWorks} />
        </div>
    );
}
