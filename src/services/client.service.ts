import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { CreateClientInput, UpdateClientInput, Client } from "@/types/client";

async function generateClientCode(tenantId: string): Promise<string> {
  const latestClient = await db.query.clients.findFirst({
    where: eq(clients.tenantId, tenantId),
    orderBy: [desc(clients.clientCode)],
  });

  if (!latestClient) {
    return "C-0001";
  }

  // Extract the number from "C-XXXX"
  const parts = latestClient.clientCode.split("-");
  const currentNumber = parseInt(parts[1] || "0", 10);
  const nextNumber = currentNumber + 1;
  return `C-${nextNumber.toString().padStart(4, "0")}`;
}

export const ClientService = {
  async getClients(tenantId: string): Promise<any[]> {
    return await db.query.clients.findMany({
      where: eq(clients.tenantId, tenantId),
      orderBy: [desc(clients.createdAt)],
      with: {
        filingSubscriptions: {
          where: (subs: any, { eq }: any) => eq(subs.isActive, true),
          with: { filingType: true },
        },
      },
    });
  },

  async getClientById(tenantId: string, clientId: string): Promise<Client | undefined> {
    return await db.query.clients.findFirst({
      where: and(eq(clients.tenantId, tenantId), eq(clients.id, clientId)),
    });
  },

  async createClient(tenantId: string, data: CreateClientInput): Promise<Client> {
    const clientCode = await generateClientCode(tenantId);
    
    const [newClient] = await db.insert(clients).values({
      tenantId,
      clientCode,
      ...data,
    }).returning();
    
    return newClient;
  },

  async updateClient(tenantId: string, clientId: string, data: UpdateClientInput): Promise<Client> {
    const [updatedClient] = await db.update(clients)
      .set(data)
      .where(and(eq(clients.tenantId, tenantId), eq(clients.id, clientId)))
      .returning();
      
    if (!updatedClient) {
      throw new Error("Client not found or access denied");
    }
    
    return updatedClient;
  },

  async deleteClient(tenantId: string, clientId: string): Promise<void> {
    await db.delete(clients).where(and(eq(clients.tenantId, tenantId), eq(clients.id, clientId)));
  }
};
