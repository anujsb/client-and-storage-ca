import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

export default function NewEmployeePage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Add Employee"
        description="Add a new staff member for document assignment and checkout tracking."
      />
      <div className="bg-white p-8 rounded-[24px] border border-border-base shadow-soft">
        <EmployeeForm />
      </div>
    </div>
  );
}
