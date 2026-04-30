import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentsClient } from "./PaymentsClient";

export const metadata = {
    title: "Payments & Invoices | CA FileTrack",
};

export default function PaymentsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <PageHeader
                title="Payments & Invoices"
                description="Track client payments, outstanding balances, and overdue invoices."
            />
            <PaymentsClient />
        </div>
    );
}
