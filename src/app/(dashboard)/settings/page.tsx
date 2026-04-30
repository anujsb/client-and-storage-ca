import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsClient } from "./SettingsClient";
import { getTenantSettings } from "./actions";

export const metadata = {
    title: "Settings | CA FileTrack",
};

export default async function SettingsPage() {
    const { data: tenant } = await getTenantSettings();

    if (!tenant) {
        return <div>Error loading settings</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <PageHeader
                title="Firm Settings"
                description="Manage your CA firm profile, documents, and application preferences."
            />
            <SettingsClient 
                initialFirmProfile={{
                    name: tenant.name || "",
                    gstin: tenant.gstin || "",
                    email: tenant.email || "",
                    phone: tenant.phone || "",
                    address: tenant.address || "",
                }}
                initialPreferences={{
                    emailAlerts: tenant.preferences?.emailAlerts ?? true,
                    overdueAlerts: tenant.preferences?.overdueAlerts ?? true,
                    paymentAlerts: tenant.preferences?.paymentAlerts ?? false,
                    defaultTaskView: tenant.preferences?.defaultTaskView ?? "kanban",
                }}
            />
        </div>
    );
}
