import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { DocumentService } from "@/services/document.service";
import { UpdateDocumentSchema } from "@/lib/validations/document";
import { z } from "zod";

const documentService = new DocumentService();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
) {
    try {
        const tenantId = await getTenantId();
        const { documentId } = await params;
        
        const document = await documentService.getById(documentId, tenantId);
        
        if (!document) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        
        return NextResponse.json(document);
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[DOCUMENT_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
) {
    try {
        const tenantId = await getTenantId();
        const { documentId } = await params;
        const body = await request.json();
        
        const data = UpdateDocumentSchema.parse(body);
        const document = await documentService.update(documentId, tenantId, data);
        
        if (!document) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        
        return NextResponse.json(document);
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[DOCUMENT_PATCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
) {
    try {
        const tenantId = await getTenantId();
        const { documentId } = await params;
        
        const document = await documentService.delete(documentId, tenantId);
        
        if (!document) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[DOCUMENT_DELETE]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
