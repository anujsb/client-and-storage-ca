import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantId } from "@/lib/auth/helpers";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ locationId: string }> }
) {
    try {
        const tenantId = await getTenantId();
        const { locationId } = await params;

        // Note: For Phase 4/5, documents are directly linked to a specific locationId.
        // Nested lookup (getting documents for child locations too) would require a recursive query
        // or passing an array of IDs. For now, we'll fetch documents exactly at this locationId.
        const locationDocs = await db
            .select({
                id: documents.id,
                docCode: documents.docCode,
                name: documents.description,
                clientName: clients.name,
                status: documents.status,
            })
            .from(documents)
            .innerJoin(clients, eq(documents.clientId, clients.id))
            .where(
                and(
                    eq(documents.tenantId, tenantId),
                    eq(documents.locationId, locationId)
                )
            )
            .orderBy(documents.createdAt);

        // Format for the UI
        const formattedDocs = locationDocs.map(doc => ({
            ...doc,
            exactPath: "Unknown Path", // We don't construct the full path yet since we'd need recursive parents
        }));

        return NextResponse.json(formattedDocs);
    } catch (error) {
        console.error("[LOCATION_DOCUMENTS_GET]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
