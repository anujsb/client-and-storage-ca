"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { WorkForm } from "@/components/works/WorkForm";
import { WorksFilterBar, ViewMode, GroupByOption } from "@/components/works/WorksFilterBar";
import { WorksKanban } from "@/components/works/WorksKanban";
import { WorksTable } from "@/components/works/WorksTable";

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
    const [works, setWorks] = useState<WorkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [assigneeFilter, setAssigneeFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    // View settings
    const [viewMode, setViewMode] = useState<ViewMode>("kanban");
    const [groupBy, setGroupBy] = useState<GroupByOption>("status");

    // Load persisted settings
    useEffect(() => {
        const savedViewMode = localStorage.getItem("works_viewMode");
        const savedGroupBy = localStorage.getItem("works_groupBy");
        if (savedViewMode === "kanban" || savedViewMode === "table") setViewMode(savedViewMode as ViewMode);
        if (savedGroupBy === "status" || savedGroupBy === "assignee" || savedGroupBy === "priority" || savedGroupBy === "filingType") setGroupBy(savedGroupBy as GroupByOption);
    }, []);

    // Save persisted settings
    useEffect(() => {
        localStorage.setItem("works_viewMode", viewMode);
        localStorage.setItem("works_groupBy", groupBy);
    }, [viewMode, groupBy]);

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

    // Extract unique assignees for the filter dropdown
    const uniqueAssignees = useMemo(() => {
        const map = new Map<string, { id: string; name: string }>();
        works.forEach(w => {
            if (w.assignee) map.set(w.assignee.id, w.assignee);
        });
        return Array.from(map.values());
    }, [works]);

    // Apply filters
    const filteredWorks = useMemo(() => {
        return works.filter(w => {
            // Search filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesSearch = 
                    w.title.toLowerCase().includes(q) || 
                    w.client.name.toLowerCase().includes(q) || 
                    w.client.clientCode.toLowerCase().includes(q) ||
                    (w.tags && w.tags.some(t => t.toLowerCase().includes(q)));
                if (!matchesSearch) return false;
            }

            // Status filter
            if (statusFilter !== "all" && w.status !== statusFilter) return false;

            // Priority filter
            if (priorityFilter !== "all" && w.priority !== priorityFilter) return false;

            // Assignee filter
            if (assigneeFilter !== "all") {
                if (assigneeFilter === "unassigned" && w.assignee) return false;
                if (assigneeFilter !== "unassigned" && (!w.assignee || w.assignee.id !== assigneeFilter)) return false;
            }

            return true;
        });
    }, [works, searchQuery, statusFilter, assigneeFilter, priorityFilter]);

    const handleWorkMove = async (workId: string, newFieldId: string) => {
        const work = works.find(w => w.id === workId);
        if (!work) return;

        let updatedWorks = [...works];
        let payload: any = {};
        
        if (groupBy === "status") {
            if (work.status === newFieldId) return;
            payload.status = newFieldId;
            updatedWorks = updatedWorks.map(w => w.id === workId ? { ...w, status: newFieldId } : w);
        } else if (groupBy === "assignee") {
            const newAssigneeId = newFieldId === "unassigned" ? null : newFieldId;
            if (work.assignee?.id === newAssigneeId || (!work.assignee && newFieldId === "unassigned")) return;
            payload.employeeId = newAssigneeId;
            updatedWorks = updatedWorks.map(w => {
                if (w.id === workId) {
                    if (!newAssigneeId) return { ...w, assignee: null };
                    const existingAssignee = works.find(item => item.assignee?.id === newAssigneeId)?.assignee;
                    return { ...w, assignee: existingAssignee || { id: newAssigneeId, name: "Assigned" } };
                }
                return w;
            });
        } else if (groupBy === "priority") {
            if (work.priority === newFieldId) return;
            payload.priority = newFieldId;
            updatedWorks = updatedWorks.map(w => w.id === workId ? { ...w, priority: newFieldId } : w);
        } else if (groupBy === "filingType") {
            if (work.filingType === newFieldId) return;
            payload.filingType = newFieldId;
            updatedWorks = updatedWorks.map(w => w.id === workId ? { ...w, filingType: newFieldId } : w);
        }

        setWorks(updatedWorks);

        try {
            const res = await fetch(`/api/works/${workId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update", payload }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to update task");
            }
            fetchWorks(); // Sync exact data from server
        } catch (error) {
            console.error("Failed to update task", error);
            fetchWorks(); // Revert on failure
        }
    };

    return (
        <div className="space-y-6">
            <WorksFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                viewMode={viewMode}
                setViewMode={setViewMode}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
                assigneeFilter={assigneeFilter}
                setAssigneeFilter={setAssigneeFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                uniqueAssignees={uniqueAssignees}
                onQuickCreate={() => setIsFormOpen(true)}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-border-base">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                </div>
            ) : (
                <>
                    {viewMode === "kanban" ? (
                        <WorksKanban 
                            works={filteredWorks} 
                            groupBy={groupBy} 
                            onMove={handleWorkMove}
                            onAddClick={() => setIsFormOpen(true)}
                        />
                    ) : (
                        <WorksTable works={filteredWorks} />
                    )}
                </>
            )}

            <WorkForm open={isFormOpen} onOpenChange={setIsFormOpen} onSuccess={fetchWorks} />
        </div>
    );
}
