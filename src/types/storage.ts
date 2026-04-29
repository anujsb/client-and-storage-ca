export interface StorageLocation {
    id: string;
    tenantId: string;
    parentId: string | null;
    name: string;
    levelLabel: string | null;
    sortOrder: number;
    createdAt: string; // ISO string
}

export interface StorageTreeNode extends StorageLocation {
    children: StorageTreeNode[];
}
