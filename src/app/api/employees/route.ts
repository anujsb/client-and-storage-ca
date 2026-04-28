import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth/helpers";
import { EmployeeService } from "@/services/employee.service";
import { createEmployeeSchema } from "@/lib/validations/employee";

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const employees = await EmployeeService.listEmployees(tenantId);
    const checkoutCounts = await EmployeeService.getActiveCheckoutCounts(tenantId);

    const data = employees.map((e) => ({
      ...e,
      activeCheckouts: checkoutCounts[e.id] ?? 0,
    }));

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const body = await req.json();

    const parsed = createEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const employee = await EmployeeService.createEmployee(tenantId, parsed.data);
    return NextResponse.json(employee, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
