import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentDetailClient } from "./DocumentDetailClient";

export const metadata = {
    title: "Document Details | CA FileTrack",
};

export default async function DocumentPage({ params }: { params: Promise<{ documentId: string }> }) {
    const { documentId } = await params;
    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <DocumentDetailClient documentId={documentId} />
        </div>
    );
}
