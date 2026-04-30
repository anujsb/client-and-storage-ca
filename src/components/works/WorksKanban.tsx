import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Paperclip, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkPriorityBadge } from "@/components/works/WorkPriorityBadge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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

interface WorksKanbanProps {
    works: WorkItem[];
    groupBy: "status" | "assignee" | "priority" | "filingType";
    onMove: (workId: string, newFieldId: string) => void;
    onAddClick: () => void;
}

export function WorksKanban({ works, groupBy, onMove, onAddClick }: WorksKanbanProps) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const onDragEnd = (result: any) => {
        const { source, destination, draggableId } = result;

        // Dropped outside the list
        if (!destination) return;

        // Dropped in same column at same position (or reordered within column - currently we don't save order so just ignore)
        if (source.droppableId === destination.droppableId) return;

        // Call onMove with the work ID and the new target column ID
        onMove(draggableId, destination.droppableId);
    };

    const getColumns = () => {
        if (groupBy === "status") {
            return [
                { id: "pending", label: "PENDING", color: "bg-slate-500" },
                { id: "in_progress", label: "IN PROGRESS", color: "bg-blue-500" },
                { id: "under_review", label: "UNDER REVIEW", color: "bg-amber-500" },
                { id: "completed", label: "COMPLETED", color: "bg-green-500" },
            ].map(col => ({ ...col, items: works.filter(w => w.status === col.id) }));
        }

        if (groupBy === "priority") {
            return [
                { id: "low", label: "LOW", color: "bg-slate-400" },
                { id: "normal", label: "NORMAL", color: "bg-blue-400" },
                { id: "medium", label: "MEDIUM", color: "bg-yellow-500" },
                { id: "high", label: "HIGH", color: "bg-orange-500" },
                { id: "urgent", label: "URGENT", color: "bg-red-500" },
            ].map(col => ({ ...col, items: works.filter(w => w.priority === col.id) }));
        }

        if (groupBy === "assignee") {
            const assigneesMap = new Map<string, { id: string, name: string }>();
            works.forEach(w => {
                if (w.assignee) assigneesMap.set(w.assignee.id, w.assignee);
            });
            
            const cols = Array.from(assigneesMap.values()).map(a => ({
                id: a.id,
                label: a.name.toUpperCase(),
                color: "bg-indigo-500",
                items: works.filter(w => w.assignee?.id === a.id)
            }));
            
            // Add Unassigned column
            cols.unshift({
                id: "unassigned",
                label: "UNASSIGNED",
                color: "bg-slate-400",
                items: works.filter(w => !w.assignee)
            });

            return cols;
        }

        if (groupBy === "filingType") {
            const types = Array.from(new Set(works.map(w => w.filingType)));
            return types.map(type => ({
                id: type,
                label: type.toUpperCase(),
                color: "bg-emerald-500",
                items: works.filter(w => w.filingType === type)
            }));
        }

        return [];
    };

    const columns = getColumns();

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px] items-start">
            <DragDropContext onDragEnd={onDragEnd}>
                {columns.map(column => (
                    <div
                        key={column.id}
                        className="shrink-0 w-80 flex flex-col gap-3 rounded-[20px] transition-colors p-3 bg-slate-50 border border-slate-100"
                    >
                        <div className="flex items-center justify-between px-1 mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black text-white tracking-wider ${column.color}`}>
                                    {column.label}
                                </span>
                                <span className="text-text-muted text-sm font-semibold">{column.items.length}</span>
                            </div>
                        </div>

                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex-1 min-h-[150px] transition-colors rounded-xl flex flex-col gap-3 ${snapshot.isDraggingOver ? 'bg-brand-50' : ''}`}
                                >
                                    {column.items.map((work, index) => (
                                        <Draggable key={work.id} draggableId={work.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => router.push(`/works/${work.id}`)}
                                                    className={`bg-white border border-border-base rounded-[16px] p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-brand-500 scale-[1.02] opacity-90' : ''}`}
                                                    style={provided.draggableProps.style}
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
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <GripVertical className="w-4 h-4 text-slate-400" />
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
                                                                    <AvatarFallback className="text-[10px] bg-brand-100 text-brand-700" title={work.assignee.name}>
                                                                        {work.assignee.name.substring(0, 2).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center bg-slate-50" title="Unassigned">
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
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    
                                    {groupBy === "status" && column.id === "pending" && (
                                        <Button variant="ghost" onClick={onAddClick} className="w-full h-12 border-2 border-dashed border-border-base rounded-[16px] text-text-muted hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 mt-1">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Task
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </DragDropContext>
        </div>
    );
}
