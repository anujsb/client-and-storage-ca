import { z } from "zod";

export const CreateWorkSchema = z.object({
    clientId: z.string().uuid("Invalid client ID"),
    employeeId: z.string().uuid("Invalid employee ID").nullable().optional(),
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    filingType: z.enum(["ITR", "GST", "TDS", "Audit", "custom"]),
    customFilingType: z.string().max(50).optional(),
    status: z.enum(["pending", "in_progress", "under_review", "completed"]).optional(),
    priority: z.enum(["low", "normal", "medium", "high", "urgent"]).optional(),
    description: z.string().max(1000).optional(),
    dueDate: z.string().datetime().optional().or(z.date().optional()),
    tags: z.array(z.string()).optional(),
    estimatedMinutes: z.number().int().nonnegative().optional(),
});

export type CreateWorkInput = z.infer<typeof CreateWorkSchema>;

export const UpdateWorkSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    employeeId: z.string().uuid().nullable().optional(),
    status: z.enum(["pending", "in_progress", "under_review", "completed"]).optional(),
    priority: z.enum(["low", "normal", "medium", "high", "urgent"]).optional(),
    description: z.string().max(1000).optional(),
    dueDate: z.string().datetime().nullable().optional().or(z.date().nullable().optional()),
    tags: z.array(z.string()).optional(),
});

export type UpdateWorkInput = z.infer<typeof UpdateWorkSchema>;

export const AddSubTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    assigneeId: z.string().uuid().optional(),
});

export type AddSubTaskInput = z.infer<typeof AddSubTaskSchema>;

export const UpdateSubTaskSchema = z.object({
    subTaskId: z.string(),
    completed: z.boolean().optional(),
    title: z.string().optional(),
});

export type UpdateSubTaskInput = z.infer<typeof UpdateSubTaskSchema>;

export const AddCommentSchema = z.object({
    message: z.string().min(1, "Comment cannot be empty").max(1000),
});

export type AddCommentInput = z.infer<typeof AddCommentSchema>;

export const LogTimeSchema = z.object({
    minutes: z.number().int().positive("Must log at least 1 minute"),
});

export type LogTimeInput = z.infer<typeof LogTimeSchema>;
