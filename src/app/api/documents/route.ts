import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { DocumentService } from "@/services/document.service";
import { CreateDocumentSchema } from "@/lib/validations/document";
import { z } from "zod";

const documentService = new DocumentService();

export async function GET(request: NextRequest) {
    try {
        const tenantId = await getTenantId();
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId") || undefined;

        const documents = await documentService.list(tenantId, clientId);
        return NextResponse.json(documents);
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[DOCUMENTS_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const tenantId = await getTenantId();
        const body = await request.json();
        
        const data = (CreateDocumentSchema as any).parse(body);
        const document = await documentService.create(tenantId, data);
        
        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[DOCUMENTS_POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
