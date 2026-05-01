import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { ClientService } from "@/services/client.service";
import { clientSchema } from "@/lib/validations/client";

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const clients = await ClientService.getClients(tenantId);
    return NextResponse.json(clients);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[CLIENTS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const tenantId = await getTenantId();
    const body = await req.json();
    
    const validatedData = clientSchema.parse(body);
    const client = await ClientService.createClient(tenantId, validatedData);
    
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    console.error("[CLIENTS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
