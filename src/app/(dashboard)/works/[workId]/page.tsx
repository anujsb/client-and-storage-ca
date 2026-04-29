import { WorkDetailClient } from "./WorkDetailClient";

export const metadata = {
    title: "Task Detail | CA FileTrack",
};

export default async function WorkDetailPage({ params }: { params: Promise<{ workId: string }> }) {
    const { workId } = await params;
    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <WorkDetailClient workId={workId} />
        </div>
    );
}
