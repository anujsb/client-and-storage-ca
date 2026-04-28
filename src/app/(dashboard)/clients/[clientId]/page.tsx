import { PageHeader } from "@/components/layout/PageHeader";
import { ClientService } from "@/services/client.service";
import { getTenantId } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ClientPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const tenantId = await getTenantId();
  const { clientId } = await params;
  
  const client = await ClientService.getClientById(tenantId, clientId);
  
  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={client.name} 
        description={`${client.clientCode} | PAN: ${client.pan}`}
        action={
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit Client
            </Button>
          </Link>
        }
      />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="works">Works</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
              <CardDescription>Basic information and contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-slate-900">{client.phone || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Email Address</dt>
                  <dd className="mt-1 text-sm text-slate-900">{client.email || "Not provided"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Address</dt>
                  <dd className="mt-1 text-sm text-slate-900">{client.address || "Not provided"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Notes</dt>
                  <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{client.notes || "No notes"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Documents associated with this client</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Document tracking will be implemented in Phase 5.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="works">
          <Card>
            <CardHeader>
              <CardTitle>Works</CardTitle>
              <CardDescription>Active and completed works for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Work tracking will be implemented in Phase 7.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>Payment history and dues</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Payment tracking will be implemented in Phase 8.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
