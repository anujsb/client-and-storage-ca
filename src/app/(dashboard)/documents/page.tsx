import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentsClient } from "./DocumentsClient";

export const metadata = {
    title: "Document Registry | CA FileTrack",
};

export default function DocumentsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageHeader 
                title="Central Document Registry" 
                description="Manage, track, and locate physical and digital firm documents." 
            />
            
            <DocumentsClient />
        </div>
    );
}
