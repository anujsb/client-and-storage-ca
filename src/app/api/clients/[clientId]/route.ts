import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { ClientService } from "@/services/client.service";
import { updateClientSchema } from "@/lib/validations/client";

interface RouteParams {
  params: Promise<{
    clientId: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const tenantId = await getTenantId();
    const { clientId } = await params;
    
    const client = await ClientService.getClientById(tenantId, clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    
    return NextResponse.json(client);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[CLIENT_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const tenantId = await getTenantId();
    const { clientId } = await params;
    const body = await req.json();
    
    const validatedData = updateClientSchema.parse(body);
    const client = await ClientService.updateClient(tenantId, clientId, validatedData);
    
    return NextResponse.json(client);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    if (error.message === "Client not found or access denied") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    console.error("[CLIENT_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const tenantId = await getTenantId();
    const { clientId } = await params;
    
    await ClientService.deleteClient(tenantId, clientId);
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[CLIENT_DELETE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
