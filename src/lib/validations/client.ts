import { z } from "zod";

// Reusable PAN format validation
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  pan: z.string().toUpperCase().regex(panRegex, "Invalid PAN format"),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateClientSchema = clientSchema.partial();

export type CreateClientInput = z.infer<typeof clientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
