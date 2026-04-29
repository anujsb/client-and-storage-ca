import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { StorageService } from "@/services/storage.service";
import { createStorageNodeSchema } from "@/lib/validations/storage";

export async function GET() {
    try {
        const tenantId = await getTenantId();
        const tree = await StorageService.getTree(tenantId);
        return NextResponse.json(tree);
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const tenantId = await getTenantId();
        const body = await req.json();

        const validatedData = createStorageNodeSchema.parse(body);
        const newNode = await StorageService.addNode(tenantId, validatedData);

        return NextResponse.json(newNode, { status: 201 });
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
