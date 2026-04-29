"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share, MoreHorizontal, CheckCircle2, Circle, Plus, Paperclip, Clock, Link as LinkIcon, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkStatusBadge } from "@/components/works/WorkStatusBadge";
import { WorkPriorityBadge } from "@/components/works/WorkPriorityBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function WorkDetailClient({ workId }: { workId: string }) {
    const router = useRouter();
    const [work, setWork] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [newSubtask, setNewSubtask] = useState("");
    const [newComment, setNewComment] = useState("");
    const [logTimeInput, setLogTimeInput] = useState("");
    const [employees, setEmployees] = useState<any[]>([]);

    const fetchWork = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/works/${workId}`);
            if (res.ok) setWork(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await fetch("/api/employees");
            if (res.ok) setEmployees(await res.json());
        } catch (e) {}
    };

    useEffect(() => {
        fetchWork();
        fetchEmployees();
    }, [workId]);

    const updateStatus = async (status: string) => {
        await fetch(`/api/works/${workId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update", payload: { status } }),
        });
        fetchWork();
    };

    const addSubTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        
        await fetch(`/api/works/${workId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add_subtask", payload: { title: newSubtask } }),
        });
        setNewSubtask("");
        fetchWork();
    };

    const toggleSubTask = async (subTaskId: string, completed: boolean) => {
        await fetch(`/api/works/${workId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update_subtask", payload: { subTaskId, completed } }),
        });
        fetchWork();
    };

    const addComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        await fetch(`/api/works/${workId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add_comment", payload: { message: newComment } }),
        });
        setNewComment("");
        fetchWork();
    };

    const logTime = async () => {
        const minutes = parseInt(logTimeInput);
        if (!minutes || minutes <= 0) return;

        await fetch(`/api/works/${workId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "log_time", payload: { minutes } }),
        });
        setLogTimeInput("");
        fetchWork();
    };

    if (isLoading) return <div className="p-8 text-center text-text-muted">Loading task details...</div>;
    if (!work) return <div className="p-8 text-center text-red-500">Task not found</div>;

    const subTasks = work.subTasks || [];
    const completedSubTasks = subTasks.filter((t: any) => t.completed).length;
    const progressPercent = subTasks.length > 0 ? (completedSubTasks / subTasks.length) * 100 : 0;
    
    const timeTrack = work.timeTracking || { estimatedMinutes: 0, loggedMinutes: 0 };
    const timeProgress = timeTrack.estimatedMinutes > 0 ? Math.min((timeTrack.loggedMinutes / timeTrack.estimatedMinutes) * 100, 100) : 0;

    const formatMinutes = (m: number) => {
        const hrs = Math.floor(m / 60);
        const mins = m % 60;
        return `${hrs}h ${mins}m`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between bg-white p-6 rounded-[24px] border border-border-base shadow-sm">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/works")} className="h-10 w-10 mt-1 shrink-0 rounded-full bg-slate-50 hover:bg-slate-100">
                        <ArrowLeft className="w-5 h-5 text-text-muted" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-brand-50 text-brand-600 text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                {work.client.clientCode}
                            </span>
                            <span className="text-text-muted font-medium text-sm">{work.client.name}</span>
                        </div>
                        <h1 className="text-2xl font-black text-brand-900 tracking-tight leading-none mb-3">
                            {work.title}
                        </h1>
                        <div className="flex gap-2">
                            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold px-2 py-0.5 rounded-md">
                                {work.filingType}
                            </span>
                            <WorkPriorityBadge priority={work.priority} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={work.status} onValueChange={updateStatus}>
                        <SelectTrigger className="w-[160px] h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Button variant="outline" className="h-10 rounded-xl border-border-base shadow-sm text-text-dark font-semibold">
                        <Share className="w-4 h-4 mr-2 text-text-muted" />
                        Share
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
                        <MoreHorizontal className="w-5 h-5 text-text-muted" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Description */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-text-dark uppercase tracking-wider mb-4">
                            <span className="w-4 h-4 rounded text-brand-500 bg-brand-50 flex items-center justify-center">≡</span>
                            Description
                        </h3>
                        <div className="text-[14px] text-text-dark leading-relaxed whitespace-pre-wrap">
                            {work.description || <span className="text-text-muted italic">No description provided.</span>}
                        </div>
                    </div>

                    {/* Sub-tasks */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-text-dark uppercase tracking-wider">
                                <span className="w-4 h-4 rounded text-brand-500 bg-brand-50 flex items-center justify-center">✓</span>
                                Sub-tasks
                            </h3>
                            <span className="text-xs font-semibold text-text-muted bg-slate-100 px-2 py-0.5 rounded-full">
                                {completedSubTasks}/{subTasks.length} Completed
                            </span>
                        </div>

                        {subTasks.length > 0 && (
                            <div className="mb-5">
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 mb-4">
                            {subTasks.map((st: any) => (
                                <div key={st.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group">
                                    <button onClick={() => toggleSubTask(st.id, !st.completed)} className="mt-0.5 text-text-muted hover:text-brand-500 transition-colors">
                                        {st.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                    <div className={`flex-1 text-[14px] ${st.completed ? 'text-text-muted line-through' : 'text-text-dark font-medium'}`}>
                                        {st.title}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={addSubTask} className="flex items-center gap-2">
                            <Input 
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                placeholder="Add a new sub-task..." 
                                className="h-10 rounded-xl bg-slate-50 border-transparent focus-visible:ring-1 focus-visible:ring-brand-500"
                            />
                            <Button type="submit" variant="secondary" className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-dark px-4">
                                Add
                            </Button>
                        </form>
                    </div>

                    {/* Activity & Comments */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-text-dark uppercase tracking-wider">
                                <MessageSquare className="w-4 h-4 text-brand-500" />
                                Activity & Comments
                            </h3>
                        </div>

                        <form onSubmit={addComment} className="flex gap-4 mb-8">
                            <Avatar className="w-10 h-10 border border-slate-200">
                                <AvatarFallback className="bg-brand-100 text-brand-700 font-bold">ME</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3">
                                <Textarea 
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add a comment or update..." 
                                    className="min-h-[80px] rounded-xl resize-none bg-slate-50 border-slate-200 focus-visible:ring-brand-500 focus-visible:border-brand-500"
                                />
                                <div className="flex justify-between items-center">
                                    <Button type="button" variant="ghost" size="icon" className="text-text-muted hover:text-brand-500 rounded-lg">
                                        <Paperclip className="w-4 h-4" />
                                    </Button>
                                    <Button type="submit" disabled={!newComment.trim()} className="h-9 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium">
                                        Comment
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {(work.activityLog || []).map((log: any, idx: number) => (
                                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        {log.type === "comment" ? <MessageSquare className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-border-light shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-text-dark text-[13px]">{log.userName}</span>
                                            <time className="text-[11px] text-text-muted font-medium">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                                        </div>
                                        <div className="text-[13px] text-text-muted">{log.message}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Task Details */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-5">Task Details</h3>
                        
                        <div className="space-y-5">
                            <div>
                                <div className="text-[11px] font-bold text-text-muted uppercase mb-2">Assignee</div>
                                <div className="flex items-center gap-2">
                                    {work.assignee ? (
                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pr-3 pl-1 py-1">
                                            <Avatar className="w-6 h-6">
                                                <AvatarFallback className="text-[10px] bg-brand-100 text-brand-700">{work.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-semibold text-text-dark">{work.assignee.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-text-muted italic">Unassigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[11px] font-bold text-text-muted uppercase mb-1">Created</div>
                                    <div className="text-[13px] font-semibold text-text-dark">
                                        {new Date(work.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-text-muted uppercase mb-1">Due Date</div>
                                    <div className={`text-[13px] font-bold px-2 py-1 rounded-md inline-block ${!work.dueDate ? 'text-text-muted bg-slate-50' : new Date(work.dueDate) < new Date() && work.status !== 'completed' ? 'text-red-700 bg-red-50 border border-red-200' : 'text-orange-700 bg-orange-50 border border-orange-200'}`}>
                                        {work.dueDate ? new Date(work.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "No date"}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-[11px] font-bold text-text-muted uppercase mb-2">Tags</div>
                                <div className="flex flex-wrap gap-2">
                                    {work.tags && work.tags.length > 0 ? work.tags.map((tag: string) => (
                                        <span key={tag} className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-text-muted">No tags</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Data */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Related Data</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="text-[11px] font-bold text-text-muted uppercase mb-2">Client Profile</div>
                                <div onClick={() => router.push(`/clients/${work.client.id}`)} className="flex items-center justify-between p-3 rounded-xl border border-border-base bg-slate-50 hover:bg-brand-50 hover:border-brand-200 cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                            <span className="text-xs font-bold text-slate-500">🏢</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-text-dark group-hover:text-brand-700">{work.client.name}</div>
                                            <div className="text-[11px] font-medium text-text-muted">{work.client.clientCode}</div>
                                        </div>
                                    </div>
                                    <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time & Effort */}
                    <div className="bg-white rounded-[24px] border border-border-base p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Time & Effort</h3>
                        </div>

                        <div className="space-y-3 mb-5">
                            <div className="flex justify-between text-[13px] font-semibold text-text-dark">
                                <span>Estimated</span>
                                <span>{formatMinutes(timeTrack.estimatedMinutes || 0)}</span>
                            </div>
                            <div className="flex justify-between text-[13px] font-semibold text-brand-600">
                                <span>Logged</span>
                                <span>{formatMinutes(timeTrack.loggedMinutes || 0)}</span>
                            </div>
                            
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${timeTrack.loggedMinutes > timeTrack.estimatedMinutes ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${timeProgress}%` }} />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                placeholder="Minutes..." 
                                value={logTimeInput}
                                onChange={(e) => setLogTimeInput(e.target.value)}
                                className="h-9 rounded-lg"
                            />
                            <Button onClick={logTime} variant="secondary" className="h-9 rounded-lg px-4 shrink-0 font-medium">
                                Log Time
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
