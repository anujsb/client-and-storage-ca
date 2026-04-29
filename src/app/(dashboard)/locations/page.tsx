import { PageHeader } from "@/components/layout/PageHeader";
import { StorageTree } from "@/components/storage/StorageTree";
import { Database } from "lucide-react";

export const metadata = {
    title: "Storage Locations | CA FileTrack",
};

export default function StorageLocationsPage() {
    return (
        <div className="space-y-6">
            <PageHeader 
                title="Storage Locations" 
                description="Manage the physical storage hierarchy of your firm (e.g. Cupboards, Shelves, Boxes)."
            />

            <div className="max-w-4xl">
                <StorageTree />
            </div>
        </div>
    );
}
