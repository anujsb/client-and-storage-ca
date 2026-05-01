import { db } from "@/lib/db";
import { works, clients, employees } from "@/lib/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { CreateWorkInput, UpdateWorkInput, AddSubTaskInput, UpdateSubTaskInput, AddCommentInput, LogTimeInput } from "@/lib/validations/work";
// No import needed for crypto.randomUUID in Next.js/Node 16+

export class WorkService {
    async list(tenantId: string, clientId?: string) {
        const conditions = [eq(works.tenantId, tenantId)];
        if (clientId) {
            conditions.push(eq(works.clientId, clientId));
        }

        return await db
            .select({
                id: works.id,
                title: works.title,
                status: works.status,
                priority: works.priority,
                dueDate: works.dueDate,
                tags: works.tags,
                timeTracking: works.timeTracking,
                subTasks: works.subTasks,
                filingType: works.filingType,
                client: {
                    id: clients.id,
                    name: clients.name,
                    clientCode: clients.clientCode,
                },
                assignee: {
                    id: employees.id,
                    name: employees.name,
                }
            })
            .from(works)
            .innerJoin(clients, eq(works.clientId, clients.id))
            .leftJoin(employees, eq(works.employeeId, employees.id))
            .where(and(...conditions))
            .orderBy(desc(works.createdAt));
    }

    async getById(id: string, tenantId: string) {
        const [work] = await db
            .select({
                id: works.id,
                title: works.title,
                status: works.status,
                priority: works.priority,
                description: works.description,
                dueDate: works.dueDate,
                tags: works.tags,
                timeTracking: works.timeTracking,
                subTasks: works.subTasks,
                activityLog: works.activityLog,
                filingType: works.filingType,
                createdAt: works.createdAt,
                client: {
                    id: clients.id,
                    name: clients.name,
                    clientCode: clients.clientCode,
                },
                assignee: {
                    id: employees.id,
                    name: employees.name,
                }
            })
            .from(works)
            .innerJoin(clients, eq(works.clientId, clients.id))
            .leftJoin(employees, eq(works.employeeId, employees.id))
            .where(and(eq(works.id, id), eq(works.tenantId, tenantId)))
            .limit(1);

        return work;
    }

    async create(tenantId: string, input: CreateWorkInput, userId: string, userName: string) {
        let dueDateObj = input.dueDate ? new Date(input.dueDate) : null;
        
        const [work] = await db.insert(works).values({
            tenantId,
            clientId: input.clientId,
            employeeId: input.employeeId || null,
            title: input.title,
            filingType: input.filingType,
            customFilingType: input.customFilingType || null,
            status: input.status || "pending",
            priority: input.priority || "normal",
            description: input.description || null,
            dueDate: dueDateObj,
            tags: input.tags || [],
            subTasks: [],
            activityLog: [{
                id: crypto.randomUUID(),
                type: "system",
                message: "Task created",
                timestamp: new Date().toISOString(),
                userId,
                userName,
            }],
            timeTracking: {
                estimatedMinutes: input.estimatedMinutes || 0,
                loggedMinutes: 0,
            }
        }).returning();

        return work;
    }

    async update(id: string, tenantId: string, input: UpdateWorkInput, userId: string, userName: string) {
        // Fetch existing to get current log
        const [current] = await db.select({ status: works.status, activityLog: works.activityLog }).from(works).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).limit(1);
        if (!current) throw new Error("Work not found");

        const updateData: any = { ...input };
        if (input.dueDate !== undefined) {
            updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
        }

        const newLog = current.activityLog || [];
        
        if (input.status && input.status !== current.status) {
            newLog.unshift({
                id: crypto.randomUUID(),
                type: "status_change",
                message: `Status changed from ${current.status} to ${input.status}`,
                timestamp: new Date().toISOString(),
                userId,
                userName,
            });
            updateData.activityLog = newLog;
            
            if (input.status === "completed") {
                updateData.completedAt = new Date();
            } else if (current.status === "pending" && input.status === "in_progress") {
                updateData.startedAt = new Date();
            }
        }

        const [work] = await db.update(works).set(updateData).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).returning();
        return work;
    }

    async addSubTask(id: string, tenantId: string, input: AddSubTaskInput) {
        const [current] = await db.select({ subTasks: works.subTasks }).from(works).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).limit(1);
        if (!current) throw new Error("Work not found");

        const subTasks = current.subTasks || [];
        subTasks.push({
            id: crypto.randomUUID(),
            title: input.title,
            completed: false,
            assigneeId: input.assigneeId,
        });

        const [work] = await db.update(works).set({ subTasks }).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).returning();
        return work;
    }

    async updateSubTask(id: string, tenantId: string, input: UpdateSubTaskInput) {
        const [current] = await db.select({ subTasks: works.subTasks }).from(works).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).limit(1);
        if (!current) throw new Error("Work not found");

        const subTasks = current.subTasks || [];
        const taskIndex = subTasks.findIndex((t: any) => t.id === input.subTaskId);
        if (taskIndex === -1) throw new Error("Subtask not found");

        if (input.completed !== undefined) subTasks[taskIndex].completed = input.completed;
        if (input.title !== undefined) subTasks[taskIndex].title = input.title;

        const [work] = await db.update(works).set({ subTasks }).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).returning();
        return work;
    }

    async addComment(id: string, tenantId: string, input: AddCommentInput, userId: string, userName: string) {
        const [current] = await db.select({ activityLog: works.activityLog }).from(works).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).limit(1);
        if (!current) throw new Error("Work not found");

        const activityLog = current.activityLog || [];
        activityLog.unshift({
            id: crypto.randomUUID(),
            type: "comment",
            message: input.message,
            timestamp: new Date().toISOString(),
            userId,
            userName,
        });

        const [work] = await db.update(works).set({ activityLog }).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).returning();
        return work;
    }

    async logTime(id: string, tenantId: string, input: LogTimeInput) {
        const [current] = await db.select({ timeTracking: works.timeTracking }).from(works).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).limit(1);
        if (!current) throw new Error("Work not found");

        const timeTracking = current.timeTracking || { estimatedMinutes: 0, loggedMinutes: 0 };
        timeTracking.loggedMinutes = (timeTracking.loggedMinutes || 0) + input.minutes;

        const [work] = await db.update(works).set({ timeTracking }).where(and(eq(works.id, id), eq(works.tenantId, tenantId))).returning();
        return work;
    }
}
