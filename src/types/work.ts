export type WorkStatus = "pending" | "in_progress" | "under_review" | "completed";
export type WorkPriority = "low" | "normal" | "medium" | "high" | "urgent";

export interface SubTask {
    id: string;
    title: string;
    completed: boolean;
    assigneeId?: string;
}

export interface ActivityLogEntry {
    id: string;
    type: "comment" | "status_change" | "system";
    message: string;
    timestamp: string;
    userId: string;
    userName: string;
}

export interface TimeTracking {
    estimatedMinutes?: number;
    loggedMinutes?: number;
}

export interface Work {
    id: string;
    tenantId: string;
    clientId: string;
    employeeId: string | null;
    title: string;
    filingType: string;
    customFilingType: string | null;
    status: WorkStatus;
    priority: WorkPriority;
    description: string | null;
    tags: string[] | null;
    subTasks: SubTask[] | null;
    activityLog: ActivityLogEntry[] | null;
    timeTracking: TimeTracking | null;
    startedAt: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
}
