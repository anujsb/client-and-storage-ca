import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { SearchBar } from "@/components/shared/SearchBar";
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
    <div className="space-y-8">
      <PageHeader
        title="Employees"
        description="Named staff members used for document assignment and checkout tracking."
        action={
          <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 h-11 shadow-sm">
            <Link href="/employees/new">
              <Plus className="w-4 h-4 mr-2" />
              Add New Employee
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar placeholder="Search by name, email or status..." />
        <div className="flex items-center gap-2">
          <p className="text-[13px] text-text-muted font-medium mr-2">
            Showing <span className="text-text-dark font-bold">{data.length}</span> staff members
          </p>
        </div>
      </div>

      <EmployeeTable employees={data} />
    </div>
  );
}

