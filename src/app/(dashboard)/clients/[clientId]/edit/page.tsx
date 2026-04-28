import { PageHeader } from "@/components/layout/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientService } from "@/services/client.service";
import { getTenantId } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditClientPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const tenantId = await getTenantId();
  const { clientId } = await params;
  
  const client = await ClientService.getClientById(tenantId, clientId);
  
  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Edit Client" 
        description={`Updating information for ${client.name} (${client.clientCode})`}
      />
      
      <div className="bg-white p-8 rounded-[24px] border border-border-base shadow-soft">
        <ClientForm initialData={client} />
      </div>
    </div>
  );
}
