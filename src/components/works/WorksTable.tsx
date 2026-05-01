import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkPriorityBadge } from "@/components/works/WorkPriorityBadge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface WorksTableProps {
    works: WorkItem[];
}

export function WorksTable({ works }: WorksTableProps) {
    const router = useRouter();

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
            in_progress: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
            under_review: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
            completed: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
        };
        const labels: Record<string, string> = {
            pending: "Pending",
            in_progress: "In Progress",
            under_review: "Under Review",
            completed: "Completed",
        };
        return (
            <Badge variant="outline" className={`${styles[status] || styles.pending} border shadow-none font-semibold text-xs py-0.5`}>
                {labels[status] || status}
            </Badge>
        );
    };

    if (works.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-border-base">
                <p className="text-text-muted mb-2 font-medium">No tasks found</p>
                <p className="text-sm text-text-muted">Adjust your filters to see more tasks.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-border-base overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <Table className="min-w-[900px] md:min-w-full">
                <TableHeader className="bg-slate-50 border-b border-border-light">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-slate-600 text-xs tracking-wider uppercase pl-6">Client</TableHead>
                        <TableHead className="font-semibold text-slate-600 text-xs tracking-wider uppercase">Title</TableHead>
                        <TableHead className="font-semibold text-slate-600 text-xs tracking-wider uppercase">Status</TableHead>
                        <TableHead className="font-semibold text-slate-600 text-xs tracking-wider uppercase">Priority</TableHead>
                        <TableHead className="font-semibold text-slate-600 text-xs tracking-wider uppercase">Filing</TableHead>
                        <TableHead className="font-semibold text-slate-600 text-xs tracking-wider uppercase">Assignee</TableHead>
                        <TableHead className="font-semibold text-slate-600 text-xs tracking-wider uppercase text-right pr-6">Due Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {works.map((work) => (
                        <TableRow 
                            key={work.id} 
                            onClick={() => router.push(`/works/${work.id}`)}
                            className="cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                        >
                            <TableCell className="pl-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-900">{work.client.name}</span>
                                    <span className="text-xs text-slate-500">{work.client.clientCode}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <span className="text-sm font-medium text-slate-800 line-clamp-1 max-w-[250px]">{work.title}</span>
                                {work.subTasks && work.subTasks.length > 0 && (
                                    <span className="text-[10px] text-slate-500 mt-1 block">
                                        {work.subTasks.filter(t => t.completed).length}/{work.subTasks.length} subtasks
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="py-4">
                                {getStatusBadge(work.status)}
                            </TableCell>
                            <TableCell className="py-4">
                                <WorkPriorityBadge priority={work.priority} />
                            </TableCell>
                            <TableCell className="py-4">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-2.5 py-1 rounded-md inline-block">
                                    {work.filingType}
                                </span>
                            </TableCell>
                            <TableCell className="py-4">
                                {work.assignee ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                            <AvatarFallback className="text-[10px] bg-brand-100 text-brand-700">
                                                {work.assignee.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium text-slate-700">{work.assignee.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right pr-6 py-4">
                                {work.dueDate ? (
                                    <span className={`text-sm ${new Date(work.dueDate) < new Date() && work.status !== 'completed' ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                                        {format(new Date(work.dueDate), "MMM d, yyyy")}
                                    </span>
                                ) : (
                                    <span className="text-slate-400 text-sm">-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
        </div>
    );
}
