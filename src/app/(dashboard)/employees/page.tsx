import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { getTenantId } from "@/lib/auth/helpers";
import { EmployeeService } from "@/services/employee.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const tenantId = await getTenantId();
  const [employees, checkoutCounts] = await Promise.all([
    EmployeeService.listEmployees(tenantId),
    EmployeeService.getActiveCheckoutCounts(tenantId),
  ]);

  const data = employees.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    activeCheckouts: checkoutCounts[e.id] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Named staff members used for document assignment and checkout tracking."
        action={
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href="/employees/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Link>
          </Button>
        }
      />
      <EmployeeTable employees={data} />
    </div>
  );
}
