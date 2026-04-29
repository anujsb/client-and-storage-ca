import { z } from "zod";

export const CreateDocumentSchema = z.object({
    clientId: z.string().uuid("Invalid client selected"),
    docType: z.string().min(1, "Document type is required"),
    yearPeriod: z.string().optional(),
    pagesVolume: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.string(), z.string()).optional(),
    locationId: z.string().uuid().nullable().optional(),
});

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;

export const UpdateDocumentSchema = z.object({
    docType: z.string().min(1, "Document type is required").optional(),
    yearPeriod: z.string().optional(),
    pagesVolume: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.string(), z.string()).optional(),
    locationId: z.string().uuid().nullable().optional(),
    status: z.enum(["in_office", "checked_out", "missing", "returned_to_client"]).optional(),
});

export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
