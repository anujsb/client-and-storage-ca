import { NextRequest, NextResponse } from "next/server";
import { getTenantId, getSession } from "@/lib/auth/helpers";
import { WorkService } from "@/services/work.service";
import { NotificationService } from "@/services/notification.service";
import { UpdateWorkSchema, AddSubTaskSchema, UpdateSubTaskSchema, AddCommentSchema, LogTimeSchema } from "@/lib/validations/work";
import { z } from "zod";

const workService = new WorkService();
const notificationService = new NotificationService();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ workId: string }> }
) {
    try {
        const tenantId = await getTenantId();
        const { workId } = await params;
        
        const work = await workService.getById(workId, tenantId);
        if (!work) return NextResponse.json({ error: "Not found" }, { status: 404 });
        
        return NextResponse.json(work);
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[WORK_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ workId: string }> }
) {
    try {
        const session = await getSession();
        const user = session?.user as any;
        if (!user || !user.tenantId) throw new Error("Unauthorized");
        const { workId } = await params;
        
        const body = await request.json();
        
        // Use an "action" field to determine the operation, defaulting to update
        const action = body.action || "update";
        
        let result;
        
        switch (action) {
            case "add_subtask":
                const subTaskData = AddSubTaskSchema.parse(body.payload);
                result = await workService.addSubTask(workId, user.tenantId, subTaskData);
                break;
            case "update_subtask":
                const updateSubTaskData = UpdateSubTaskSchema.parse(body.payload);
                result = await workService.updateSubTask(workId, user.tenantId, updateSubTaskData);
                break;
            case "add_comment":
                const commentData = AddCommentSchema.parse(body.payload);
                result = await workService.addComment(workId, user.tenantId, commentData, user.id, user.name);
                break;
            case "log_time":
                const timeData = LogTimeSchema.parse(body.payload);
                result = await workService.logTime(workId, user.tenantId, timeData);
                break;
            case "update":
            default:
                const updateData = UpdateWorkSchema.parse(body.payload || body);
                result = await workService.update(workId, user.tenantId, updateData, user.id, user.name);

                if (updateData.status) {
                    await notificationService.create(user.tenantId, {
                        message: `Task status updated to ${updateData.status.toUpperCase()}`,
                        type: "work_status_changed"
                    });
                }
                break;
        }
        
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[WORK_PATCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
