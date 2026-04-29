import * as z from "zod";

export const createStorageNodeSchema = z.object({
    parentId: z.string().uuid().nullable().optional(),
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    levelLabel: z.string().max(50, "Label is too long").nullable().optional(),
});

export type CreateStorageNodeInput = z.infer<typeof createStorageNodeSchema>;

export const updateStorageNodeSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
    levelLabel: z.string().max(50, "Label is too long").nullable().optional(),
});

export type UpdateStorageNodeInput = z.infer<typeof updateStorageNodeSchema>;
