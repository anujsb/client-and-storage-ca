export type DocumentStatus = "in_office" | "checked_out" | "missing" | "returned_to_client";

export interface Document {
    id: string;
    tenantId: string;
    clientId: string;
    docCode: string;
    docType: string;
    yearPeriod: string | null;
    pagesVolume: string | null;
    description: string | null;
    tags: string[] | null;
    customFields: Record<string, string> | null;
    status: DocumentStatus;
    locationId: string | null;
    createdAt: Date;
}

export interface DocumentWithDetails extends Document {
    client: {
        id: string;
        name: string;
        clientCode: string;
    };
    location?: {
        id: string;
        name: string;
    } | null;
}
