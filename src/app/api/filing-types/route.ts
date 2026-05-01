import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { FilingService } from "@/services/filing.service";
import { db } from "@/lib/db";
import { filingTypes } from "@/lib/db/schema";
import { or, eq, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const tenantId = await getTenantId();
        // Return system defaults + tenant custom types
        const types = await db.query.filingTypes.findMany({
            where: or(isNull(filingTypes.tenantId), eq(filingTypes.tenantId, tenantId)),
            orderBy: (t, { asc }) => [asc(t.category), asc(t.code)],
        });
        return NextResponse.json(types);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
