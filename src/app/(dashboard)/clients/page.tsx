import { PageHeader } from "@/components/layout/PageHeader";
import { ClientTable } from "@/components/clients/ClientTable";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ClientService } from "@/services/client.service";
import { getTenantId } from "@/lib/auth/helpers";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const tenantId = await getTenantId();
  const clients = await ClientService.getClients(tenantId);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Clients" 
        description="Manage your firm's clients and their basic information."
        action={
          <Link href="/clients/new">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 h-11 shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Add New Client
            </Button>
          </Link>
        }
      />


      <ClientTable clients={clients} />
    </div>
  );
}

