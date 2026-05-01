import { PageHeader } from "@/components/layout/PageHeader";
import { WorksBoardClient } from "./WorksBoardClient";
import { UpcomingFilingsPanel } from "@/components/filings/UpcomingFilingsPanel";

export const metadata = {
    title: "Work/Task Board | CA FileTrack",
};

export default function WorksPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <PageHeader
                title="Work/Task Board"
                description="Manage client deliverables and internal tasks."
            />
            <UpcomingFilingsPanel />
            <WorksBoardClient />
        </div>
    );
}
