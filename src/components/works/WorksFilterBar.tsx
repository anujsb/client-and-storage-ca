import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type ViewMode = "kanban" | "table";
export type GroupByOption = "status" | "assignee" | "priority" | "filingType";

interface WorksFilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    groupBy: GroupByOption;
    setGroupBy: (groupBy: GroupByOption) => void;
    assigneeFilter: string;
    setAssigneeFilter: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    priorityFilter: string;
    setPriorityFilter: (val: string) => void;
    clientFilter: string;
    setClientFilter: (val: string) => void;
    uniqueAssignees: { id: string; name: string }[];
    uniqueClients: { id: string; name: string }[];
    onQuickCreate: () => void;
}

export function WorksFilterBar({
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    groupBy,
    setGroupBy,
    assigneeFilter,
    setAssigneeFilter,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    clientFilter,
    setClientFilter,
    uniqueAssignees,
    uniqueClients,
    onQuickCreate,
}: WorksFilterBarProps) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Search */}
                <div className="flex items-center gap-3 w-full sm:max-w-md bg-white rounded-xl p-1 border border-border-base shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks, clients, tags..."
                            className="pl-9 h-10 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                        />
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-border-base rounded-xl p-1 flex shadow-sm">
                        <Button
                            variant={viewMode === "kanban" ? "secondary" : "ghost"}
                            size="sm"
                            className={`h-8 px-3 rounded-lg ${viewMode === "kanban" ? "bg-slate-100" : ""}`}
                            onClick={() => setViewMode("kanban")}
                        >
                            <LayoutGrid className="w-4 h-4 mr-2" />
                            Board
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="sm"
                            className={`h-8 px-3 rounded-lg ${viewMode === "table" ? "bg-slate-100" : ""}`}
                            onClick={() => setViewMode("table")}
                        >
                            <List className="w-4 h-4 mr-2" />
                            Table
                        </Button>
                    </div>

                    <Button onClick={onQuickCreate} className="h-10 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-soft">
                        Quick Create Task
                    </Button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-border-base shadow-sm">
                <span className="text-sm font-semibold text-text-muted mr-2">Filters:</span>
                
                {/* Group By (Kanban Only) */}
                {viewMode === "kanban" && (
                    <div className="flex items-center gap-2 border-r border-border-base pr-4 mr-1">
                        <span className="text-xs text-text-muted">Group by:</span>
                        <Select value={groupBy} onValueChange={(val: any) => setGroupBy(val)}>
                            <SelectTrigger className="h-8 w-[130px] text-xs">
                                <SelectValue placeholder="Group by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="assignee">Assignee</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="filingType">Filing Type</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                        <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {uniqueAssignees.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                        <SelectValue placeholder="All Clients" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {uniqueClients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="h-8 w-[120px] text-xs">
                        <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>

                {(assigneeFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" || clientFilter !== "all") && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            setAssigneeFilter("all");
                            setStatusFilter("all");
                            setPriorityFilter("all");
                            setClientFilter("all");
                        }}
                        className="h-8 px-2 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 ml-auto"
                    >
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}
