import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { fileCheckouts, documents, employees } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const tenantId = await getTenantId();
        const { searchParams } = new URL(request.url);
        const filterDocumentId = searchParams.get("documentId");
        
        const checkouts = await db
            .select({
                id: fileCheckouts.id,
                documentId: fileCheckouts.documentId,
                checkedOutAt: fileCheckouts.checkedOutAt,
                checkedInAt: fileCheckouts.checkedInAt,
                document: {
                    docCode: documents.docCode,
                    description: documents.description,
                    docType: documents.docType,
                },
                employee: {
                    name: employees.name,
                }
            })
            .from(fileCheckouts)
            .innerJoin(documents, eq(fileCheckouts.documentId, documents.id))
            .innerJoin(employees, eq(fileCheckouts.employeeId, employees.id))
            .where(eq(fileCheckouts.tenantId, tenantId))
            .orderBy(desc(fileCheckouts.checkedOutAt))
            .limit(filterDocumentId ? 50 : 20);

        const events: any[] = [];
        
        checkouts.forEach(record => {
            // Skip if filtering by a specific document and it doesn't match
            if (filterDocumentId && record.documentId !== filterDocumentId) return;

            events.push({
                id: `${record.id}-out`,
                type: 'checked_out',
                timestamp: record.checkedOutAt,
                documentId: record.documentId,
                docCode: record.document.docCode,
                description: record.document.description || record.document.docType,
                employeeName: record.employee.name,
            });
            
            if (record.checkedInAt) {
                events.push({
                    id: `${record.id}-in`,
                    type: 'checked_in',
                    timestamp: record.checkedInAt,
                    documentId: record.documentId,
                    docCode: record.document.docCode,
                    description: record.document.description || record.document.docType,
                    employeeName: record.employee.name,
                });
            }
        });
        
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return NextResponse.json(filterDocumentId ? events : events.slice(0, 10));
    } catch (error) {
        console.error("[TRACKING_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
