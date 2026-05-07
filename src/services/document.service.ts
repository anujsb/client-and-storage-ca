import { db } from "@/lib/db";
import { documents, clients, storageLocations, fileCheckouts, employees } from "@/lib/db/schema";
import { eq, and, desc, count, isNull } from "drizzle-orm";
import { CreateDocumentInput, UpdateDocumentInput } from "@/lib/validations/document";

export class DocumentService {
    async list(tenantId: string, clientId?: string) {
        const conditions = [eq(documents.tenantId, tenantId)];
        if (clientId) {
            conditions.push(eq(documents.clientId, clientId));
        }

        return await db
            .select({
                id: documents.id,
                tenantId: documents.tenantId,
                clientId: documents.clientId,
                docCode: documents.docCode,
                docType: documents.docType,
                yearPeriod: documents.yearPeriod,
                pagesVolume: documents.pagesVolume,
                description: documents.description,
                tags: documents.tags,
                customFields: documents.customFields,
                status: documents.status,
                locationId: documents.locationId,
                createdAt: documents.createdAt,
                client: {
                    id: clients.id,
                    name: clients.name,
                    clientCode: clients.clientCode,
                },
                location: {
                    id: storageLocations.id,
                    name: storageLocations.name,
                },
                activeCheckout: {
                    id: fileCheckouts.id,
                    employeeId: employees.id,
                    employeeName: employees.name,
                    checkedOutAt: fileCheckouts.checkedOutAt,
                }
            })
            .from(documents)
            .innerJoin(clients, eq(documents.clientId, clients.id))
            .leftJoin(storageLocations, eq(documents.locationId, storageLocations.id))
            .leftJoin(fileCheckouts, and(
                eq(fileCheckouts.documentId, documents.id),
                isNull(fileCheckouts.checkedInAt)
            ))
            .leftJoin(employees, eq(fileCheckouts.employeeId, employees.id))
            .where(and(...conditions))
            .orderBy(desc(documents.createdAt));
    }

    async getById(id: string, tenantId: string) {
        const [doc] = await db
            .select({
                id: documents.id,
                tenantId: documents.tenantId,
                clientId: documents.clientId,
                docCode: documents.docCode,
                docType: documents.docType,
                yearPeriod: documents.yearPeriod,
                pagesVolume: documents.pagesVolume,
                description: documents.description,
                tags: documents.tags,
                customFields: documents.customFields,
                status: documents.status,
                locationId: documents.locationId,
                createdAt: documents.createdAt,
                client: {
                    id: clients.id,
                    name: clients.name,
                    clientCode: clients.clientCode,
                },
                location: {
                    id: storageLocations.id,
                    name: storageLocations.name,
                },
                activeCheckout: {
                    id: fileCheckouts.id,
                    employeeId: employees.id,
                    employeeName: employees.name,
                    checkedOutAt: fileCheckouts.checkedOutAt,
                }
            })
            .from(documents)
            .innerJoin(clients, eq(documents.clientId, clients.id))
            .leftJoin(storageLocations, eq(documents.locationId, storageLocations.id))
            .leftJoin(fileCheckouts, and(
                eq(fileCheckouts.documentId, documents.id),
                isNull(fileCheckouts.checkedInAt)
            ))
            .leftJoin(employees, eq(fileCheckouts.employeeId, employees.id))
            .where(and(eq(documents.id, id), eq(documents.tenantId, tenantId)))
            .limit(1);

        return doc || null;
    }

    async create(tenantId: string, input: CreateDocumentInput) {
        // 1. Get client to get clientCode
        const [client] = await db
            .select({ clientCode: clients.clientCode })
            .from(clients)
            .where(and(eq(clients.id, input.clientId), eq(clients.tenantId, tenantId)))
            .limit(1);

        if (!client) {
            throw new Error("Client not found");
        }

        // 2. Count existing documents for this client
        const [docCount] = await db
            .select({ value: count() })
            .from(documents)
            .where(and(eq(documents.clientId, input.clientId), eq(documents.tenantId, tenantId)));

        const nextNumber = (docCount.value || 0) + 1;
        const docCode = `${client.clientCode}-D-${String(nextNumber).padStart(2, "0")}`;

        // 3. Insert new document
        const [newDoc] = await db
            .insert(documents)
            .values({
                tenantId,
                clientId: input.clientId,
                docCode,
                docType: input.docType,
                yearPeriod: input.yearPeriod,
                pagesVolume: input.pagesVolume,
                description: input.description,
                tags: input.tags,
                customFields: input.customFields,
                locationId: input.locationId,
                ...(input.createdAt ? { createdAt: new Date(input.createdAt) } : {}),
            })
            .returning();

        return newDoc;
    }

    async update(id: string, tenantId: string, input: UpdateDocumentInput) {
        const updateData: any = { ...input };
        if (input.createdAt) {
            updateData.createdAt = new Date(input.createdAt);
        }
        
        const [updatedDoc] = await db
            .update(documents)
            .set(updateData)
            .where(and(eq(documents.id, id), eq(documents.tenantId, tenantId)))
            .returning();

        return updatedDoc || null;
    }

    async delete(id: string, tenantId: string) {
        const [deletedDoc] = await db
            .delete(documents)
            .where(and(eq(documents.id, id), eq(documents.tenantId, tenantId)))
            .returning();

        return deletedDoc || null;
    }
}
