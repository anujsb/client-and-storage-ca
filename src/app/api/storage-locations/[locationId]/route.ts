import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { StorageService } from "@/services/storage.service";
import { updateStorageNodeSchema } from "@/lib/validations/storage";

interface RouteParams {
    params: Promise<{
        locationId: string;
    }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
    try {
        const tenantId = await getTenantId();
        const { locationId } = await params;
        const body = await req.json();

        const validatedData = updateStorageNodeSchema.parse(body);
        const updatedNode = await StorageService.updateNode(tenantId, locationId, validatedData);

        return NextResponse.json(updatedNode);
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "Storage location not found") {
            return NextResponse.json({ error: "Storage location not found" }, { status: 404 });
        }
        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: RouteParams) {
    try {
        const tenantId = await getTenantId();
        const { locationId } = await params;

        await StorageService.deleteNode(tenantId, locationId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "Storage location not found") {
            return NextResponse.json({ error: "Storage location not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
