import { db } from "@/lib/db";
import { storageLocations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { CreateStorageNodeInput, UpdateStorageNodeInput } from "@/lib/validations/storage";
import { StorageLocation, StorageTreeNode } from "@/types/storage";

export class StorageService {
    /**
     * Builds a hierarchical tree from a flat list of storage locations.
     */
    private static buildTree(locations: StorageLocation[], parentId: string | null = null): StorageTreeNode[] {
        return locations
            .filter(loc => loc.parentId === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(loc => ({
                ...loc,
                children: this.buildTree(locations, loc.id)
            }));
    }

    static async getTree(tenantId: string): Promise<StorageTreeNode[]> {
        const locations = await db.query.storageLocations.findMany({
            where: eq(storageLocations.tenantId, tenantId),
            orderBy: (locations, { asc }) => [asc(locations.sortOrder)],
        });

        // Convert the Date to ISO string to match our StorageLocation type
        const formattedLocations: StorageLocation[] = locations.map(loc => ({
            ...loc,
            createdAt: loc.createdAt.toISOString()
        }));

        return this.buildTree(formattedLocations);
    }

    static async addNode(tenantId: string, input: CreateStorageNodeInput): Promise<StorageLocation> {
        // Get the current max sortOrder for siblings
        const siblings = await db.query.storageLocations.findMany({
            where: and(
                eq(storageLocations.tenantId, tenantId),
                input.parentId 
                    ? eq(storageLocations.parentId, input.parentId)
                    : eq(storageLocations.parentId, null as any) // Need to handle null appropriately if Drizzle complains, actually we might need to use isNull
            ),
        });
        
        // Let's do a simpler approach: just get all nodes and find the max sort order
        const allLocations = await db.query.storageLocations.findMany({
            where: eq(storageLocations.tenantId, tenantId),
        });
        
        const siblingSortOrders = allLocations
            .filter(loc => loc.parentId === (input.parentId || null))
            .map(loc => loc.sortOrder);
            
        const nextSortOrder = siblingSortOrders.length > 0 ? Math.max(...siblingSortOrders) + 1 : 0;

        const [newNode] = await db
            .insert(storageLocations)
            .values({
                tenantId,
                parentId: input.parentId || null,
                name: input.name,
                levelLabel: input.levelLabel || null,
                sortOrder: nextSortOrder,
            })
            .returning();

        return {
            ...newNode,
            createdAt: newNode.createdAt.toISOString()
        };
    }

    static async updateNode(
        tenantId: string, 
        locationId: string, 
        input: UpdateStorageNodeInput
    ): Promise<StorageLocation> {
        // Ensure the node belongs to the tenant
        const existingNode = await db.query.storageLocations.findFirst({
            where: and(
                eq(storageLocations.id, locationId),
                eq(storageLocations.tenantId, tenantId)
            )
        });

        if (!existingNode) {
            throw new Error("Storage location not found");
        }

        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.levelLabel !== undefined) updateData.levelLabel = input.levelLabel;

        const [updatedNode] = await db
            .update(storageLocations)
            .set(updateData)
            .where(eq(storageLocations.id, locationId))
            .returning();

        return {
            ...updatedNode,
            createdAt: updatedNode.createdAt.toISOString()
        };
    }

    static async deleteNode(tenantId: string, locationId: string): Promise<void> {
        // Ensure the node belongs to the tenant
        const existingNode = await db.query.storageLocations.findFirst({
            where: and(
                eq(storageLocations.id, locationId),
                eq(storageLocations.tenantId, tenantId)
            )
        });

        if (!existingNode) {
            throw new Error("Storage location not found");
        }

        // Database has ON DELETE CASCADE for children, so deleting this node will delete all its children
        // Also ON DELETE SET NULL for documents, so documents will lose their location instead of being deleted.
        await db
            .delete(storageLocations)
            .where(eq(storageLocations.id, locationId));
    }
}
