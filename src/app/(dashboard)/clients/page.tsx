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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar placeholder="Search by name, PAN or client code..." />
        <div className="flex items-center gap-2">
          <p className="text-[13px] text-text-muted font-medium mr-2">
            Showing <span className="text-text-dark font-bold">{clients.length}</span> clients
          </p>
        </div>
      </div>
      
      <ClientTable clients={clients} />
    </div>
  );
}

