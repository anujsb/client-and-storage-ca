import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { mapFieldsWithGroq } from "@/lib/import/groq-mapper";

// Set max duration for Vercel/Serverless to avoid timeouts on Groq calls
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const tenantId = await getTenantId();
    const body = await req.json();

    const { headers, sampleRows } = body;

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return NextResponse.json(
        { error: "Headers are required for analysis" },
        { status: 400 }
      );
    }

    if (!sampleRows || !Array.isArray(sampleRows)) {
      return NextResponse.json(
        { error: "Sample rows are required for analysis" },
        { status: 400 }
      );
    }

    // Call Groq to perform AI mapping
    const mapping = await mapFieldsWithGroq(headers, sampleRows);

    return NextResponse.json({ mapping });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[IMPORT_ANALYZE_POST]", error);
    return NextResponse.json(
      { error: "Failed to analyze mapping. Please map manually." },
      { status: 500 }
    );
  }
}
