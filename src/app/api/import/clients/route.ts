import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { importClients } from "@/lib/import/client-importer";

// Serverless time limit configuration (max 5 minutes for large bulk imports)
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const tenantId = await getTenantId();
    const body = await req.json();

    const { mapping, rows, parentLocationId, duplicateResolutions } = body;

    if (!mapping || !rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Mapping and rows are required for import" },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No rows provided for import" },
        { status: 400 }
      );
    }

    // Pass everything to the importer service
    const summary = await importClients({
      tenantId,
      mapping,
      rows,
      parentLocationId,
      duplicateResolutions,
    });

    return NextResponse.json(summary);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[IMPORT_CLIENTS_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error during import" },
      { status: 500 }
    );
  }
}
