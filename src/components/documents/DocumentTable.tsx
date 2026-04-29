import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface ActiveCheckout {
    id: string;
    employeeId: string;
    employeeName: string;
    checkedOutAt: Date;
}

interface DocumentData {
    id: string;
    docCode: string;
    docType: string;
    description: string | null;
    status: string;
    client: {
        name: string;
    };
    location: {
        name: string;
    } | null;
    activeCheckout: ActiveCheckout | null;
}

interface DocumentTableProps {
    documents: DocumentData[];
}

export function DocumentTable({ documents }: DocumentTableProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const router = useRouter();

    return (
        <div className="w-full">
            <table className="w-full text-left text-[13px]">
                <thead className="bg-bg-main text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <tr>
                        <th className="px-5 py-3">Document Code / Name</th>
                        <th className="px-5 py-3">Client</th>
                        <th className="px-5 py-3">Doc Type</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Current Holder / Location</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                    {documents.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                                No documents found.
                            </td>
                        </tr>
                    ) : (
                        documents.map((doc) => (
                            <tr 
                                key={doc.id} 
                                onClick={() => router.push(`/documents/${doc.id}`)}
                                className="hover:bg-brand-50/50 transition-colors cursor-pointer"
                            >
                                <td className="px-5 py-3.5 align-top">
                                    <div className="text-brand-600 font-semibold text-[13px]">{doc.docCode}</div>
                                    <div className="text-brand-900 font-bold mt-0.5">{doc.description || doc.docType}</div>
                                </td>
                                <td className="px-5 py-3.5 align-top text-text-dark">{doc.client.name}</td>
                                <td className="px-5 py-3.5 align-top text-text-dark">{doc.docType}</td>
                                <td className="px-5 py-3.5 align-top">
                                    <DocumentStatusBadge status={doc.status} />
                                </td>
                                <td className="px-5 py-3.5 align-top">
                                    {doc.status === "checked_out" && doc.activeCheckout ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="bg-brand-100 text-brand-700 text-[10px] font-bold">
                                                    {getInitials(doc.activeCheckout.employeeName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-text-dark">{doc.activeCheckout.employeeName}</div>
                                                <div className="text-[11px] text-amber-600 font-medium">Since {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(doc.activeCheckout.checkedOutAt))}</div>
                                            </div>
                                        </div>
                                    ) : doc.status === "missing" ? (
                                        <div>
                                            <div className="font-semibold text-text-dark">Unknown Location</div>
                                            <div className="text-[11px] text-red-500 font-medium">Reported Missing</div>
                                        </div>
                                    ) : doc.status === "returned_to_client" ? (
                                        <div>
                                            <div className="font-semibold text-text-dark">Client Possession</div>
                                            <div className="text-[11px] text-text-muted">Returned</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="font-semibold text-text-dark">{doc.location?.name || "Unassigned"}</div>
                                            <div className="text-[11px] text-text-muted">In Office</div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
