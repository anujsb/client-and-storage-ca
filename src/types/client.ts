import { CreateClientInput, UpdateClientInput } from "@/lib/validations/client";

export interface Client {
  id: string;
  tenantId: string;
  clientCode: string;
  pan: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: Date;
}

export type { CreateClientInput, UpdateClientInput };
