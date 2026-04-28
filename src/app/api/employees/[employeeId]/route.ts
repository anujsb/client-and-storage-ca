import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { EmployeeService } from "@/services/employee.service";
import { updateEmployeeSchema } from "@/lib/validations/employee";

interface Params {
  params: Promise<{ employeeId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getTenantId();
    const { employeeId } = await params;
    const employee = await EmployeeService.getEmployeeById(tenantId, employeeId);
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getTenantId();
    const { employeeId } = await params;
    const body = await req.json();

    const parsed = updateEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await EmployeeService.updateEmployee(tenantId, employeeId, parsed.data);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getTenantId();
    const { employeeId } = await params;
    const deleted = await EmployeeService.deleteEmployee(tenantId, employeeId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
