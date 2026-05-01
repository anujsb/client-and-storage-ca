import { db } from "@/lib/db";
import { clients, storageLocations } from "@/lib/db/schema";
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
        defaultLocation: true,
      },
    });
  },

  async getClientById(tenantId: string, clientId: string): Promise<any | undefined> {
    return await db.query.clients.findFirst({
      where: and(eq(clients.tenantId, tenantId), eq(clients.id, clientId)),
      with: {
        defaultLocation: true,
        filingSubscriptions: {
          where: (subs: any, { eq }: any) => eq(subs.isActive, true),
          with: { filingType: true },
        },
      },
    });
  },

  async createClient(tenantId: string, data: CreateClientInput): Promise<Client> {
    const clientCode = await generateClientCode(tenantId);
    
    const { parentLocationId, ...clientData } = data;
    let defaultLocationId = null;

    if (parentLocationId) {
      const siblings = await db.query.storageLocations.findMany({
        where: and(
          eq(storageLocations.tenantId, tenantId),
          eq(storageLocations.parentId, parentLocationId)
        ),
      });
      const nextSortOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.sortOrder)) + 1 : 0;
      const sequenceNumber = siblings.length + 1;

      const [newLocation] = await db.insert(storageLocations).values({
        tenantId,
        parentId: parentLocationId,
        name: `${sequenceNumber} - ${data.name}`,
        levelLabel: "Folder",
        sortOrder: nextSortOrder,
      }).returning();
      
      defaultLocationId = newLocation.id;
    }
    
    const [newClient] = await db.insert(clients).values({
      tenantId,
      clientCode,
      defaultLocationId,
      ...clientData,
    }).returning();
    
    return newClient;
  },

  async updateClient(tenantId: string, clientId: string, data: UpdateClientInput): Promise<Client> {
    const { parentLocationId, ...updateData } = data;
    
    // If parentLocationId is provided, the user wants to generate a new folder
    if (parentLocationId) {
      const existingClient = await this.getClientById(tenantId, clientId);
      if (existingClient && !existingClient.defaultLocationId) {
        const siblings = await db.query.storageLocations.findMany({
          where: and(
            eq(storageLocations.tenantId, tenantId),
            eq(storageLocations.parentId, parentLocationId)
          ),
        });
        const nextSortOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.sortOrder)) + 1 : 0;
        const sequenceNumber = siblings.length + 1;

        const [newLocation] = await db.insert(storageLocations).values({
          tenantId,
          parentId: parentLocationId,
          name: `${sequenceNumber} - ${updateData.name || existingClient.name}`,
          levelLabel: "Folder",
          sortOrder: nextSortOrder,
        }).returning();
        
        (updateData as any).defaultLocationId = newLocation.id;
      }
    }

    const [updatedClient] = await db.update(clients)
      .set(updateData)
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
