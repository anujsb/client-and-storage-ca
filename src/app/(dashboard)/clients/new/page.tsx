import { PageHeader } from "@/components/layout/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Add New Client" 
        description="Enter the details of the new client to add them to your firm."
      />
      
      <div className="bg-white p-8 rounded-[24px] border border-border-base shadow-soft">
        <ClientForm />
      </div>
    </div>
  );
}
