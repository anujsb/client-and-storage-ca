import { ClientDetailDashboard } from "./ClientDetailDashboard";

export const metadata = {
    title: "Client Details | CA FileTrack",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    return (
        <div className="max-w-[1400px] mx-auto pb-12">
            <ClientDetailDashboard clientId={clientId} />
        </div>
    );
}
