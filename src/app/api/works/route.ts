import { NextRequest, NextResponse } from "next/server";
import { getTenantId, getUser } from "@/lib/auth/helpers";
import { WorkService } from "@/services/work.service";
import { CreateWorkSchema } from "@/lib/validations/work";
import { z } from "zod";

const workService = new WorkService();

export async function GET() {
    try {
        const tenantId = await getTenantId();
        const works = await workService.list(tenantId);
        return NextResponse.json(works);
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[WORKS_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || !user.tenantId) throw new Error("Unauthorized");
        
        const body = await request.json();
        const data = CreateWorkSchema.parse(body);
        
        const work = await workService.create(user.tenantId, data, user.id, user.name);
        return NextResponse.json(work, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[WORKS_POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
