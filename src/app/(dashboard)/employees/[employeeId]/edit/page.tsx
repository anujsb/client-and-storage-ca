import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { EmployeeService } from "@/services/employee.service";
import { getTenantId } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditEmployeePageProps {
  params: Promise<{ employeeId: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const tenantId = await getTenantId();
  const { employeeId } = await params;

  const employee = await EmployeeService.getEmployeeById(tenantId, employeeId);
  if (!employee) notFound();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Edit Employee"
        description={`Updating information for ${employee.name}`}
      />
      <div className="bg-white p-8 rounded-[24px] border border-border-base shadow-soft">
        <EmployeeForm initialData={employee} />
      </div>
    </div>
  );
}
